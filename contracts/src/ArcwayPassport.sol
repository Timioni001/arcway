// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Arcway Passport
/// @notice Minimal on-chain reputation registry for verified Arc ecosystem activity.
/// @dev Quest verification is intentionally separated from the registry. A verifier
///      can authorize a completion, while the user remains the owner of their record.
contract ArcwayPassport {
    struct Profile {
        uint256 xp;
        uint256 completedCount;
        uint256 createdAt;
    }

    /// @notice Upper bound on XP for a single quest, so a leaked verifier key can't mint unbounded XP per call.
    uint256 public constant MAX_XP_PER_QUEST = 1_000;

    address public owner;
    /// @notice Set by transferOwnership; becomes owner only after acceptOwnership (prevents typos locking the contract).
    address public pendingOwner;
    mapping(address => Profile) public profiles;
    mapping(address => mapping(bytes32 => bool)) public completedQuest;
    mapping(address => mapping(bytes32 => bool)) public hasBadge;
    mapping(address => bool) public verifier;

    event QuestCompleted(address indexed user, bytes32 indexed questId, uint256 xpAwarded);
    event BadgeAwarded(address indexed user, bytes32 indexed badgeId);
    event VerifierUpdated(address indexed verifier, bool allowed);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyVerifier() {
        require(verifier[msg.sender], "not verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function setVerifier(address account, bool allowed) external onlyOwner {
        require(account != address(0), "zero verifier");
        verifier[account] = allowed;
        emit VerifierUpdated(account, allowed);
    }

    function completeQuest(address user, bytes32 questId, uint256 xp) external onlyVerifier {
        require(user != address(0), "zero user");
        require(xp <= MAX_XP_PER_QUEST, "xp too high");
        require(!completedQuest[user][questId], "already complete");

        completedQuest[user][questId] = true;
        Profile storage p = profiles[user];
        if (p.createdAt == 0) p.createdAt = block.timestamp;
        p.xp += xp;
        p.completedCount += 1;

        emit QuestCompleted(user, questId, xp);
    }

    function awardBadge(address user, bytes32 badgeId) external onlyVerifier {
        require(user != address(0), "zero user");
        require(!hasBadge[user][badgeId], "already awarded");
        hasBadge[user][badgeId] = true;
        emit BadgeAwarded(user, badgeId);
    }

    /// @notice Step 1 of 2: propose a new owner. They must call acceptOwnership.
    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "zero owner");
        pendingOwner = nextOwner;
        emit OwnershipTransferStarted(owner, nextOwner);
    }

    /// @notice Step 2 of 2: the proposed owner accepts.
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }
}
