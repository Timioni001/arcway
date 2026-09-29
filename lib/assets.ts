import type { ArcNetwork } from "./config";
import { contractIndex, toInt, unitsToUsdc, type EntityRef } from "./intel";
import type { ArcApp } from "./registry";
import type { BsTokenCounters, BsTokenTransfer } from "./server/explorer";

/**
 * Assets: tokens on Arc as the explorer reports them. Everything here is observed
 * (read from the explorer) or derived from observed transfers. No prices: Arcway
 * has no authoritative market source yet, so Markets shows "coming soon".
 */

/** Blockscout token shape. Older instances use `address` and `holders`, newer ones `address_hash` and `holders_count`. */
export type BsToken = {
  address_hash?: string | null;
  address?: string | null;
  name?: string | null;
  symbol?: string | null;
  decimals?: string | null;
  type?: string | null;
  holders_count?: string | null;
  holders?: string | null;
  total_supply?: string | null;
  icon_url?: string | null;
};

export type Asset = {
  address: string;
  name: string;
  symbol: string;
  type: string;
  decimals: number | null;
  holders: number | null;
  supply: number | null;
  iconUrl: string | null;
};

export type AssetTransfer = { id: string; at: string | null; from: EntityRef; to: EntityRef; amount: number | null; method: string | null; txHash: string };

export type AssetDetail = {
  asset: Asset;
  transfers: number | null;
  recent: AssetTransfer[];
  /** Listed apps whose contracts sent or received this asset in the recent transfers. */
  relatedApps: { slug: string; name: string; logo?: string; transfers: number }[];
  /** How many transfers the related-apps count was derived from. */
  sampleSize: number;
};

const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

export function toAsset(t: BsToken): Asset | null {
  const address = t.address_hash ?? t.address;
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) return null;
  const decimals = toInt(t.decimals);
  const supply = decimals !== null && t.total_supply ? unitsToUsdc(t.total_supply, decimals) : null;
  return {
    address,
    name: t.name?.trim() || short(address),
    symbol: t.symbol?.trim() || "—",
    type: t.type ?? "ERC-20",
    decimals,
    holders: toInt(t.holders_count ?? t.holders),
    supply,
    iconUrl: t.icon_url && /^https:\/\//.test(t.icon_url) ? t.icon_url : null
  };
}

/** Tokens ranked by holders (the explorer's own order is not guaranteed). Unnamed dust tokens sink to the bottom. */
export function buildAssets(tokens: BsToken[]): Asset[] {
  const seen = new Set<string>();
  const out: Asset[] = [];
  for (const t of tokens) {
    const a = toAsset(t);
    if (!a || seen.has(a.address.toLowerCase())) continue;
    seen.add(a.address.toLowerCase());
    out.push(a);
  }
  return out.sort((a, b) => (b.holders ?? -1) - (a.holders ?? -1) || a.symbol.localeCompare(b.symbol));
}

export function buildAssetDetail(input: {
  token: BsToken;
  counters: BsTokenCounters | null;
  transfers: BsTokenTransfer[] | null;
  apps?: ArcApp[];
  network?: ArcNetwork;
}): AssetDetail | null {
  const asset = toAsset(input.token);
  if (!asset) return null;
  const index = contractIndex(input.apps, input.network);
  const ref = (a: { hash: string; name?: string | null } | null | undefined): EntityRef => {
    if (!a?.hash) return { label: "Unknown" };
    const app = index.get(a.hash.toLowerCase());
    return app ? { label: app.name, appSlug: app.slug, logo: app.logo, address: a.hash } : { label: a.name || short(a.hash), address: a.hash };
  };
  const rows = input.transfers ?? [];
  const recent = rows.slice(0, 25).map<AssetTransfer>((t, i) => {
    const decimals = toInt(t.total?.decimals ?? t.token?.decimals) ?? asset.decimals;
    return {
      id: `${t.transaction_hash}-${i}`,
      at: t.timestamp,
      from: ref(t.from),
      to: ref(t.to),
      amount: decimals !== null ? unitsToUsdc(t.total?.value, decimals) : null,
      method: t.method ?? null,
      txHash: t.transaction_hash
    };
  });
  const counts = new Map<string, { slug: string; name: string; logo?: string; transfers: number }>();
  for (const t of rows) {
    for (const side of [t.from, t.to]) {
      const app = side?.hash ? index.get(side.hash.toLowerCase()) : undefined;
      if (!app) continue;
      const c = counts.get(app.slug) ?? { slug: app.slug, name: app.name, logo: app.logo, transfers: 0 };
      c.transfers++;
      counts.set(app.slug, c);
    }
  }
  return {
    asset,
    transfers: toInt(input.counters?.transfers_count),
    recent,
    relatedApps: [...counts.values()].sort((a, b) => b.transfers - a.transfers),
    sampleSize: rows.length
  };
}
