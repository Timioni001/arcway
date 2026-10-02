/**
 * Arc intelligence: pure functions that turn explorer reads into facts people can use.
 *
 * Every number carries where it came from and the period it covers:
 * - observed: read directly from Arc's explorer index
 * - derived:  calculated from observed data (the method is in the label)
 * - project:  supplied by the app team (Arcway's registry)
 * Nothing here estimates, predicts or scores. If a source is missing, the value is null.
 */
import { decodeEventLog, type Hex } from "viem";
import { passportAbi } from "./abi";
import { QUESTS, questHash } from "./quests";
import type { BsAddress, BsLog, BsContractCounters, BsHotContract, BsStats, BsTokenCounters, BsTokenTransfer, BsTx, BsVerifiedContract } from "./server/explorer";
import { APPS, appContracts, type ArcApp } from "./registry";
import type { ArcNetwork } from "./config";

export type Source = "observed" | "derived" | "project" | "community";

export const SOURCE_LABEL: Record<Source, string> = {
  observed: "Observed",
  derived: "Derived",
  project: "Project-provided",
  community: "Community"
};

export const SOURCE_HELP: Record<Source, string> = {
  observed: "Measured directly from Arc's explorer index.",
  derived: "Calculated from observed data. The method and period are shown.",
  project: "Supplied by the app team and listed on Arcway.",
  community: "Submitted by the community. Not verified by Arcway."
};

export type ChartPoint = { date: string; count: number };

export type Metric = {
  id: string;
  label: string;
  value: number | null;
  format: "int" | "seconds" | "percent";
  source: Source;
  period: string;
  hint?: string;
};

export type EntityRef = { label: string; address?: string; href?: string; appSlug?: string; logo?: string };

export type PulseKind = "app" | "deploy" | "usdc" | "call" | "transfer";

export type PulseEvent = {
  id: string;
  at: string;
  kind: PulseKind;
  title: string;
  entity: EntityRef;
  detail?: string;
  amountUsdc?: number;
  failed?: boolean;
  txHash: string;
  source: "observed";
};

export type SignalKind = "activity-change" | "new-contracts" | "contract-verified" | "large-transfer" | "hot-contract" | "new-listing";

export type Signal = {
  id: string;
  at: string;
  kind: SignalKind;
  title: string;
  detail: string;
  source: Source;
  period: string;
  entity?: EntityRef;
  evidence?: { label: string; href: string };
};

export type RadarContract = {
  address: string;
  name: string | null;
  verifiedAt?: string | null;
  compiler?: string | null;
  txCount?: number;
  app?: { slug: string; name: string; logo?: string };
};

export type Change = { id: string; label: string; value: number | null; delta?: number | null; source: Source; period: string };

export type Radar = {
  verified: RadarContract[];
  hot: RadarContract[];
  newApps: { slug: string; name: string; category: string; addedAt: string; logo?: string }[];
  changes: { day: Change[]; week: Change[] };
};

export type Snapshot = { metrics: Metric[]; chart: ChartPoint[] };

export type ProtocolContract = { address: string; name: string | null; verified: boolean | null; txCount: number | null; lastActive: string | null };

export type ProtocolIntel = {
  slug: string;
  measurable: boolean;
  contracts: ProtocolContract[];
  txCount: number | null;
  lastActive: string | null;
  recent: PulseEvent[];
};

/** Envelope every intel endpoint returns: data plus when it was read and what was unavailable. */
export type Intel<T> = { data: T; fetchedAt: string; network: ArcNetwork; unavailable: string[] };

const DAY = 86_400_000;
/** USDC amount at or above which a single transfer is called out. */
export const LARGE_TRANSFER_USDC = 100_000;
/** Minimum relative change before an activity shift becomes a signal. */
export const ACTIVITY_CHANGE_THRESHOLD = 0.25;

// ---------------------------------------------------------------- helpers

