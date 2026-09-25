// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcwayPassport.sol";

contract ArcwayPassportTest is Test {
    ArcwayPassport passport;
    address verifier = address(0xBEEF);
    address user = address(0xCAFE);

    function setUp() public {
        passport = new ArcwayPassport();
        passport.setVerifier(verifier, true);
    }

    function testQuestCompletion() public {
        vm.prank(verifier);
        passport.completeQuest(user, keccak256("first-tx"), 25);

        (uint256 xp, uint256 count, ) = passport.profiles(user);
        assertEq(xp, 25);
        assertEq(count, 1);
    }

    function testCannotCompleteTwice() public {
        bytes32 id = keccak256("first-tx");
        vm.startPrank(verifier);
        passport.completeQuest(user, id, 25);
        vm.expectRevert("already complete");
        passport.completeQuest(user, id, 25);
        vm.stopPrank();
    }
}
