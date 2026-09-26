import { explorer } from "../config";
import { normalizeChart, type ChartPoint } from "../intel";

/**
 * Typed reads from the Arc explorer's Blockscout v2 API (shapes follow
 * @blockscout/api-types). Every call has a timeout and a short in-process
 * cache so a burst of page views never turns into a burst of explorer calls.
 */

export type BsAddress = {
  hash: string;
  name?: string | null;
  is_contract?: boolean | null;
  is_verified?: boolean | null;
};

export type BsTokenTransfer = {
  transaction_hash: string;
  timestamp: string | null;
  from: BsAddress;
  to: BsAddress;
  method?: string | null;
  type?: string;
  token?: { address_hash?: string; symbol?: string | null; decimals?: string | null } | null;
  total?: { decimals?: string | null; value?: string | null } | null;
};

export type BsTx = {
  hash: string;
  timestamp: string | null;
  from: BsAddress;
  to: BsAddress | null;
  created_contract?: BsAddress | null;
  method?: string | null;
  status?: "ok" | "error" | null;
  result?: string;
  value?: string;
  transaction_types?: string[];
};

export type BsStats = {
  average_block_time?: number;
  total_addresses?: string;
  total_blocks?: string;
  total_transactions?: string;
  transactions_today?: string;
};

export type BsContractCounters = {
  new_smart_contracts_24h?: string;
  new_verified_smart_contracts_24h?: string;
  smart_contracts?: string;
  verified_smart_contracts?: string;
};

export type BsHotContract = { contract_address: BsAddress; transactions_count: number; total_gas_used: number };

export type BsVerifiedContract = {
  address?: BsAddress;
  name?: string | null;
  verified_at?: string | null;
  compiler_version?: string | null;
  language?: string | null;
  transactions_count?: number | null;
};

export type BsLog = {
  block_number: number;
  block_timestamp?: string | null;
  data: string;
  topics: (string | null)[];
  transaction_hash: string;
  index: number;
};

export type BsTokenCounters = { token_holders_count?: string; transfers_count?: string };
export type BsAddressCounters = { transactions_count?: string; token_transfers_count?: string };

const TIMEOUT_MS = 6_000;
const memo = new Map<string, { at: number; ttl: number; value: Promise<unknown> }>();

async function get<T>(path: string, ttlSeconds: number, fetchImpl: typeof fetch = fetch): Promise<T> {
  if (!explorer.apiV2) throw new Error("No explorer API configured for this network");
  const key = process.env.EXPLORER_API_KEY;
  const url = `${explorer.apiV2}${path}${key ? `${path.includes("?") ? "&" : "?"}apikey=${encodeURIComponent(key)}` : ""}`;
  const now = Date.now();
  const hit = memo.get(url);
  if (hit && now - hit.at < hit.ttl * 1000) return hit.value as Promise<T>;
  const value = (async () => {
    const res = await fetchImpl(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: ttlSeconds }
    } as RequestInit);
    if (!res.ok) throw new Error(`Explorer responded ${res.status} for ${path}`);
    return (await res.json()) as T;
  })();
  memo.set(url, { at: now, ttl: ttlSeconds, value });
  value.catch(() => memo.delete(url)); // never cache failures
  if (memo.size > 500) for (const [k, v] of memo) if (now - v.at > v.ttl * 1000) memo.delete(k);
  return value;
}

/** Settle a read into data-or-null so one failing source never blanks a whole page. */
export async function settle<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export const getStats = () => get<BsStats>("/stats", 30);

export async function getTxChart(): Promise<ChartPoint[]> {
  const body = await get<{ chart_data?: Record<string, unknown>[] }>("/stats/charts/transactions", 300);
  return normalizeChart(body.chart_data ?? []);
}

export const getContractCounters = () => get<BsContractCounters>("/smart-contracts/counters", 120);
export const getHotContracts = (scale: "1d" | "7d" = "1d") =>
  get<{ items?: BsHotContract[] }>(`/stats/hot-smart-contracts?scale=${scale}`, 120).then((b) => b.items ?? []);
export const getVerifiedContracts = () => get<{ items?: BsVerifiedContract[] }>("/smart-contracts", 120).then((b) => b.items ?? []);
export const getLatestTxs = () => get<BsTx[] | { items?: BsTx[] }>("/main-page/transactions", 10).then((b) => (Array.isArray(b) ? b : b.items ?? []));
export const getTokenTransfers = (token: string) => get<{ items?: BsTokenTransfer[] }>(`/tokens/${token}/transfers`, 15).then((b) => b.items ?? []);
export const getTokenCounters = (token: string) => get<BsTokenCounters>(`/tokens/${token}/counters`, 120);
export const getAddress = (address: string) => get<BsAddress>(`/addresses/${address}`, 300);
export const getAddressCounters = (address: string) => get<BsAddressCounters>(`/addresses/${address}/counters`, 120);
export const getAddressTxs = (address: string) => get<{ items?: BsTx[] }>(`/addresses/${address}/transactions`, 30).then((b) => b.items ?? []);

/** Every event log a contract emitted, newest first, up to `maxPages` pages (50 each). */
export async function getAddressLogs(address: string, maxPages = 20): Promise<{ items: BsLog[]; truncated: boolean }> {
  const items: BsLog[] = [];
  let params: Record<string, unknown> | null = {};
  for (let page = 0; page < maxPages && params; page++) {
    const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    const body: { items?: BsLog[]; next_page_params?: Record<string, unknown> | null } =
      await get(`/addresses/${address}/logs${qs ? `?${qs}` : ""}`, 60);
    items.push(...(body.items ?? []));
    params = body.next_page_params ?? null;
  }
  return { items, truncated: params !== null };
}
