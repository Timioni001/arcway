import type { Address } from "viem";
import { explorerRequest } from "./explorer";

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

const toItem = (address: Address) => (tx: BlockscoutTx): ActivityItem => ({
  hash: tx.hash,
  timestamp: tx.timestamp,
  from: tx.from?.hash ?? address,
  to: tx.to?.hash ?? null,
  method: tx.method ?? null,
  success: tx.status === "ok" || tx.result === "success"
});

/**
 * Transactions sent by `address`, newest first, from the explorer's Blockscout v2 API.
 * One page (50) for the activity feed; quests that count days or app actions read up to `maxPages`.
 */
export async function fetchActivity(address: Address, fetchImpl: typeof fetch = fetch, maxPages = 1): Promise<ActivityItem[]> {
  const items: ActivityItem[] = [];
  let next: Record<string, string | number> | null | undefined;
  for (let page = 0; page < maxPages; page++) {
    const cursor = next ? "&" + Object.entries(next).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&") : "";
    const res = await explorerRequest(`/addresses/${address}/transactions?filter=from${cursor}`, { next: { revalidate: 15 } }, fetchImpl);
    if (res.status === 404) return items; // Explorer has never seen this address.
    if (!res.ok) throw new Error(`Explorer responded ${res.status}`);
    const body = (await res.json()) as { items?: BlockscoutTx[]; next_page_params?: Record<string, string | number> | null };
    items.push(...(body.items ?? []).map(toItem(address)));
    next = body.next_page_params;
    if (!next) break;
  }
  return items;
}
