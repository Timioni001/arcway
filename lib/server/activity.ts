import type { Address } from "viem";
import { explorer } from "../config";

export type ActivityItem = {
  hash: string;
  timestamp: string;
  from: string;
  to: string | null;
  /** Human label: contract method or "Transfer". */
  method: string | null;
  success: boolean;
};

type BlockscoutTx = {
  hash: string;
  timestamp: string;
  from?: { hash: string };
  to?: { hash: string } | null;
  method?: string | null;
  status?: string | null;
  result?: string;
};

/** Recent transactions sent by `address`, from the explorer's Blockscout v2 API. */
export async function fetchActivity(address: Address, fetchImpl: typeof fetch = fetch): Promise<ActivityItem[]> {
  if (!explorer.apiV2) throw new Error("No explorer API configured for this network");
  const res = await fetchImpl(`${explorer.apiV2}/addresses/${address}/transactions?filter=from`, {
    headers: { accept: "application/json" },
    next: { revalidate: 15 }
  } as RequestInit);
  if (res.status === 404) return []; // Explorer has never seen this address.
  if (!res.ok) throw new Error(`Explorer responded ${res.status}`);
  const body = (await res.json()) as { items?: BlockscoutTx[] };
  return (body.items ?? []).map((tx) => ({
    hash: tx.hash,
    timestamp: tx.timestamp,
    from: tx.from?.hash ?? address,
    to: tx.to?.hash ?? null,
    method: tx.method ?? null,
    success: tx.status === "ok" || tx.result === "success"
  }));
}
