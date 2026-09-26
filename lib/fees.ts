/**
 * Typical gas for common actions. Estimates, labelled as such in the UI;
 * the price per unit of gas comes live from the network.
 */
export const FEE_ACTIONS = [
  { id: "send", label: "Send USDC", gas: 65_000n },
  { id: "swap", label: "Swap tokens", gas: 180_000n },
  { id: "mint", label: "Mint a collectible", gas: 120_000n }
] as const;

export type FeeActionId = (typeof FEE_ACTIONS)[number]["id"];

/** Gas is paid in native USDC (18 decimals on Arc). Returns dollars. */
export function feeUsd(gas: bigint, gasPriceWei: bigint, times = 1): number {
  const wei = gas * gasPriceWei * BigInt(Math.max(0, Math.floor(times)));
  return Number(wei) / 1e18;
}

/** "$0.0013", "$1.25", "<$0.0001". Never rounds a real cost down to "$0". */
export function formatUsd(usd: number): string {
  if (usd === 0) return "$0";
  if (usd < 0.0001) return "<$0.0001";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
