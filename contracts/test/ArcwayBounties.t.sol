// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcwayBounties.sol";
import "../src/ArcwayPassport.sol";

contract BountyUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) public virtual returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

/// Takes 1% on every transfer in, to prove the escrow refuses it.
contract FeeUSDC is BountyUSDC {
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount - amount / 100;
        return true;
    }
}

/// Calls back into claim() during transfer, to prove the reentrancy guard holds.
contract ReentrantUSDC is BountyUSDC {
    ArcwayBounties public target;
    uint256 public targetId;
    bool public reentered;

    function arm(ArcwayBounties t, uint256 id) external {
        target = t;
        targetId = id;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (address(target) != address(0) && !reentered) {
            reentered = true;
            try target.claim(targetId) {} catch {}
        }
        return super.transfer(to, amount);
    }
}

contract BountiesBase is Test {
    ArcwayBounties bounties;
    ArcwayPassport passport;
    BountyUSDC usdc;

    address verifier = makeAddr("verifier");
    address sponsor = makeAddr("sponsor");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    bytes32 constant QUEST = keccak256("first-swap");
    bytes32 constant OTHER = keccak256("bridge-in");

    function setUp() public virtual {
        usdc = new BountyUSDC();
        passport = new ArcwayPassport();
        passport.setVerifier(verifier, true);
        bounties = new ArcwayBounties(address(usdc), address(passport));
        usdc.mint(sponsor, 1_000_000e6);
        vm.prank(sponsor);
        usdc.approve(address(bounties), type(uint256).max);
    }

    function _create(uint256 reward, uint256 max) internal returns (uint256) {
        vm.prank(sponsor);
        return bounties.create(QUEST, reward, max, uint64(block.timestamp + 7 days), "Try your first swap");
    }

    function _complete(address user, bytes32 quest) internal {
        vm.prank(verifier);
        passport.completeQuest(user, quest, 25);
    }
}

