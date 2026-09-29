// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcwayCampaigns.sol";

/// @notice Deploys the campaign escrow for Arc USDC. If VERIFIER_ADDRESS is set, authorizes it in the same run.
/// USDC_ADDRESS defaults to Arc's USDC (0x3600…0000).
contract DeployCampaigns is Script {
    function run() external returns (ArcwayCampaigns campaigns) {
        address usdc = vm.envOr("USDC_ADDRESS", address(0x3600000000000000000000000000000000000000));
        address verifierAddr = vm.envOr("VERIFIER_ADDRESS", address(0));
        vm.startBroadcast();
        campaigns = new ArcwayCampaigns(usdc);
        if (verifierAddr != address(0)) campaigns.setVerifier(verifierAddr, true);
        vm.stopBroadcast();
        console.log("ArcwayCampaigns:", address(campaigns));
        console.log("USDC:", usdc);
        console.log("Verifier:", verifierAddr);
    }
}
