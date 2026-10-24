// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/ArcwayBounties.sol";

/// @notice Deploys ArcwayBounties.
/// @dev Required env vars:
///      USDC_ADDRESS     — the USDC ERC-20 on the target chain
///      PASSPORT_ADDRESS — the deployed ArcwayPassport contract address
///
/// Example (testnet):
///   forge script contracts/script/DeployBounties.s.sol \
///     --rpc-url $RPC_URL --broadcast \
///     --private-key $PRIVATE_KEY \
///     -vvvv
///
/// Mainnet (Arc Mainnet):
///   USDC_ADDRESS=0x3600000000000000000000000000000000000000 \
///   PASSPORT_ADDRESS=0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c \
///   forge script contracts/script/DeployBounties.s.sol \
///     --rpc-url https://rpc.mainnet.arc.io \
///     --broadcast \
///     --private-key $PRIVATE_KEY \
///     -vvvv
contract DeployBounties is Script {
    function run() external returns (ArcwayBounties bounties) {
        address usdcAddr     = vm.envAddress("USDC_ADDRESS");
        address passportAddr = vm.envAddress("PASSPORT_ADDRESS");

        vm.startBroadcast();
        bounties = new ArcwayBounties(usdcAddr, passportAddr);
        vm.stopBroadcast();

        console.log("ArcwayBounties:", address(bounties));
        console.log("USDC:          ", usdcAddr);
        console.log("Passport:      ", passportAddr);
    }
}
