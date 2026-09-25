import { createPublicClient, createWalletClient, http, isHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcChain } from "../config";

export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(undefined, { retryCount: 1, timeout: 8_000 }),
  batch: { multicall: true }
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