contract ArcwayBountiesTest is BountiesBase {
    function testConstructorRejectsZero() public {
        vm.expectRevert(ArcwayBounties.ZeroAddress.selector);
        new ArcwayBounties(address(0), address(passport));
        vm.expectRevert(ArcwayBounties.ZeroAddress.selector);
        new ArcwayBounties(address(usdc), address(0));
    }

    function testCreateEscrowsAndStores() public {
        uint64 exp = uint64(block.timestamp + 7 days);
        vm.expectEmit(true, true, true, true);
        emit IArcwayBounties.BountyCreated(1, sponsor, QUEST, 2e6, 5, exp, "Try your first swap");
        uint256 id = _create(2e6, 5);
        assertEq(id, 1);
        assertEq(bounties.bountyCount(), 1);
        assertEq(usdc.balanceOf(address(bounties)), 10e6);
        IArcwayBounties.Bounty memory b = bounties.bounty(id);
        assertEq(b.sponsor, sponsor);
        assertEq(b.questId, QUEST);
        assertEq(b.rewardPerClaim, 2e6);
        assertEq(b.maxClaims, 5);
        assertEq(b.claims, 0);
        assertEq(b.expiresAt, exp);
        assertFalse(b.closed);
        assertEq(b.title, "Try your first swap");
    }

    function testCreateValidation() public {
        uint64 exp = uint64(block.timestamp + 1 days);
        vm.startPrank(sponsor);
        vm.expectRevert(ArcwayBounties.ZeroReward.selector);
        bounties.create(QUEST, 0, 1, exp, "");
        vm.expectRevert(ArcwayBounties.RewardOverflow.selector);
        bounties.create(QUEST, uint256(type(uint128).max) + 1, 1, exp, "");
        vm.expectRevert(ArcwayBounties.BadMaxClaims.selector);
        bounties.create(QUEST, 1e6, 0, exp, "");
        vm.expectRevert(ArcwayBounties.BadMaxClaims.selector);
        bounties.create(QUEST, 1, 10_001, exp, "");
        vm.expectRevert(ArcwayBounties.BadExpiry.selector);
        bounties.create(QUEST, 1e6, 1, uint64(block.timestamp), "");
        vm.expectRevert(ArcwayBounties.BadExpiry.selector);
        bounties.create(QUEST, 1e6, 1, uint64(block.timestamp + 180 days + 1), "");
        vm.expectRevert(ArcwayBounties.TitleTooLong.selector);
        bounties.create(QUEST, 1e6, 1, exp, string(new bytes(81)));
        // Edges that are allowed
        bounties.create(QUEST, 1, 10_000, uint64(block.timestamp + 180 days), string(new bytes(80)));
        vm.stopPrank();
    }

    function testCreateNeedsAllowanceAndBalance() public {
        vm.prank(alice);
        vm.expectRevert("transfer in failed");
        bounties.create(QUEST, 1e6, 1, uint64(block.timestamp + 1 days), "");
    }

    function testClaimPaysOnceAfterQuest() public {
        uint256 id = _create(2e6, 2);
        assertFalse(bounties.canClaim(id, alice));
        vm.prank(alice);
        vm.expectRevert(ArcwayBounties.QuestNotCompleted.selector);
        bounties.claim(id);

        _complete(alice, QUEST);
        assertTrue(bounties.canClaim(id, alice));
        vm.expectEmit(true, true, false, true);
        emit IArcwayBounties.BountyClaimed(id, alice, 2e6);
        vm.prank(alice);
        bounties.claim(id);
        assertEq(usdc.balanceOf(alice), 2e6);
        assertTrue(bounties.hasClaimed(id, alice));
        assertFalse(bounties.canClaim(id, alice));
        assertEq(bounties.bounty(id).claims, 1);

        vm.prank(alice);
        vm.expectRevert(ArcwayBounties.AlreadyClaimed.selector);
        bounties.claim(id);
    }

    function testOtherQuestDoesNotCount() public {
        uint256 id = _create(1e6, 2);
        _complete(alice, OTHER);
        assertFalse(bounties.canClaim(id, alice));
        vm.prank(alice);
        vm.expectRevert(ArcwayBounties.QuestNotCompleted.selector);
        bounties.claim(id);
    }

    function testRunsOut() public {
        uint256 id = _create(1e6, 1);
        _complete(alice, QUEST);
        _complete(bob, QUEST);
        vm.prank(alice);
        bounties.claim(id);
        assertFalse(bounties.canClaim(id, bob));
        vm.prank(bob);
        vm.expectRevert(ArcwayBounties.NoneLeft.selector);
        bounties.claim(id);
    }

    function testNoClaimsAfterExpiry() public {
        uint256 id = _create(1e6, 2);
        _complete(alice, QUEST);
        vm.warp(block.timestamp + 7 days);
        assertFalse(bounties.canClaim(id, alice));
        vm.prank(alice);
        vm.expectRevert(ArcwayBounties.BountyExpiredErr.selector);
        bounties.claim(id);
    }

    function testUnknownBounty() public {
        assertFalse(bounties.canClaim(0, alice));
        assertFalse(bounties.canClaim(99, alice));
        vm.expectRevert(ArcwayBounties.UnknownBounty.selector);
        bounties.bounty(1);
        vm.expectRevert(ArcwayBounties.UnknownBounty.selector);
        bounties.claim(1);
        vm.expectRevert(ArcwayBounties.UnknownBounty.selector);
        bounties.fund(1, 1);
        vm.expectRevert(ArcwayBounties.UnknownBounty.selector);
        bounties.close(1);
    }

    function testFundByAnyone() public {
        uint256 id = _create(1e6, 1);
        usdc.mint(bob, 5e6);
        vm.startPrank(bob);
        usdc.approve(address(bounties), 5e6);
        vm.expectEmit(true, false, false, true);
        emit IArcwayBounties.BountyFunded(id, 3);
        bounties.fund(id, 3);
        vm.stopPrank();
        assertEq(bounties.bounty(id).maxClaims, 4);
        assertEq(usdc.balanceOf(address(bounties)), 4e6);
        assertEq(usdc.balanceOf(bob), 2e6);
    }

    function testFundValidation() public {
        uint256 id = _create(1e6, 9_999);
        vm.startPrank(sponsor);
        vm.expectRevert(ArcwayBounties.ExtraClaimsZero.selector);
        bounties.fund(id, 0);
        vm.expectRevert(ArcwayBounties.MaxClaimsExceeded.selector);
        bounties.fund(id, 2);
        bounties.fund(id, 1);
        vm.warp(block.timestamp + 7 days);
        vm.expectRevert(ArcwayBounties.BountyExpiredErr.selector);
        bounties.fund(id, 1);
        bounties.close(id);
        vm.expectRevert(ArcwayBounties.BountyClosedErr.selector);
        bounties.fund(id, 1);
        vm.stopPrank();
    }

    function testCloseRefundsUnclaimed() public {
        uint256 id = _create(2e6, 3);
        _complete(alice, QUEST);
        vm.prank(alice);
        bounties.claim(id);
        uint256 before = usdc.balanceOf(sponsor);

        vm.prank(sponsor);
        vm.expectRevert(ArcwayBounties.NotExpiredYet.selector);
        bounties.close(id);

        vm.warp(block.timestamp + 7 days);
        vm.prank(alice);
        vm.expectRevert(ArcwayBounties.NotSponsor.selector);
        bounties.close(id);

        vm.expectEmit(true, false, false, true);
        emit IArcwayBounties.BountyClosed(id, 4e6);
        vm.prank(sponsor);
        bounties.close(id);
        assertEq(usdc.balanceOf(sponsor) - before, 4e6);
        assertEq(usdc.balanceOf(address(bounties)), 0);
        assertTrue(bounties.bounty(id).closed);

        vm.prank(sponsor);
        vm.expectRevert(ArcwayBounties.AlreadyClosedErr.selector);
        bounties.close(id);
    }

    function testCloseWhenFullyClaimedRefundsNothing() public {
        uint256 id = _create(1e6, 1);
        _complete(alice, QUEST);
        vm.prank(alice);
        bounties.claim(id);
        vm.warp(block.timestamp + 7 days);
        uint256 before = usdc.balanceOf(sponsor);
        vm.prank(sponsor);
        bounties.close(id);
        assertEq(usdc.balanceOf(sponsor), before);
    }

    function testBountiesAreIsolated() public {
        uint256 a = _create(1e6, 1);
        uint256 b = _create(3e6, 1);
        _complete(alice, QUEST);
        vm.startPrank(alice);
        bounties.claim(a);
        bounties.claim(b);
        vm.stopPrank();
        assertEq(usdc.balanceOf(alice), 4e6);
        assertEq(usdc.balanceOf(address(bounties)), 0);
    }

    function testRejectsFeeOnTransferToken() public {
        FeeUSDC fee = new FeeUSDC();
        ArcwayBounties b = new ArcwayBounties(address(fee), address(passport));
        fee.mint(sponsor, 100e6);
        vm.startPrank(sponsor);
        fee.approve(address(b), type(uint256).max);
        vm.expectRevert(ArcwayBounties.FeeOnTransferRejected.selector);
        b.create(QUEST, 1e6, 10, uint64(block.timestamp + 1 days), "");
        vm.stopPrank();
    }

    function testReentrantClaimIsBlocked() public {
        ReentrantUSDC evil = new ReentrantUSDC();
        ArcwayBounties b = new ArcwayBounties(address(evil), address(passport));
        evil.mint(sponsor, 10e6);
        vm.startPrank(sponsor);
        evil.approve(address(b), type(uint256).max);
        uint256 id = b.create(QUEST, 1e6, 5, uint64(block.timestamp + 1 days), "");
        vm.stopPrank();
        _complete(address(evil), QUEST);
        evil.arm(b, id);
        _complete(alice, QUEST);
        vm.prank(alice);
        b.claim(id);
        assertTrue(evil.reentered());
        assertEq(b.bounty(id).claims, 1);
        assertEq(evil.balanceOf(address(b)), 4e6);
    }

    function testFuzzEscrowAccounting(uint96 reward, uint16 max, uint8 claimers) public {
        reward = uint96(bound(reward, 1, 1_000e6));
        max = uint16(bound(max, 1, 200));
        claimers = uint8(bound(claimers, 0, 50));
        usdc.mint(sponsor, uint256(reward) * max);
        uint256 id = _create(reward, max);
        uint256 paid;
        for (uint256 i = 0; i < claimers; i++) {
            address u = address(uint160(0x1000 + i));
            _complete(u, QUEST);
            vm.prank(u);
            if (i < max) {
                bounties.claim(id);
                paid += reward;
            } else {
                vm.expectRevert(ArcwayBounties.NoneLeft.selector);
                bounties.claim(id);
            }
        }
        assertEq(usdc.balanceOf(address(bounties)), uint256(reward) * max - paid);
        vm.warp(block.timestamp + 7 days);
        vm.prank(sponsor);
        bounties.close(id);
        assertEq(usdc.balanceOf(address(bounties)), 0);
    }
}

