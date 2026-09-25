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

    address public owner;
    mapping(address => Profile) public profiles;
    mapping(address => mapping(bytes32 => bool)) public completedQuest;
    mapping(address => mapping(bytes32 => bool)) public hasBadge;

    event QuestCompleted(address indexed user, bytes32 indexed questId, uint256 xpAwarded);
    event BadgeAwarded(address indexed user, bytes32 indexed badgeId);
    event VerifierUpdated(address indexed verifier, bool allowed);

    mapping(address => bool) public verifier;

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
    }

    function setVerifier(address account, bool allowed) external onlyOwner {
        verifier[account] = allowed;
        emit VerifierUpdated(account, allowed);
    }

    function completeQuest(
        address user,
        bytes32 questId,
        uint256 xp
    ) external onlyVerifier {
        require(user != address(0), "zero user");
        require(!completedQuest[user][questId], "already complete");

        completedQuest[user][questId] = true;
        Profile storage p = profiles[user];
        if (p.createdAt == 0) p.createdAt = block.timestamp;
        p.xp += xp;
        p.completedCount += 1;

        emit QuestCompleted(user, questId, xp);
    }

    function awardBadge(address user, bytes32 badgeId) external onlyVerifier {
        require(!hasBadge[user][badgeId], "already awarded");
        hasBadge[user][badgeId] = true;
        emit BadgeAwarded(user, badgeId);
    }

    function transferOwnership(address nextOwner) external onlyOwner {
        require(nextOwner != address(0), "zero owner");
        owner = nextOwner;
    }
}