/** Blockscout has used transactions_count, transaction_count and tx_count over time. */
export function normalizeChart(rows: Record<string, unknown>[]): ChartPoint[] {
  return rows
    .map((r) => ({ date: String(r.date ?? ""), count: Number(r.transactions_count ?? r.transaction_count ?? r.tx_count ?? NaN) }))
    .filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(r.count))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const toInt = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Integer string in base units → USDC as a number (display only, never for accounting). */
export function unitsToUsdc(value: string | null | undefined, decimals: number): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const big = BigInt(value);
  const scale = 10n ** BigInt(decimals);
  return Number(big / scale) + Number(big % scale) / Number(scale);
}

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

/** Lower-cased contract → listed app, for everything on this network. */
export function contractIndex(apps: ArcApp[] = APPS, network?: ArcNetwork): Map<string, ArcApp> {
  const map = new Map<string, ArcApp>();
  for (const app of apps) {
    if (!app.active || app.sample) continue;
    for (const c of network ? appContracts(app, network) : appContracts(app)) map.set(c.toLowerCase(), app);
  }
  return map;
}

function appRef(app: ArcApp, address?: string): EntityRef {
  return { label: app.name, appSlug: app.slug, logo: app.logo, address };
}

function addressRef(a: BsAddress | null | undefined): EntityRef {
  if (!a?.hash) return { label: "Unknown" };
  return { label: a.name || short(a.hash), address: a.hash };
}

// ---------------------------------------------------------------- snapshot

/** Last complete day vs the mean of the seven before it. Needs at least 8 days. */
export function dayOverWeek(chart: ChartPoint[]): { date: string; count: number; baseline: number; change: number; from: string; to: string } | null {
  if (chart.length < 8) return null;
  const last = chart[chart.length - 1];
  const prior = chart.slice(-8, -1);
  const baseline = prior.reduce((s, p) => s + p.count, 0) / prior.length;
  if (baseline <= 0) return null;
  return { date: last.date, count: last.count, baseline, change: (last.count - baseline) / baseline, from: prior[0].date, to: prior[prior.length - 1].date };
}

/** Sum of the last `days` points vs the `days` before them. */
export function periodChange(chart: ChartPoint[], days: number): { current: number; previous: number; change: number | null; from: string; to: string } | null {
  if (chart.length < days) return null;
  const cur = chart.slice(-days);
  const prev = chart.slice(-days * 2, -days);
  const current = cur.reduce((s, p) => s + p.count, 0);
  const previous = prev.length === days ? prev.reduce((s, p) => s + p.count, 0) : 0;
  return { current, previous, change: prev.length === days && previous > 0 ? (current - previous) / previous : null, from: cur[0].date, to: cur[cur.length - 1].date };
}

