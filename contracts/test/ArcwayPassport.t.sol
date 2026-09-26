// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcwayPassport.sol";

contract ArcwayPassportTest is Test {
    ArcwayPassport passport;
    address verifier = address(0xBEEF);
    address user = address(0xCAFE);
    address stranger = address(0xBAD);

    event QuestCompleted(address indexed user, bytes32 indexed questId, uint256 xpAwarded);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setUp() public {
        passport = new ArcwayPassport();
        passport.setVerifier(verifier, true);
    }

    function testQuestCompletion() public {
        vm.expectEmit(true, true, false, true);
        emit QuestCompleted(user, keccak256("first-tx"), 25);
        vm.prank(verifier);
        passport.completeQuest(user, keccak256("first-tx"), 25);

        (uint256 xp, uint256 count, uint256 createdAt) = passport.profiles(user);
        assertEq(xp, 25);
        assertEq(count, 1);
        assertEq(createdAt, block.timestamp);
        assertTrue(passport.completedQuest(user, keccak256("first-tx")));
    }

    function testXpAccumulatesAcrossQuests() public {
        vm.startPrank(verifier);
        passport.completeQuest(user, keccak256("arrive-with-usdc"), 10);
        passport.completeQuest(user, keccak256("first-tx"), 25);
        vm.stopPrank();
        (uint256 xp, uint256 count,) = passport.profiles(user);
        assertEq(xp, 35);
        assertEq(count, 2);
    }

    function testCannotCompleteTwice() public {
        bytes32 id = keccak256("first-tx");
        vm.startPrank(verifier);
        passport.completeQuest(user, id, 25);
        vm.expectRevert("already complete");
        passport.completeQuest(user, id, 25);
        vm.stopPrank();
    }

    function testOnlyVerifierCanComplete() public {
        vm.prank(stranger);
        vm.expectRevert("not verifier");
        passport.completeQuest(user, keccak256("first-tx"), 25);
    }

    function testRevokedVerifierLosesAccess() public {
        passport.setVerifier(verifier, false);
        vm.prank(verifier);
        vm.expectRevert("not verifier");
        passport.completeQuest(user, keccak256("first-tx"), 25);
    }

    function testXpIsCapped() public {
        vm.startPrank(verifier);
        vm.expectRevert("xp too high");
        passport.completeQuest(user, keccak256("q"), 1_001);
        passport.completeQuest(user, keccak256("q"), 1_000);
        vm.stopPrank();
    }

    function testRejectsZeroAddresses() public {
        vm.startPrank(verifier);
        vm.expectRevert("zero user");
        passport.completeQuest(address(0), keccak256("q"), 1);
        vm.expectRevert("zero user");
        passport.awardBadge(address(0), keccak256("b"));
        vm.stopPrank();
        vm.expectRevert("zero verifier");
        passport.setVerifier(address(0), true);
    }

    function testOnlyOwnerSetsVerifier() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        passport.setVerifier(stranger, true);
    }

    function testBadgeOnce() public {
        vm.startPrank(verifier);
        passport.awardBadge(user, keccak256("explorer"));
        vm.expectRevert("already awarded");
        passport.awardBadge(user, keccak256("explorer"));
        vm.stopPrank();
        assertTrue(passport.hasBadge(user, keccak256("explorer")));
    }

    function testTwoStepOwnership() public {
        address next = address(0xA11CE);
        passport.transferOwnership(next);
        assertEq(passport.owner(), address(this), "owner unchanged until accepted");
        assertEq(passport.pendingOwner(), next);

        vm.prank(stranger);
        vm.expectRevert("not pending owner");
        passport.acceptOwnership();

        vm.expectEmit(true, true, false, false);
        emit OwnershipTransferred(address(this), next);
        vm.prank(next);
        passport.acceptOwnership();
        assertEq(passport.owner(), next);
        assertEq(passport.pendingOwner(), address(0));

        vm.expectRevert("not owner");
        passport.setVerifier(stranger, true);
    }

    function testOnlyOwnerStartsTransfer() public {
        vm.prank(stranger);
        vm.expectRevert("not owner");
        passport.transferOwnership(stranger);
        vm.expectRevert("zero owner");
        passport.transferOwnership(address(0));
    }
}
