// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcwayPassport.sol";

contract Deploy is Script {
    function run() external returns (ArcwayPassport passport) {
        vm.startBroadcast();
        passport = new ArcwayPassport();
        vm.stopBroadcast();
    }
}