export function buildSnapshot(input: {
  stats: BsStats | null;
  chart: ChartPoint[] | null;
  counters: BsContractCounters | null;
  usdc: BsTokenCounters | null;
  activeApps: { active: number; measurable: number } | null;
  apps?: ArcApp[];
  now?: number;
}): Snapshot {
  const { stats, chart, counters, usdc, activeApps } = input;
  const apps = (input.apps ?? APPS).filter((a) => a.active && !a.sample);
  const now = input.now ?? Date.now();
  const lastDay = chart && chart.length ? chart[chart.length - 1] : null;
  const newThisWeek = apps.filter((a) => {
    const t = Date.parse(a.addedAt);
    return Number.isFinite(t) && now - t >= 0 && now - t < 7 * DAY;
  }).length;

  const metrics: Metric[] = [
    lastDay
      ? { id: "tx-day", label: "Transactions", value: lastDay.count, format: "int", source: "observed", period: `${shortDate(lastDay.date)} (UTC day)` }
      : { id: "tx-day", label: "Transactions", value: toInt(stats?.transactions_today), format: "int", source: "observed", period: "Latest day" },
    { id: "addresses", label: "Addresses seen", value: toInt(stats?.total_addresses), format: "int", source: "observed", period: "All time" },
    { id: "contracts-new", label: "New contracts", value: toInt(counters?.new_smart_contracts_24h), format: "int", source: "observed", period: "Last 24h", hint: counters?.smart_contracts ? `${Number(counters.smart_contracts).toLocaleString("en-US")} in total` : undefined },
    { id: "verified", label: "Verified contracts", value: toInt(counters?.verified_smart_contracts), format: "int", source: "observed", period: "All time", hint: counters?.new_verified_smart_contracts_24h ? `+${counters.new_verified_smart_contracts_24h} in 24h` : undefined },
    { id: "usdc-transfers", label: "USDC transfers", value: toInt(usdc?.transfers_count), format: "int", source: "observed", period: "All time", hint: usdc?.token_holders_count ? `${Number(usdc.token_holders_count).toLocaleString("en-US")} holders` : undefined },
    { id: "block-time", label: "Block time", value: typeof stats?.average_block_time === "number" ? stats.average_block_time / 1000 : null, format: "seconds", source: "observed", period: "Recent average" },
    { id: "apps-active", label: "Listed apps active", value: activeApps ? activeApps.active : null, format: "int", source: "derived", period: "Last 24h", hint: activeApps ? `of ${activeApps.measurable} with published contracts` : undefined },
    { id: "apps-new", label: "New on Arcway", value: newThisWeek, format: "int", source: "project", period: "Last 7 days", hint: `${apps.length} apps listed` }
  ];
  return { metrics, chart: chart ?? [] };
}

// ---------------------------------------------------------------- pulse

const KIND_RANK: Record<PulseKind, number> = { app: 0, deploy: 1, usdc: 2, transfer: 3, call: 4 };

export function buildPulse(input: { txs: BsTx[] | null; transfers: BsTokenTransfer[] | null; apps?: ArcApp[]; network?: ArcNetwork }): PulseEvent[] {
  const index = contractIndex(input.apps, input.network);
  const byHash = new Map<string, PulseEvent>();
  const put = (e: PulseEvent) => {
    const prev = byHash.get(e.txHash);
    if (!prev || KIND_RANK[e.kind] < KIND_RANK[prev.kind]) byHash.set(e.txHash, prev?.amountUsdc && !e.amountUsdc ? { ...e, amountUsdc: prev.amountUsdc } : e);
  };

  for (const tx of input.txs ?? []) {
    if (!tx.hash || !tx.timestamp) continue;
    const failed = tx.status === "error";
    const app = tx.to?.hash ? index.get(tx.to.hash.toLowerCase()) : undefined;
    const native = unitsToUsdc(tx.value, 18);
    const base = { id: `tx:${tx.hash}`, at: tx.timestamp, txHash: tx.hash, failed, source: "observed" as const };
    if (app) put({ ...base, kind: "app", title: `${app.name} interaction`, entity: appRef(app, tx.to!.hash), detail: tx.method ?? undefined, amountUsdc: native || undefined });
    else if (tx.created_contract?.hash) put({ ...base, kind: "deploy", title: "Contract deployed", entity: addressRef(tx.created_contract), detail: `by ${short(tx.from.hash)}` });
    else if (tx.to?.is_contract) put({ ...base, kind: "call", title: "Contract call", entity: addressRef(tx.to), detail: tx.method ?? undefined });
    else if (native && native > 0) put({ ...base, kind: "transfer", title: "USDC sent", entity: addressRef(tx.to), detail: `from ${short(tx.from.hash)}`, amountUsdc: native });
  }

  for (const t of input.transfers ?? []) {
    if (!t.transaction_hash || !t.timestamp) continue;
    const decimals = Number(t.total?.decimals ?? t.token?.decimals ?? 6);
    const amount = unitsToUsdc(t.total?.value, Number.isFinite(decimals) ? decimals : 6);
    if (amount === null) continue;
    const existing = byHash.get(t.transaction_hash);
    if (existing) {
      if (!existing.amountUsdc) byHash.set(t.transaction_hash, { ...existing, amountUsdc: amount });
      continue;
    }
    const app = index.get(t.to?.hash?.toLowerCase() ?? "") ?? index.get(t.from?.hash?.toLowerCase() ?? "");
    put({
      id: `usdc:${t.transaction_hash}`,
      at: t.timestamp,
      kind: app ? "app" : "usdc",
      title: app ? `${app.name} USDC transfer` : t.type === "token_minting" ? "USDC minted" : t.type === "token_burning" ? "USDC burned" : "USDC transfer",
      entity: app ? appRef(app) : addressRef(t.to),
      detail: `from ${short(t.from?.hash ?? "")}`,
      amountUsdc: amount,
      txHash: t.transaction_hash,
      source: "observed"
    });
  }

  return [...byHash.values()].sort((a, b) => b.at.localeCompare(a.at));
}

