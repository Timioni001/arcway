import { isAddress, type Address, type Chain } from "viem";
import { arc, arcTestnet } from "viem/chains";

/**
 * Single source of truth for chain constants.
 * NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them.
 */
export type ArcNetwork = "mainnet" | "testnet";

export const ARC_NETWORK: ArcNetwork =
  process.env.NEXT_PUBLIC_ARC_NETWORK === "mainnet" ? "mainnet" : "testnet";

const baseChain = ARC_NETWORK === "mainnet" ? arc : arcTestnet;
const rpcOverride = process.env.NEXT_PUBLIC_ARC_RPC_URL;

export const arcChain: Chain = rpcOverride
  ? { ...baseChain, rpcUrls: { default: { http: [rpcOverride, ...baseChain.rpcUrls.default.http] } } }
  : baseChain;

export const IS_MAINNET = ARC_NETWORK === "mainnet";

/** ERC-20 view of USDC. Never mix with native (18-decimal) gas units. */
export const USDC_ADDRESS = optionalAddress(process.env.NEXT_PUBLIC_ARC_USDC) ??
  ("0x3600000000000000000000000000000000000000" as Address);
export const USDC_DECIMALS = 6;
export const NATIVE_USDC_DECIMALS = 18;

export const PASSPORT_ADDRESS = optionalAddress(process.env.NEXT_PUBLIC_PASSPORT_CONTRACT);

/** Where "Bring USDC" sends people. Testnet defaults to Circle's faucet. */
export const BRIDGE_URL =
  process.env.NEXT_PUBLIC_BRIDGE_URL ||
  (IS_MAINNET ? "https://developers.circle.com/cctp" : "https://faucet.circle.com");

const explorerBase = arcChain.blockExplorers?.default.url.replace(/\/$/, "") ?? "";

export const explorer = {
  name: arcChain.blockExplorers?.default.name ?? "Explorer",
  tx: (hash: string) => `${explorerBase}/tx/${hash}`,
  address: (address: string) => `${explorerBase}/address/${address}`,
  /** Blockscout v2 REST base, e.g. https://testnet.arcscan.app/api/v2 */
  apiV2: explorerBase ? `${explorerBase}/api/v2` : undefined
};

function optionalAddress(value: string | undefined): Address | undefined {
  return value && isAddress(value) ? (value as Address) : undefined;
}
