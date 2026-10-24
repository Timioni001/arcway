// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./interfaces/IArcwayBounties.sol";

/// @dev Minimal ERC-20 surface needed for USDC interactions (local to ArcwayBounties).
interface IERC20BountiesMinimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title ArcwayBounties — quests that pay
/// @notice Anyone escrows USDC behind an Arcway quest. Every wallet whose ArcwayPassport has that
///         quest recorded (completedQuest(user, questId) == true) can claim exactly one reward,
///         first come first served, until rewards run out or the bounty expires. After expiry the
///         sponsor may close the bounty and reclaim unclaimed funds. The passport is the only judge.
/// @dev No owner, admin, pause, fees, proxies, upgradeability, selfdestruct, delegatecall,
///      receive/fallback, or ETH. External calls only to USDC and passport.completedQuest.
contract ArcwayBounties is IArcwayBounties {
    // ------------------------------------------------------------------ errors

    error ZeroAddress();
    error ZeroReward();
    error RewardOverflow();
    error BadMaxClaims();
    error BadExpiry();
    error TitleTooLong();
    error FeeOnTransferRejected();
    error UnknownBounty();
    error BountyClosedErr();
    error BountyExpiredErr();
    error NoneLeft();
    error AlreadyClaimed();
    error QuestNotCompleted();
    error NotExpiredYet();
    error AlreadyClosedErr();
    error NotSponsor();
    error ExtraClaimsZero();
    error MaxClaimsExceeded();
    error Reentrant();

    // ------------------------------------------------------------------ constants

    uint256 public constant MAX_CLAIMS_LIMIT = 10_000;
    uint256 public constant MAX_EXPIRY_DELTA = 180 days;
    uint256 public constant MAX_TITLE_BYTES  = 80;

    // ------------------------------------------------------------------ state

    address public immutable usdc;
    address public immutable passport;

    uint256 private _count;
    mapping(uint256 => Bounty)                   private _bounties;
    mapping(uint256 => mapping(address => bool)) private _claimed;

    uint256 private _lock = 1;

    // ------------------------------------------------------------------ constructor

    constructor(address usdc_, address passport_) {
        if (usdc_ == address(0) || passport_ == address(0)) revert ZeroAddress();
        usdc     = usdc_;
        passport = passport_;
    }

    // ------------------------------------------------------------------ modifiers

    modifier nonReentrant() {
        if (_lock != 1) revert Reentrant();
        _lock = 2;
        _;
        _lock = 1;
    }

    // ------------------------------------------------------------------ external: write

    /// @notice Escrow `rewardPerClaim * maxClaims` USDC behind `questId`.
    /// @dev Reverts on zero reward, reward overflow past uint128, 0 or >10 000 claims,
    ///      expiry not in (now, now + 180 days], title over 80 bytes, or fee-on-transfer token.
    ///      IDs start at 1.
    function create(
        bytes32  questId,
        uint256  rewardPerClaim,
        uint256  maxClaims,
        uint64   expiresAt,
        string calldata title
    ) external nonReentrant returns (uint256 id) {
        if (rewardPerClaim == 0)                                              revert ZeroReward();
        if (rewardPerClaim > type(uint128).max)                               revert RewardOverflow();
        if (maxClaims == 0 || maxClaims > MAX_CLAIMS_LIMIT)                   revert BadMaxClaims();
        if (expiresAt <= block.timestamp ||
            expiresAt > block.timestamp + MAX_EXPIRY_DELTA)                   revert BadExpiry();
        if (bytes(title).length > MAX_TITLE_BYTES)                            revert TitleTooLong();

        uint256 total = rewardPerClaim * maxClaims;
        _pullExact(msg.sender, total);

        id = ++_count;
        _bounties[id] = Bounty({
            sponsor:        msg.sender,
            questId:        questId,
            rewardPerClaim: uint128(rewardPerClaim),
            maxClaims:      uint32(maxClaims),
            claims:         0,
            expiresAt:      expiresAt,
            closed:         false,
            title:          title
        });

        emit BountyCreated(id, msg.sender, questId, rewardPerClaim, maxClaims, expiresAt, title);
    }

    /// @notice Add `extraClaims` more rewards to an open, unexpired bounty. Anyone may top up.
    /// @dev Reverts if bounty is unknown, closed, expired, extraClaims is zero,
    ///      or the new maxClaims would exceed 10 000.
    function fund(uint256 id, uint256 extraClaims) external nonReentrant {
        if (extraClaims == 0) revert ExtraClaimsZero();
        Bounty storage b = _get(id);
        if (b.closed)                              revert BountyClosedErr();
        if (block.timestamp >= b.expiresAt)        revert BountyExpiredErr();
        uint256 newMax = uint256(b.maxClaims) + extraClaims;
        if (newMax > MAX_CLAIMS_LIMIT)             revert MaxClaimsExceeded();

        uint256 total = uint256(b.rewardPerClaim) * extraClaims;
        _pullExact(msg.sender, total);

        b.maxClaims = uint32(newMax);
        emit BountyFunded(id, extraClaims);
    }

    /// @notice Pay the caller one reward if their passport has the quest and they haven't claimed.
    /// @dev Checks-effects-interactions. Reverts if unknown, closed, expired, none left, already
    ///      claimed, or passport reports the quest is not completed.
    function claim(uint256 id) external nonReentrant {
        Bounty storage b = _get(id);
        if (b.closed)                                                          revert BountyClosedErr();
        if (block.timestamp >= b.expiresAt)                                   revert BountyExpiredErr();
        if (b.claims >= b.maxClaims)                                          revert NoneLeft();
        if (_claimed[id][msg.sender])                                         revert AlreadyClaimed();
        if (!IArcwayPassportView(passport).completedQuest(msg.sender, b.questId)) revert QuestNotCompleted();

        // effects
        _claimed[id][msg.sender] = true;
        b.claims += 1;

        // interactions
        uint256 reward = b.rewardPerClaim;
        _push(msg.sender, reward);
        emit BountyClaimed(id, msg.sender, reward);
    }

    /// @notice After expiry, the sponsor takes back unclaimed funds. Once only.
    /// @dev Reverts if not the sponsor, not yet expired, or already closed.
    function close(uint256 id) external nonReentrant {
        Bounty storage b = _get(id);
        if (msg.sender != b.sponsor)        revert NotSponsor();
        if (block.timestamp < b.expiresAt)  revert NotExpiredYet();
        if (b.closed)                       revert AlreadyClosedErr();

        b.closed = true;
        uint256 remaining = uint256(b.maxClaims - b.claims) * uint256(b.rewardPerClaim);
        if (remaining > 0) _push(b.sponsor, remaining);
        emit BountyClosed(id, remaining);
    }

    // ------------------------------------------------------------------ external: views

    /// @notice Returns the full Bounty struct for `id`. Reverts on unknown id.
    function bounty(uint256 id) external view returns (Bounty memory) {
        return _get(id);
    }

    /// @notice Total number of bounties ever created (including closed ones).
    function bountyCount() external view returns (uint256) {
        return _count;
    }

    /// @notice Whether `user` has already claimed from bounty `id`.
    function hasClaimed(uint256 id, address user) external view returns (bool) {
        return _claimed[id][user];
    }

    /// @notice True when `user` could call claim(id) right now without reverting.
    ///         Never reverts: an unknown id returns false.
    function canClaim(uint256 id, address user) external view returns (bool) {
        if (id == 0 || id > _count) return false;
        Bounty storage b = _bounties[id];
        if (b.sponsor == address(0))               return false;
        if (b.closed)                              return false;
        if (block.timestamp >= b.expiresAt)        return false;
        if (b.claims >= b.maxClaims)               return false;
        if (_claimed[id][user])                    return false;
        try IArcwayPassportView(passport).completedQuest(user, b.questId) returns (bool ok) {
            return ok;
        } catch {
            return false;
        }
    }

    // ------------------------------------------------------------------ internals

    function _get(uint256 id) private view returns (Bounty storage b) {
        b = _bounties[id];
        if (b.sponsor == address(0)) revert UnknownBounty();
    }

    /// @dev Pull `amount` from `from`. Rejects fee-on-transfer tokens by checking balance delta.
    function _pullExact(address from, uint256 amount) private {
        uint256 before = IERC20BountiesMinimal(usdc).balanceOf(address(this));
        (bool ok, bytes memory data) =
            usdc.call(abi.encodeCall(IERC20BountiesMinimal.transferFrom, (from, address(this), amount)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer in failed");
        uint256 delta = IERC20BountiesMinimal(usdc).balanceOf(address(this)) - before;
        if (delta != amount) revert FeeOnTransferRejected();
    }

    function _push(address to, uint256 amount) private {
        (bool ok, bytes memory data) =
            usdc.call(abi.encodeCall(IERC20BountiesMinimal.transfer, (to, amount)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer out failed");
    }
}