// ---------------------------------------------------------------- radar

export function buildRadar(input: {
  verified: BsVerifiedContract[] | null;
  hot: BsHotContract[] | null;
  chart: ChartPoint[] | null;
  counters: BsContractCounters | null;
  apps?: ArcApp[];
  network?: ArcNetwork;
  now?: number;
}): Radar {
  const now = input.now ?? Date.now();
  const apps = (input.apps ?? APPS).filter((a) => a.active && !a.sample);
  const index = contractIndex(apps, input.network);
  const withApp = (address: string) => {
    const app = index.get(address.toLowerCase());
    return app ? { slug: app.slug, name: app.name, logo: app.logo } : undefined;
  };

  const verified: RadarContract[] = (input.verified ?? [])
    .filter((c) => c.address?.hash)
    .map((c) => ({ address: c.address!.hash, name: c.name ?? c.address!.name ?? null, verifiedAt: c.verified_at ?? null, compiler: c.compiler_version ?? null, txCount: c.transactions_count ?? undefined, app: withApp(c.address!.hash) }))
    .sort((a, b) => (b.verifiedAt ?? "").localeCompare(a.verifiedAt ?? ""));

  const hot: RadarContract[] = (input.hot ?? [])
    .filter((h) => h.contract_address?.hash)
    .map((h) => ({ address: h.contract_address.hash, name: h.contract_address.name ?? null, txCount: h.transactions_count, app: withApp(h.contract_address.hash) }));

  const newApps = apps
    .filter((a) => now - Date.parse(a.addedAt) >= 0 && now - Date.parse(a.addedAt) < 14 * DAY)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name))
    .map((a) => ({ slug: a.slug, name: a.name, category: a.category, addedAt: a.addedAt, logo: a.logo }));

  const within = (iso: string | null | undefined, ms: number) => Boolean(iso) && now - Date.parse(iso!) >= 0 && now - Date.parse(iso!) < ms;
  const chart = input.chart ?? [];
  const d = chart.length >= 2 ? { cur: chart[chart.length - 1], prev: chart[chart.length - 2] } : null;
  const w = periodChange(chart, 7);
  const listedIn = (ms: number) => apps.filter((a) => within(a.addedAt, ms)).length;

  const day: Change[] = [
    { id: "tx", label: "Transactions", value: d?.cur.count ?? null, delta: d && d.prev.count > 0 ? (d.cur.count - d.prev.count) / d.prev.count : null, source: "derived", period: d ? `${shortDate(d.cur.date)} vs ${shortDate(d.prev.date)}` : "Latest day" },
    { id: "contracts", label: "New contracts", value: toInt(input.counters?.new_smart_contracts_24h), source: "observed", period: "Last 24h" },
    { id: "verified", label: "Newly verified", value: toInt(input.counters?.new_verified_smart_contracts_24h), source: "observed", period: "Last 24h" },
    { id: "listed", label: "Apps listed on Arcway", value: listedIn(DAY), source: "project", period: "Last 24h" }
  ];
  const week: Change[] = [
    { id: "tx", label: "Transactions", value: w?.current ?? null, delta: w?.change ?? null, source: "derived", period: w ? `${shortDate(w.from)}–${shortDate(w.to)} vs prior 7 days` : "Last 7 days" },
    { id: "verified", label: "Contracts verified", value: input.verified ? verified.filter((c) => within(c.verifiedAt, 7 * DAY)).length : null, source: "observed", period: "Last 7 days (latest 50 checked)" },
    { id: "listed", label: "Apps listed on Arcway", value: listedIn(7 * DAY), source: "project", period: "Last 7 days" }
  ];

  return { verified: verified.slice(0, 12), hot: hot.slice(0, 10), newApps, changes: { day, week } };
}

