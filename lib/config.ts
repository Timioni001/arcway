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
  (IS_MAINNET ? "https://portal.arc.io" : "https://faucet.circle.com");

const explorerBase = arcChain.blockExplorers?.default.url.replace(/\/$/, "") ?? "";

export const explorer = {
  name: arcChain.blockExplorers?.default.name ?? "Explorer",
  home: explorerBase,
  page: (path: string) => `${explorerBase}${path}`,
  tx: (hash: string) => `${explorerBase}/tx/${hash}`,
  block: (n: string | number) => `${explorerBase}/block/${n}`,
  address: (address: string) => `${explorerBase}/address/${address}`,
  /** Blockscout v2 REST base, e.g. https://testnet.arcscan.app/api/v2 */
  apiV2: explorerBase ? `${explorerBase}/api/v2` : undefined
};

function optionalAddress(value: string | undefined): Address | undefined {
  return value && isAddress(value) ? (value as Address) : undefined;
}

export const NETWORK_NAME = IS_MAINNET ? "Arc Mainnet" : "Arc Testnet";
export const ARC_DOCS_URL = "https://docs.arc.network";
/** Where builders ask to be listed. */
export const SUBMIT_APP_URL =
  process.env.NEXT_PUBLIC_SUBMIT_APP_URL || "https://github.com/Timioni001/arcway/issues/new?title=Listing%3A%20";

/** Where people reach the team (terms, privacy, support). */
export const CONTACT_URL = process.env.NEXT_PUBLIC_CONTACT_URL || "https://github.com/Timioni001/arcway/issues";
/** Arcway on X, shown in the footer when set (e.g. https://x.com/arcwayworld). */
export const X_URL = process.env.NEXT_PUBLIC_X_URL || "";
export const LEGAL_UPDATED = "September 26, 2026";

/**
 * Passkey wallets via Circle Modular Wallets (smart accounts with Face ID / fingerprint, fees sponsored).
 * Needs a Client Key from the Circle Console and the site's domain registered there as the passkey domain.
 * NEXT_PUBLIC_CIRCLE_CHAIN is Circle's path name for the network ("arcTestnet" on testnet).
 */
export const CIRCLE_CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || "";
export const CIRCLE_CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || "https://modular-sdk.circle.com/v1/rpc/w3s/buidl";
export const CIRCLE_CHAIN = process.env.NEXT_PUBLIC_CIRCLE_CHAIN || (IS_MAINNET ? "" : "arcTestnet");
export const PASSKEY_WALLETS = Boolean(CIRCLE_CLIENT_KEY && CIRCLE_CHAIN);

/** ArcwayCampaigns escrow ON THE SAME NETWORK. Until it is set, campaigns can be previewed but not launched. */
export const CAMPAIGNS_ADDRESS = optionalAddress(process.env.NEXT_PUBLIC_CAMPAIGNS_CONTRACT);
/** ArcwayPay (built in Arc Studio): pay links settle through it with an onchain receipt. Off until set. */
export const PAY_CONTRACT = optionalAddress(process.env.NEXT_PUBLIC_PAY_CONTRACT);
