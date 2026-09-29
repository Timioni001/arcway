// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import "../src/ArcwayCampaigns.sol";

contract MockUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract ArcwayCampaignsTest is Test {
    ArcwayCampaigns campaigns;
    MockUSDC usdc;
    uint256 verifierKey = 0xA11CE;
    address verifier;
    address project = address(0x9A0);
    address alice = address(0xA1);
    address bob = address(0xB0);
    address carol = address(0xCA);

    uint64 start;
    uint64 end;
    uint64 constant WINDOW = 7 days;

    function setUp() public {
        vm.warp(1_800_000_000);
        usdc = new MockUSDC();
        campaigns = new ArcwayCampaigns(address(usdc));
        verifier = vm.addr(verifierKey);
        campaigns.setVerifier(verifier, true);
        usdc.mint(project, 1_000_000e6);
        vm.prank(project);
        usdc.approve(address(campaigns), type(uint256).max);
        start = uint64(block.timestamp + 1 hours);
        end = start + 7 days;
    }

    function _create(ArcwayCampaigns.Mode mode, uint128 pool, uint32 winners) internal returns (uint256 id) {
        vm.prank(project);
        id = campaigns.createCampaign(pool, mode, winners, start, end, WINDOW, keccak256("meta"));
    }

    function _sig(uint256 id, address user, uint256 deadline) internal view returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(verifierKey, campaigns.entryDigest(id, user, deadline));
        return abi.encodePacked(r, s, v);
    }

    function _enter(uint256 id, address user) internal {
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sig(id, user, deadline);
        vm.prank(user);
        campaigns.enter(id, deadline, sig);
    }

    function _leaf(uint256 id, address user, uint256 amount) internal pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(id, user, amount))));
    }

    function _pair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    // ------------------------------------------------------------------ creation

    function testCreateLocksThePool() public {
        uint256 id = _create(ArcwayCampaigns.Mode.FirstCome, 300e6, 3);
        assertEq(usdc.balanceOf(address(campaigns)), 300e6);
        ArcwayCampaigns.Campaign memory c = campaigns.getCampaign(id);
        assertEq(c.creator, project);
        assertEq(c.pool, 300e6);
        assertEq(c.claimUntil, end + WINDOW);
    }

    function testCreateRejectsBadParameters() public {
        vm.startPrank(project);
        vm.expectRevert("bad winners");
        campaigns.createCampaign(100e6, ArcwayCampaigns.Mode.Raffle, 0, start, end, WINDOW, 0);
        vm.expectRevert("bad start");
        campaigns.createCampaign(100e6, ArcwayCampaigns.Mode.Raffle, 1, uint64(block.timestamp - 1), end, WINDOW, 0);
        vm.expectRevert("bad duration");
        campaigns.createCampaign(100e6, ArcwayCampaigns.Mode.Raffle, 1, start, start + 10 minutes, WINDOW, 0);
        vm.expectRevert("bad claim window");
        campaigns.createCampaign(100e6, ArcwayCampaigns.Mode.Raffle, 1, start, end, 1 days, 0);
        vm.expectRevert("pool must split evenly");
        campaigns.createCampaign(100e6 + 1, ArcwayCampaigns.Mode.FirstCome, 3, start, end, WINDOW, 0);
        vm.stopPrank();
    }

    // ------------------------------------------------------------------ first come

    function testFirstComePaysOnEntryUntilFull() public {
        uint256 id = _create(ArcwayCampaigns.Mode.FirstCome, 20e6, 2);
        vm.warp(start);
        _enter(id, alice);
        _enter(id, bob);
        assertEq(usdc.balanceOf(alice), 10e6);
        assertEq(usdc.balanceOf(bob), 10e6);

        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sig(id, carol, deadline);
        vm.prank(carol);
        vm.expectRevert("campaign full");
        campaigns.enter(id, deadline, sig);
    }

    function testEntryNeedsTheVerifiersSignatureForThatWallet() public {
        uint256 id = _create(ArcwayCampaigns.Mode.FirstCome, 20e6, 2);
        vm.warp(start);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory aliceSig = _sig(id, alice, deadline);
        // Bob can't reuse Alice's signature.
        vm.prank(bob);
        vm.expectRevert("bad signature");
        campaigns.enter(id, deadline, aliceSig);
        // A signature from someone other than the verifier fails.
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(0xBADBAD, campaigns.entryDigest(id, bob, deadline));
        vm.prank(bob);
        vm.expectRevert("bad signature");
        campaigns.enter(id, deadline, abi.encodePacked(r, s, v));
        // Not twice.
        vm.prank(alice);
        campaigns.enter(id, deadline, aliceSig);
        vm.prank(alice);
        vm.expectRevert("already entered");
        campaigns.enter(id, deadline, aliceSig);
    }

    function testEntryOnlyWhileLiveAndBeforeTheSignatureExpires() public {
        uint256 id = _create(ArcwayCampaigns.Mode.FirstCome, 20e6, 2);
        uint256 deadline = block.timestamp + 30 days;
        bytes memory sig = _sig(id, alice, deadline);
        vm.prank(alice);
        vm.expectRevert("not started");
        campaigns.enter(id, deadline, sig);

        vm.warp(start);
        bytes memory stale = _sig(id, alice, block.timestamp - 1);
        vm.prank(alice);
        vm.expectRevert("signature expired");
        campaigns.enter(id, block.timestamp - 1, stale);

        vm.warp(end);
        vm.prank(alice);
        vm.expectRevert("ended");
        campaigns.enter(id, deadline, sig);
    }

    // ------------------------------------------------------------------ raffle / split

    function testRaffleResultsAreClaimedWithAProof() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 100e6, 2);
        vm.warp(start);
        _enter(id, alice);
        _enter(id, bob);
        _enter(id, carol);

        bytes32 la = _leaf(id, alice, 50e6);
        bytes32 lc = _leaf(id, carol, 50e6);
        bytes32 root = _pair(la, lc);

        vm.prank(verifier);
        vm.expectRevert("not ended");
        campaigns.publishResults(id, root, 100e6);

        vm.warp(end);
        vm.prank(alice);
        vm.expectRevert("not verifier");
        campaigns.publishResults(id, root, 100e6);
        vm.prank(verifier);
        campaigns.publishResults(id, root, 100e6);

        bytes32[] memory proof = new bytes32[](1);
        proof[0] = lc;
        vm.prank(alice);
        campaigns.claim(id, 50e6, proof);
        assertEq(usdc.balanceOf(alice), 50e6);

        vm.prank(alice);
        vm.expectRevert("already claimed");
        campaigns.claim(id, 50e6, proof);

        // Bob wasn't drawn; a made-up amount or someone else's proof fails.
        vm.prank(bob);
        vm.expectRevert("bad proof");
        campaigns.claim(id, 50e6, proof);
        proof[0] = la;
        vm.prank(carol);
        vm.expectRevert("bad proof");
        campaigns.claim(id, 60e6, proof);
    }

    function testResultsCannotExceedThePoolOrBePublishedTwice() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Split, 100e6, 5);
        vm.warp(start);
        _enter(id, alice);
        vm.warp(end);
        vm.startPrank(verifier);
        vm.expectRevert("bad results");
        campaigns.publishResults(id, keccak256("r"), 101e6);
        campaigns.publishResults(id, keccak256("r"), 100e6);
        vm.expectRevert("already published");
        campaigns.publishResults(id, keccak256("r2"), 100e6);
        vm.stopPrank();
    }

    function testSplitCapsEntriesAtMaxWinners() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Split, 100e6, 1);
        vm.warp(start);
        _enter(id, alice);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sig(id, bob, deadline);
        vm.prank(bob);
        vm.expectRevert("campaign full");
        campaigns.enter(id, deadline, sig);
    }

    // ------------------------------------------------------------------ refunds

    function testProjectCanCancelBeforeStart() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 100e6, 2);
        uint256 before = usdc.balanceOf(project);
        vm.prank(project);
        campaigns.refund(id);
        assertEq(usdc.balanceOf(project), before + 100e6);
        // Closed for good.
        vm.warp(start);
        uint256 deadline = block.timestamp + 1 hours;
        bytes memory sig = _sig(id, alice, deadline);
        vm.prank(alice);
        vm.expectRevert("campaign closed");
        campaigns.enter(id, deadline, sig);
    }

    function testNoRefundWhileLiveOrBeforeTheClaimWindowCloses() public {
        uint256 id = _create(ArcwayCampaigns.Mode.FirstCome, 30e6, 3);
        vm.warp(start);
        _enter(id, alice);
        vm.prank(project);
        vm.expectRevert("not refundable yet");
        campaigns.refund(id);
        vm.warp(end);
        vm.prank(project);
        vm.expectRevert("not refundable yet");
        campaigns.refund(id);

        vm.warp(end + WINDOW);
        uint256 before = usdc.balanceOf(project);
        vm.prank(project);
        campaigns.refund(id);
        assertEq(usdc.balanceOf(project), before + 20e6);
        assertEq(usdc.balanceOf(address(campaigns)), 0);
    }

    function testOnlyTheProjectGetsLeftovers() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 100e6, 2);
        vm.prank(alice);
        vm.expectRevert("not creator");
        campaigns.refund(id);
    }

    function testEndedWithNoEntriesRefundsImmediately() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 100e6, 2);
        vm.warp(end);
        vm.prank(project);
        campaigns.refund(id);
        assertEq(usdc.balanceOf(address(campaigns)), 0);
    }

    function testUnpublishedResultsLetTheProjectRecoverAfterTheTimeout() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 100e6, 2);
        vm.warp(start);
        _enter(id, alice);
        vm.warp(end + 3 days - 1);
        vm.prank(project);
        vm.expectRevert("not refundable yet");
        campaigns.refund(id);
        vm.warp(end + 3 days);
        vm.prank(project);
        campaigns.refund(id);
        assertEq(usdc.balanceOf(project), 1_000_000e6);
    }

    function testClaimsStopAfterTheWindowAndLeftoversReturn() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Split, 100e6, 2);
        vm.warp(start);
        _enter(id, alice);
        _enter(id, bob);
        bytes32 la = _leaf(id, alice, 50e6);
        bytes32 lb = _leaf(id, bob, 50e6);
        vm.warp(end);
        vm.prank(verifier);
        campaigns.publishResults(id, _pair(la, lb), 100e6);

        bytes32[] memory proof = new bytes32[](1);
        proof[0] = lb;
        vm.prank(alice);
        campaigns.claim(id, 50e6, proof);

        vm.warp(end + WINDOW);
        proof[0] = la;
        vm.prank(bob);
        vm.expectRevert("claim window closed");
        campaigns.claim(id, 50e6, proof);

        vm.prank(project);
        campaigns.refund(id);
        assertEq(usdc.balanceOf(project), 1_000_000e6 - 50e6);
    }

    // ------------------------------------------------------------------ app compatibility
    // Constants below were produced by the web app's own code (lib/campaignDraw.ts and viem's
    // hashTypedData), so these tests prove the app and the contract agree byte for byte.

    function testEntryDigestMatchesTheApp() public view {
        assertEq(address(campaigns), 0x2e234DAe75C793f67A35089C9d99245E1C58470b);
        assertEq(
            campaigns.entryDigest(1, alice, 1_900_000_000),
            0xdccbc22b1770cc90813bd9b0e7ae8518438b0726367563c39d17fb461cb32ed6
        );
    }

    function testResultsBuiltByTheAppAreClaimable() public {
        uint256 id = _create(ArcwayCampaigns.Mode.Raffle, 90e6, 3);
        assertEq(id, 1);
        vm.warp(start);
        _enter(id, alice);
        _enter(id, bob);
        _enter(id, carol);
        vm.warp(end);
        vm.prank(verifier);
        campaigns.publishResults(id, 0x22c69c4f0bcd9591e52a13869e91936408af39c699af9352d57f363264b33ba5, 90e6);

        bytes32[] memory pa = new bytes32[](2);
        pa[0] = 0x62772de478863b8f573beb3b801db91e004c014fe3fe90505fe71badae563aae;
        pa[1] = 0xcb4e0d64f2cc9a21041539ea7adc4b017872e8d940f5af034a2894cca41accbf;
        bytes32[] memory pb = new bytes32[](2);
        pb[0] = 0x938ac4e9656906e0b9199675cc14731d5d4538563c1ea09da2e16739b9227e4f;
        pb[1] = 0xcb4e0d64f2cc9a21041539ea7adc4b017872e8d940f5af034a2894cca41accbf;
        bytes32[] memory pc = new bytes32[](1);
        pc[0] = 0xace0812f8f9cbb0d868f9d5417da1b75278945c0d66526f831743531e0c62702;

        vm.prank(alice);
        campaigns.claim(id, 30e6, pa);
        vm.prank(bob);
        campaigns.claim(id, 30e6, pb);
        vm.prank(carol);
        campaigns.claim(id, 30e6, pc);
        assertEq(usdc.balanceOf(alice) + usdc.balanceOf(bob) + usdc.balanceOf(carol), 90e6);
        assertEq(usdc.balanceOf(address(campaigns)), 0);
    }

    // ------------------------------------------------------------------ admin

    function testOwnerManagesVerifiersButCannotTouchPools() public {
        vm.prank(alice);
        vm.expectRevert("not owner");
        campaigns.setVerifier(alice, true);
        campaigns.transferOwnership(alice);
        vm.prank(alice);
        campaigns.acceptOwnership();
        assertEq(campaigns.owner(), alice);
    }
}