// ---------------------------------------------------------------- signals

export function buildSignals(input: {
  chart: ChartPoint[] | null;
  counters: BsContractCounters | null;
  radar: Radar;
  pulse: PulseEvent[];
  explorerHome: string;
  apps?: ArcApp[];
  now?: number;
}): Signal[] {
  const now = input.now ?? Date.now();
  const nowIso = new Date(now).toISOString();
  const out: Signal[] = [];

  const dow = dayOverWeek(input.chart ?? []);
  if (dow && Math.abs(dow.change) >= ACTIVITY_CHANGE_THRESHOLD && dow.baseline >= 10) {
    const pct = Math.round(Math.abs(dow.change) * 100);
    out.push({
      id: `activity:${dow.date}`,
      at: `${dow.date}T23:59:59Z`,
      kind: "activity-change",
      title: `Network transactions ${dow.change > 0 ? "up" : "down"} ${pct}%`,
      detail: `${dow.count.toLocaleString("en-US")} transactions on ${shortDate(dow.date)} vs a daily average of ${Math.round(dow.baseline).toLocaleString("en-US")} over ${shortDate(dow.from)}–${shortDate(dow.to)}.`,
      source: "derived",
      period: `${shortDate(dow.date)} vs prior 7 days`,
      evidence: { label: "Explorer stats", href: `${input.explorerHome}/stats` }
    });
  }

  const fresh = toInt(input.counters?.new_smart_contracts_24h);
  if (fresh && fresh > 0) {
    out.push({
      id: `contracts:${nowIso.slice(0, 13)}`,
      at: nowIso,
      kind: "new-contracts",
      title: `${fresh.toLocaleString("en-US")} new contract${fresh === 1 ? "" : "s"} deployed`,
      detail: "New smart contracts created on Arc in the last 24 hours.",
      source: "observed",
      period: "Last 24h",
      evidence: { label: "Verified contracts", href: `${input.explorerHome}/verified-contracts` }
    });
  }

  for (const c of input.radar.verified) {
    if (!c.verifiedAt || now - Date.parse(c.verifiedAt) > 7 * DAY) continue;
    out.push({
      id: `verified:${c.address.toLowerCase()}`,
      at: c.verifiedAt,
      kind: "contract-verified",
      title: `Contract verified: ${c.name ?? short(c.address)}`,
      detail: `Source code published and matched on the explorer${c.compiler ? ` (${c.compiler.split("+")[0]})` : ""}.`,
      source: "observed",
      period: "Verification time",
      entity: c.app ? { label: c.app.name, appSlug: c.app.slug, logo: c.app.logo, address: c.address } : { label: c.name ?? short(c.address), address: c.address },
      evidence: { label: "View contract", href: `${input.explorerHome}/address/${c.address}` }
    });
  }

  for (const e of input.pulse) {
    if (!e.amountUsdc || e.amountUsdc < LARGE_TRANSFER_USDC || e.failed) continue;
    out.push({
      id: `large:${e.txHash}`,
      at: e.at,
      kind: "large-transfer",
      title: `Large USDC transfer: ${Math.round(e.amountUsdc).toLocaleString("en-US")} USDC`,
      detail: `A single transfer at or above ${LARGE_TRANSFER_USDC.toLocaleString("en-US")} USDC${e.entity.appSlug ? ` involving ${e.entity.label}` : ""}.`,
      source: "observed",
      period: "Transaction time",
      entity: e.entity,
      evidence: { label: "View transaction", href: `${input.explorerHome}/tx/${e.txHash}` }
    });
  }

  input.radar.hot.forEach((h, i) => {
    if (!h.app) return;
    out.push({
      id: `hot:${h.address.toLowerCase()}:${nowIso.slice(0, 10)}`,
      at: nowIso,
      kind: "hot-contract",
      title: `${h.app.name} is among the most-used contracts`,
      detail: `Rank #${i + 1} by transactions over the last day${h.txCount ? ` (${h.txCount.toLocaleString("en-US")} transactions)` : ""}.`,
      source: "observed",
      period: "Last 24h",
      entity: { label: h.app.name, appSlug: h.app.slug, logo: h.app.logo, address: h.address },
      evidence: { label: "View contract", href: `${input.explorerHome}/address/${h.address}` }
    });
  });

  for (const a of input.radar.newApps) {
    if (now - Date.parse(a.addedAt) > 7 * DAY) continue;
    out.push({
      id: `listed:${a.slug}`,
      at: `${a.addedAt}T12:00:00Z`,
      kind: "new-listing",
      title: `Listed on Arcway: ${a.name}`,
      detail: `${a.category} app added to the directory.`,
      source: "project",
      period: "Listing date",
      entity: { label: a.name, appSlug: a.slug, logo: a.logo }
    });
  }

  return out.sort((a, b) => b.at.localeCompare(a.at));
}

