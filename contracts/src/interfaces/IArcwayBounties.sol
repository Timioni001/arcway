// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice The one ArcwayPassport read bounties rely on: has `user` had `questId` recorded?
interface IArcwayPassportView {
    function completedQuest(address user, bytes32 questId) external view returns (bool);
}

/// @title IArcwayBounties — the spec Arc Studio builds ArcwayBounties against.
/// @notice Quests that pay. Anyone escrows USDC behind an Arcway quest; every wallet whose passport
///         has that quest recorded can claim one reward, first come first served, until the pool
///         runs out or expires. The passport is the only judge: no admin, no backend, no signatures.
interface IArcwayBounties {
    struct Bounty {
        address sponsor;
        bytes32 questId;        // keccak256 of the Arcway quest id, as recorded in ArcwayPassport
        uint128 rewardPerClaim; // USDC, 6 decimals
        uint32 maxClaims;
        uint32 claims;
        uint64 expiresAt;       // unix seconds; claims stop, the sponsor can close and refund
        bool closed;
        string title;           // what the sponsor wants people to know, e.g. "Try Tower Exchange"
    }

    event BountyCreated(uint256 indexed id, address indexed sponsor, bytes32 indexed questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string title);
    event BountyFunded(uint256 indexed id, uint256 addedClaims);
    event BountyClaimed(uint256 indexed id, address indexed claimer, uint256 amount);
    event BountyClosed(uint256 indexed id, uint256 refunded);

    function usdc() external view returns (address);
    function passport() external view returns (address);

    /// @notice Escrow `rewardPerClaim * maxClaims` USDC (pulled from the sponsor) behind `questId`.
    /// @dev Reverts on zero reward, zero or > 10,000 claims, expiry not in (now, now + 180 days],
    ///      or a title over 80 bytes. Ids start at 1.
    function create(bytes32 questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string calldata title) external returns (uint256 id);

    /// @notice Add `extraClaims` more rewards to an open, unexpired bounty (anyone may top up).
    function fund(uint256 id, uint256 extraClaims) external;

    /// @notice Pay the caller one reward if their passport has the quest and they haven't claimed.
    function claim(uint256 id) external;

    /// @notice After expiry, the sponsor takes back what was never claimed. Once only.
    function close(uint256 id) external;

    function bounty(uint256 id) external view returns (Bounty memory);
    function bountyCount() external view returns (uint256);
    function hasClaimed(uint256 id, address user) external view returns (bool);
    /// @notice True when `user` could claim right now (open, unexpired, rewards left, quest recorded, not claimed).
    function canClaim(uint256 id, address user) external view returns (bool);
}
