import { numberToHex } from "viem";
import { arcChain } from "./config";

type Eip1193 = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };

export type AddResult = "added" | "no-wallet" | "rejected" | "error";

/** Ask the browser wallet to add (or switch to) Arc. Works without connecting first. */
export async function addArcToWallet(): Promise<AddResult> {
  const eth = (typeof window !== "undefined" ? (window as unknown as { ethereum?: Eip1193 }).ethereum : undefined);
  if (!eth) return "no-wallet";
  try {
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: numberToHex(arcChain.id),
        chainName: arcChain.name,
        nativeCurrency: arcChain.nativeCurrency,
        rpcUrls: arcChain.rpcUrls.default.http,
        blockExplorerUrls: arcChain.blockExplorers ? [arcChain.blockExplorers.default.url] : undefined
      }]
    });
    return "added";
  } catch (e) {
    return (e as { code?: number })?.code === 4001 ? "rejected" : "error";
  }
}