// ---------------------------------------------------------------- protocols

export function buildProtocol(input: {
  app: ArcApp;
  contracts: { address: string; info: BsAddress | null; counters: { transactions_count?: string } | null; txs: BsTx[] | null }[];
  network?: ArcNetwork;
}): ProtocolIntel {
  const contracts: ProtocolContract[] = input.contracts.map((c) => ({
    address: c.address,
    name: c.info?.name ?? null,
    verified: c.info?.is_verified ?? null,
    txCount: toInt(c.counters?.transactions_count),
    lastActive: (c.txs ?? []).map((t) => t.timestamp).filter((t): t is string => Boolean(t)).sort().at(-1) ?? null
  }));
  const counts = contracts.map((c) => c.txCount);
  const txCount = counts.length && counts.every((n) => n !== null) ? counts.reduce<number>((s, n) => s + (n ?? 0), 0) : null;
  const lastActive = contracts.map((c) => c.lastActive).filter((t): t is string => Boolean(t)).sort().at(-1) ?? null;
  const recent = buildPulse({ txs: input.contracts.flatMap((c) => c.txs ?? []), transfers: null, apps: [input.app], network: input.network }).slice(0, 12);
  return { slug: input.app.slug, measurable: contracts.length > 0, contracts, txCount, lastActive, recent };
}

/** Apps with published contracts on this network, and how many had a transaction in the last 24h. */
export function activeApps(protocols: ProtocolIntel[], now: number = Date.now()): { active: number; measurable: number } {
  const measurable = protocols.filter((p) => p.measurable);
  return { measurable: measurable.length, active: measurable.filter((p) => p.lastActive && now - Date.parse(p.lastActive) < DAY).length };
}

// ---------------------------------------------------------------- passport (Arcway's own contract)

export type PassportExplorer = { address: string; xp: number; quests: number; lastAt: string | null };

export type PassportStats = {
  deployed: boolean;
  address: string | null;
  verified: boolean | null;
  transactions: number | null;
  passports: number;
  xp: number;
  completions: number;
  byQuest: { id: string; title: string; count: number }[];
  leaderboard: PassportExplorer[];
  season: { label: string; start: string; leaderboard: PassportExplorer[] };
  truncated: boolean;
  /** Where the completions were read from: Arcway's own indexer, or the Arc explorer's logs. */
  source: "indexer" | "explorer" | "rpc";
};

