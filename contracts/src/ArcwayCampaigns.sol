// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @title Arcway Campaigns
/// @notice Projects on Arc lock a USDC prize pool in escrow and reward people who complete
///         verifiable tasks. Entry is always free. Three ways to share a pool:
///         - FirstCome: a fixed reward, paid the moment an eligible wallet joins, until the pool is used.
///         - Raffle:    after the end, N winners are drawn from all entries; results are claimed with a proof.
///         - Split:     after the end, the pool is split equally between entries (capped at maxWinners).
/// @dev Trust model, kept deliberately narrow:
///      - Arcway's verifier signs an entry only after checking the tasks on chain, and publishes
///        the results of Raffle/Split campaigns. It can never move funds to itself.
///      - Only the project that funded a campaign can take money back, and only: before it starts,
///        after it ended with no entries, if results are not published in time, or after the claim window.
///      - The owner only manages verifiers. There is no fee and no admin withdrawal.
contract ArcwayCampaigns {
    enum Mode {
        FirstCome,
        Raffle,
        Split
    }

    struct Campaign {
        address creator;
        Mode mode;
        uint64 start;
        uint64 end;
        uint64 claimUntil;
        uint32 maxWinners;
        uint32 entries;
        bool refunded;
        uint128 pool;
        uint128 paid;
        uint128 allocated;
        bytes32 resultsRoot;
        bytes32 metadataHash;
    }

    uint256 public constant MIN_DURATION = 1 hours;
    uint256 public constant MAX_DURATION = 90 days;
    uint256 public constant MAX_LEAD_TIME = 90 days;
    uint256 public constant MIN_CLAIM_WINDOW = 7 days;
    uint256 public constant MAX_CLAIM_WINDOW = 90 days;
    /// @notice If a Raffle/Split has no published results this long after it ends, the project can take the pool back.
    uint256 public constant RESULTS_TIMEOUT = 3 days; // always shorter than MIN_CLAIM_WINDOW
    uint256 public constant MAX_WINNERS = 10_000;
    uint256 public constant MAX_RAFFLE_ENTRIES = 50_000;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant ENTRY_TYPEHASH = keccak256("Entry(uint256 campaignId,address user,uint256 deadline)");
    bytes32 private constant NAME_HASH = keccak256("ArcwayCampaigns");
    bytes32 private constant VERSION_HASH = keccak256("1");
    uint256 private constant HALF_N = 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0;

    IERC20Minimal public immutable usdc;
    uint256 private immutable cachedChainId;
    bytes32 private immutable cachedDomainSeparator;

    address public owner;
    address public pendingOwner;
    mapping(address => bool) public verifier;

    uint256 public campaignCount;
    mapping(uint256 => Campaign) private campaigns;
    mapping(uint256 => mapping(address => bool)) public entered;
    mapping(uint256 => mapping(address => bool)) public claimed;

    uint256 private locked = 1;

    event CampaignCreated(
        uint256 indexed id,
        address indexed creator,
        Mode mode,
        uint256 pool,
        uint256 maxWinners,
        uint64 start,
        uint64 end,
        uint64 claimUntil,
        bytes32 metadataHash
    );
    event Entered(uint256 indexed id, address indexed user, uint256 entryNumber);
    event Claimed(uint256 indexed id, address indexed user, uint256 amount);
    event ResultsPublished(uint256 indexed id, bytes32 root, uint256 total);
    event Refunded(uint256 indexed id, address indexed creator, uint256 amount);
    event VerifierUpdated(address indexed verifier, bool allowed);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier nonReentrant() {
        require(locked == 1, "reentrant");
        locked = 2;
        _;
        locked = 1;
    }

    constructor(address usdcToken) {
        require(usdcToken != address(0), "zero token");
        usdc = IERC20Minimal(usdcToken);
        owner = msg.sender;
        cachedChainId = block.chainid;
        cachedDomainSeparator = _buildDomainSeparator();
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ------------------------------------------------------------------ projects

    /// @notice Lock `pool` USDC (approve this contract first) and open a campaign.
    /// @param claimWindow How long winners have to claim after `end`; leftovers return to the project after it.
    /// @param metadataHash keccak256 of the campaign's public description (title, tasks, rules).
    function createCampaign(
        uint128 pool,
        Mode mode,
        uint32 maxWinners,
        uint64 start,
        uint64 end,
        uint64 claimWindow,
        bytes32 metadataHash
    ) external nonReentrant returns (uint256 id) {
        require(maxWinners > 0 && maxWinners <= MAX_WINNERS, "bad winners");
        require(start >= block.timestamp && start <= block.timestamp + MAX_LEAD_TIME, "bad start");
        require(end >= start + MIN_DURATION && end <= start + MAX_DURATION, "bad duration");
        require(claimWindow >= MIN_CLAIM_WINDOW && claimWindow <= MAX_CLAIM_WINDOW, "bad claim window");
        require(pool >= maxWinners, "pool too small");
        if (mode == Mode.FirstCome) require(pool % maxWinners == 0, "pool must split evenly");

        id = ++campaignCount;
        campaigns[id] = Campaign({
            creator: msg.sender,
            mode: mode,
            start: start,
            end: end,
            claimUntil: end + claimWindow,
            maxWinners: maxWinners,
            entries: 0,
            refunded: false,
            pool: pool,
            paid: 0,
            allocated: 0,
            resultsRoot: bytes32(0),
            metadataHash: metadataHash
        });
        _pull(msg.sender, pool);
        emit CampaignCreated(id, msg.sender, mode, pool, maxWinners, start, end, end + claimWindow, metadataHash);
    }

    /// @notice Return whatever is left of the pool to the project, when the rules allow it.
    function refund(uint256 id) external nonReentrant {
        Campaign storage c = _get(id);
        require(msg.sender == c.creator, "not creator");
        require(!c.refunded, "already refunded");
        require(refundable(id), "not refundable yet");
        uint256 amount = c.pool - c.paid;
        c.refunded = true;
        c.paid = c.pool;
        if (amount > 0) _push(c.creator, amount);
        emit Refunded(id, c.creator, amount);
    }

    /// @notice Before it starts; after it ends with no entries; results overdue; or after the claim window.
    function refundable(uint256 id) public view returns (bool) {
        Campaign storage c = _get(id);
        if (c.refunded) return false;
        if (block.timestamp < c.start) return true;
        if (block.timestamp >= c.end && c.entries == 0) return true;
        if (c.mode != Mode.FirstCome && c.resultsRoot == bytes32(0) && block.timestamp >= c.end + RESULTS_TIMEOUT) return true;
        return block.timestamp >= c.claimUntil;
    }

    // ------------------------------------------------------------------ participants

    /// @notice Join with the verifier's signature proving the tasks are done. First-come campaigns pay here.
    function enter(uint256 id, uint256 deadline, bytes calldata signature) external nonReentrant {
        Campaign storage c = _get(id);
        require(!c.refunded, "campaign closed");
        require(block.timestamp >= c.start, "not started");
        require(block.timestamp < c.end, "ended");
        require(block.timestamp <= deadline, "signature expired");
        require(!entered[id][msg.sender], "already entered");
        require(verifier[_recover(entryDigest(id, msg.sender, deadline), signature)], "bad signature");

        uint32 n = c.entries + 1;
        if (c.mode == Mode.Raffle) require(n <= MAX_RAFFLE_ENTRIES, "campaign full");
        else require(n <= c.maxWinners, "campaign full");

        entered[id][msg.sender] = true;
        c.entries = n;
        emit Entered(id, msg.sender, n);

        if (c.mode == Mode.FirstCome) {
            uint256 reward = c.pool / c.maxWinners;
            claimed[id][msg.sender] = true;
            c.paid += uint128(reward);
            _push(msg.sender, reward);
            emit Claimed(id, msg.sender, reward);
        }
    }

    /// @notice Claim a Raffle/Split reward with the proof from the published results.
    function claim(uint256 id, uint256 amount, bytes32[] calldata proof) external nonReentrant {
        Campaign storage c = _get(id);
        require(c.mode != Mode.FirstCome, "paid on entry");
        require(c.resultsRoot != bytes32(0), "no results yet");
        require(!c.refunded && block.timestamp < c.claimUntil, "claim window closed");
        require(!claimed[id][msg.sender], "already claimed");
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(id, msg.sender, amount))));
        require(_verify(proof, c.resultsRoot, leaf), "bad proof");

        claimed[id][msg.sender] = true;
        c.paid += uint128(amount);
        require(c.paid <= c.pool, "over pool");
        _push(msg.sender, amount);
        emit Claimed(id, msg.sender, amount);
    }

    // ------------------------------------------------------------------ verifier

    /// @notice Publish the Merkle root of (campaignId, wallet, amount) results once a Raffle/Split has ended.
    function publishResults(uint256 id, bytes32 root, uint128 total) external {
        require(verifier[msg.sender], "not verifier");
        Campaign storage c = _get(id);
        require(c.mode != Mode.FirstCome, "no results for first-come");
        require(block.timestamp >= c.end, "not ended");
        require(!c.refunded && block.timestamp < c.claimUntil, "closed");
        require(c.resultsRoot == bytes32(0), "already published");
        require(root != bytes32(0) && total > 0 && total <= c.pool, "bad results");
        c.resultsRoot = root;
        c.allocated = total;
        emit ResultsPublished(id, root, total);
    }

    // ------------------------------------------------------------------ admin (verifiers only; never funds)

    function setVerifier(address account, bool allowed) external onlyOwner {
        require(account != address(0), "zero verifier");
        verifier[account] = allowed;
        emit VerifierUpdated(account, allowed);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "zero owner");
        pendingOwner = nextOwner;
        emit OwnershipTransferStarted(owner, nextOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }

    // ------------------------------------------------------------------ views

    function getCampaign(uint256 id) external view returns (Campaign memory) {
        return _get(id);
    }

    function domainSeparator() public view returns (bytes32) {
        return block.chainid == cachedChainId ? cachedDomainSeparator : _buildDomainSeparator();
    }

    function entryDigest(uint256 id, address user, uint256 deadline) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19\x01", domainSeparator(), keccak256(abi.encode(ENTRY_TYPEHASH, id, user, deadline)))
        );
    }

    // ------------------------------------------------------------------ internals

    function _get(uint256 id) private view returns (Campaign storage c) {
        c = campaigns[id];
        require(c.creator != address(0), "no campaign");
    }

    function _buildDomainSeparator() private view returns (bytes32) {
        return keccak256(abi.encode(DOMAIN_TYPEHASH, NAME_HASH, VERSION_HASH, block.chainid, address(this)));
    }

    function _recover(bytes32 digest, bytes calldata sig) private pure returns (address signer) {
        require(sig.length == 65, "bad signature");
        bytes32 r = bytes32(sig[0:32]);
        bytes32 s = bytes32(sig[32:64]);
        uint8 v = uint8(sig[64]);
        require(uint256(s) <= HALF_N && (v == 27 || v == 28), "bad signature");
        signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "bad signature");
    }

    function _verify(bytes32[] calldata proof, bytes32 root, bytes32 leaf) private pure returns (bool) {
        bytes32 h = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 p = proof[i];
            h = h < p ? keccak256(abi.encodePacked(h, p)) : keccak256(abi.encodePacked(p, h));
        }
        return h == root;
    }

    function _pull(address from, uint256 amount) private {
        (bool ok, bytes memory data) =
            address(usdc).call(abi.encodeCall(IERC20Minimal.transferFrom, (from, address(this), amount)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer in failed");
    }

    function _push(address to, uint256 amount) private {
        (bool ok, bytes memory data) = address(usdc).call(abi.encodeCall(IERC20Minimal.transfer, (to, amount)));
        require(ok && (data.length == 0 || abi.decode(data, (bool))), "transfer out failed");
    }
}
