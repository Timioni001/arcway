// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcwayPassport.sol";

/// @notice Deploys the passport. If VERIFIER_ADDRESS is set, authorizes it in the same run.
contract Deploy is Script {
    function run() external returns (ArcwayPassport passport) {
        address verifierAddr = vm.envOr("VERIFIER_ADDRESS", address(0));
        vm.startBroadcast();
        passport = new ArcwayPassport();
        if (verifierAddr != address(0)) passport.setVerifier(verifierAddr, true);
        vm.stopBroadcast();
        console.log("ArcwayPassport:", address(passport));
        console.log("Verifier:", verifierAddr);
    }
}