/** One QuestCompleted event, already decoded (the indexer's Completion rows map straight onto this). */
export type PassportCompletion = { user: string; quest: string; xp: number; at: string | null };

const QUEST_BY_HASH = new Map(QUESTS.map((q) => [questHash(q.id).toLowerCase(), q]));

/** Monthly seasons in UTC: "September 2026", starting on the 1st. */
export function seasonOf(now: number) {
  const d = new Date(now);
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  return { label: start.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }), start: start.toISOString() };
}

/** Passport activity from QuestCompleted logs. Ranked by XP earned, never by balance. */
export function buildPassportStats(input: {
  address: string | null;
  logs: BsLog[] | null;
  /** Pre-decoded completions (from the indexer). When given, `logs` is ignored. */
  completions?: PassportCompletion[] | null;
  truncated?: boolean;
  info?: BsAddress | null;
  counters?: { transactions_count?: string } | null;
  now?: number;
  /** Where pre-decoded completions came from (defaults to the indexer). */
  source?: "indexer" | "rpc";
}): PassportStats {
  const now = input.now ?? Date.now();
  const season = seasonOf(now);
  const empty: PassportStats = {
    deployed: Boolean(input.address), address: input.address, verified: input.info?.is_verified ?? null,
    transactions: toInt(input.counters?.transactions_count), passports: 0, xp: 0, completions: 0, byQuest: [],
    leaderboard: [], season: { ...season, leaderboard: [] }, truncated: Boolean(input.truncated),
    source: input.completions ? input.source ?? "indexer" : "explorer"
  };
  if (!input.address || !(input.completions ?? input.logs)) return empty;

  type Row = PassportCompletion;
  const rows: Row[] = input.completions ? input.completions.map((c) => ({ ...c, user: c.user.toLowerCase(), quest: c.quest.toLowerCase() })) : [];
  for (const log of input.completions ? [] : input.logs ?? []) {
    try {
      const ev = decodeEventLog({ abi: passportAbi, data: log.data as Hex, topics: log.topics.filter(Boolean) as [Hex, ...Hex[]] });
      if (ev.eventName !== "QuestCompleted") continue;
      rows.push({ user: ev.args.user.toLowerCase(), quest: String(ev.args.questId).toLowerCase(), xp: Number(ev.args.xpAwarded), at: log.block_timestamp ?? null });
    } catch {
      /* not a passport event we read */
    }
  }

  const rank = (list: Row[]): PassportExplorer[] => {
    const m = new Map<string, PassportExplorer>();
    for (const r of list) {
      const e = m.get(r.user) ?? { address: r.user, xp: 0, quests: 0, lastAt: null };
      e.xp += r.xp;
      e.quests += 1;
      if (r.at && (!e.lastAt || r.at > e.lastAt)) e.lastAt = r.at;
      m.set(r.user, e);
    }
    return [...m.values()].sort((a, b) => b.xp - a.xp || b.quests - a.quests || (a.lastAt ?? "").localeCompare(b.lastAt ?? "")).slice(0, 25);
  };

  const byQuest = new Map<string, number>();
  for (const r of rows) byQuest.set(r.quest, (byQuest.get(r.quest) ?? 0) + 1);

  return {
    ...empty,
    passports: new Set(rows.map((r) => r.user)).size,
    xp: rows.reduce((s, r) => s + r.xp, 0),
    completions: rows.length,
    byQuest: [...byQuest].map(([h, count]) => ({ id: QUEST_BY_HASH.get(h)?.id ?? h, title: QUEST_BY_HASH.get(h)?.title ?? "Other quest", count })).sort((a, b) => b.count - a.count),
    leaderboard: rank(rows),
    season: { ...season, leaderboard: rank(rows.filter((r) => r.at && r.at >= season.start)) }
  };
}
