import { parseAbi } from "viem";

/** ArcwayPay, per contracts/src/interfaces/IArcwayPay.sol. */
export const payAbi = parseAbi([
  "event Paid(bytes32 indexed linkId, address indexed payer, address indexed recipient, uint256 amount, string note)",
  "function usdc() view returns (address)",
  "function pay(address recipient, uint256 amount, bytes32 linkId, string note)"
]);