/// Random create / fund / claim / close / time-warp sequences against a shared escrow.
contract BountiesHandler is Test {
    ArcwayBounties public bounties;
    ArcwayPassport public passport;
    BountyUSDC public usdc;
    address public verifier;
    address[] public actors;
    bytes32[2] quests = [keccak256("first-swap"), keccak256("bridge-in")];

    constructor(ArcwayBounties b, ArcwayPassport p, BountyUSDC u, address v) {
        bounties = b;
        passport = p;
        usdc = u;
        verifier = v;
        for (uint256 i = 0; i < 5; i++) {
            address a = address(uint160(0xA000 + i));
            actors.push(a);
            u.mint(a, 1e15);
            vm.prank(a);
            u.approve(address(b), type(uint256).max);
        }
    }

    function create(uint256 who, uint256 q, uint256 reward, uint256 max, uint256 days_) external {
        vm.prank(actors[who % actors.length]);
        bounties.create(quests[q % 2], bound(reward, 1, 100e6), bound(max, 1, 50), uint64(block.timestamp + bound(days_, 1, 30) * 1 days), "");
    }

    function fund(uint256 who, uint256 id, uint256 extra) external {
        uint256 n = bounties.bountyCount();
        if (n == 0) return;
        vm.prank(actors[who % actors.length]);
        try bounties.fund(bound(id, 1, n), bound(extra, 1, 20)) {} catch {}
    }

    function complete(uint256 who, uint256 q) external {
        address a = actors[who % actors.length];
        bytes32 quest = quests[q % 2];
        if (passport.completedQuest(a, quest)) return;
        vm.prank(verifier);
        passport.completeQuest(a, quest, 10);
    }

    function claim(uint256 who, uint256 id) external {
        uint256 n = bounties.bountyCount();
        if (n == 0) return;
        vm.prank(actors[who % actors.length]);
        try bounties.claim(bound(id, 1, n)) {} catch {}
    }

    function close(uint256 id) external {
        uint256 n = bounties.bountyCount();
        if (n == 0) return;
        id = bound(id, 1, n);
        vm.prank(bounties.bounty(id).sponsor);
        try bounties.close(id) {} catch {}
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 1, 10 days));
    }
}

contract ArcwayBountiesInvariant is BountiesBase {
    BountiesHandler handler;

    function setUp() public override {
        super.setUp();
        handler = new BountiesHandler(bounties, passport, usdc, verifier);
        passport.setVerifier(address(handler), true);
        targetContract(address(handler));
    }

    /// The contract always holds exactly what open bounties still owe, never more, never less.
    function invariant_escrowMatchesOpenBounties() public view {
        uint256 owed;
        uint256 n = bounties.bountyCount();
        for (uint256 i = 1; i <= n; i++) {
            IArcwayBounties.Bounty memory b = bounties.bounty(i);
            assertLe(b.claims, b.maxClaims);
            if (!b.closed) owed += uint256(b.maxClaims - b.claims) * b.rewardPerClaim;
        }
        assertEq(usdc.balanceOf(address(bounties)), owed);
    }
}
