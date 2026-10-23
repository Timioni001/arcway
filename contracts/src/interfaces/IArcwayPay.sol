// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IArcwayPay — the spec Arc Studio builds ArcwayPay against.
/// @notice Pays an Arcway pay link in USDC with an onchain receipt. Non-custodial: USDC moves
///         straight from the payer to the recipient in the same call; the contract never holds funds.
interface IArcwayPay {
    /// @notice One receipt per payment. `linkId` ties it to the pay link the payer opened.
    event Paid(bytes32 indexed linkId, address indexed payer, address indexed recipient, uint256 amount, string note);

    /// @notice USDC on this network (6-decimal ERC-20 view of Arc's native USDC).
    function usdc() external view returns (address);

    /// @notice Pay `amount` (6 decimals) of USDC to `recipient`, after the payer approved this contract.
    /// @dev Reverts on zero recipient, zero amount, a note over 80 bytes, or a failed transfer.
    function pay(address recipient, uint256 amount, bytes32 linkId, string calldata note) external;

    /// @notice Same as `pay`, with an EIP-2612 permit so the payer signs once instead of approving first.
    function payWithPermit(
        address recipient, uint256 amount, bytes32 linkId, string calldata note,
        uint256 deadline, uint8 v, bytes32 r, bytes32 s
    ) external;
}
