import { createPublicClient, createWalletClient, fallback, http, isHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcChain } from "../config";

export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(undefined, { retryCount: 1, timeout: 8_000 }),
  batch: { multicall: true }
});

/**
 * For eth_getLogs scans. Arc's main RPC caps a query below 10,000 blocks and rate-limits quickly;
 * Blockdaemon's public endpoint takes 100,000, so it goes first and the rest are fallbacks.
 */
const rpcUrls = [...arcChain.rpcUrls.default.http].sort((a, b) => Number(b.includes("blockdaemon")) - Number(a.includes("blockdaemon")));
export const logsClient = createPublicClient({
  chain: arcChain,
  transport: fallback(rpcUrls.map((url) => http(url, { retryCount: 0, timeout: 10_000 })))
});

/** Verifier signer. Server-only: never prefix this env var with NEXT_PUBLIC_. */
export function verifierClient() {
  const key = process.env.VERIFIER_PRIVATE_KEY;
  if (!key || !isHex(key) || key.length !== 66) return undefined;
  return createWalletClient({
    account: privateKeyToAccount(key as Hex),
    chain: arcChain,
    transport: http()
  });
}
