import { INDEXER_ENABLED, getIndexedCompletions } from "./indexer";
import { ARC_NETWORK, PASSPORT_ADDRESS, USDC_ADDRESS, explorer } from "../config";
import {
  activeApps, buildPassportStats, buildProtocol, type PassportStats, buildPulse, buildRadar, buildSignals, buildSnapshot,
  type Intel, type ProtocolIntel, type PulseEvent, type Radar, type Signal, type Snapshot
} from "../intel";
import { buildAssetDetail, buildAssets, type Asset, type AssetDetail } from "../assets";
import { APPS, appContracts, getApp, type ArcApp } from "../registry";
import {
  getAddress, getAddressCounters, getAddressLogs, getAddressTxs, getContractCounters, getHotContracts, getLatestTxs,
  getStats, getToken, getTokenCounters, getTokenTransfers, getTokens, getTxChart, getVerifiedContracts, settle
} from "./explorer";

/** Thrown when every source for a view failed; routes turn it into a 502. */
export class IntelUnavailable extends Error {}

function envelope<T>(data: T, parts: Record<string, unknown>): Intel<T> {
  const unavailable = Object.entries(parts).filter(([, v]) => v === null).map(([k]) => k);
  if (unavailable.length === Object.keys(parts).length) throw new IntelUnavailable("Arc data is unavailable right now.");
  return { data, fetchedAt: new Date().toISOString(), network: ARC_NETWORK, unavailable };
}

const measurableApps = () => APPS.filter((a) => a.active && !a.sample && appContracts(a).length > 0);

async function protocolFor(app: ArcApp): Promise<ProtocolIntel> {
  const contracts = await Promise.all(
    appContracts(app).map(async (address) => {
      const [info, counters, txs] = await Promise.all([settle(getAddress(address)), settle(getAddressCounters(address)), settle(getAddressTxs(address))]);
      return { address, info, counters, txs };
    })
  );
  return buildProtocol({ app, contracts, network: ARC_NETWORK });
}

export async function loadSnapshot(): Promise<Intel<Snapshot>> {
  const [stats, chart, counters, usdc, protocols] = await Promise.all([
    settle(getStats()),
    settle(getTxChart()),
    settle(getContractCounters()),
    settle(getTokenCounters(USDC_ADDRESS)),
    settle(Promise.all(measurableApps().map(protocolFor)))
  ]);
  const active = protocols && protocols.every((p) => p.contracts.every((c) => c.lastActive !== null || c.txCount !== null)) ? activeApps(protocols) : null;
  return envelope(buildSnapshot({ stats, chart, counters, usdc, activeApps: active }), { stats, chart, counters, usdc });
}

export async function loadPulse(): Promise<Intel<PulseEvent[]>> {
  const [txs, transfers] = await Promise.all([settle(getLatestTxs()), settle(getTokenTransfers(USDC_ADDRESS))]);
  return envelope(buildPulse({ txs, transfers, network: ARC_NETWORK }).slice(0, 60), { txs, transfers });
}

async function radarParts() {
  const [verified, hot, chart, counters] = await Promise.all([
    settle(getVerifiedContracts()),
    settle(getHotContracts("1d")),
    settle(getTxChart()),
    settle(getContractCounters())
  ]);
  return { parts: { verified, hot, chart, counters }, radar: buildRadar({ verified, hot, chart, counters, network: ARC_NETWORK }) };
}

export async function loadRadar(): Promise<Intel<Radar>> {
  const { parts, radar } = await radarParts();
  return envelope(radar, parts);
}

export async function loadSignals(): Promise<Intel<Signal[]>> {
  const [{ parts, radar }, pulse] = await Promise.all([radarParts(), settle(loadPulse())]);
  const signals = buildSignals({ chart: parts.chart, counters: parts.counters, radar, pulse: pulse?.data ?? [], explorerHome: explorer.home });
  return envelope(signals, { ...parts, pulse });
}

export async function loadProtocol(slug: string): Promise<Intel<ProtocolIntel> | undefined> {
  const app = getApp(slug);
  if (!app || app.sample) return undefined;
  const intel = await protocolFor(app);
  const parts = Object.fromEntries(intel.contracts.map((c) => [c.address, c.txCount === null && c.lastActive === null ? null : c]));
  if (!intel.measurable) return { data: intel, fetchedAt: new Date().toISOString(), network: ARC_NETWORK, unavailable: [] };
  return envelope(intel, parts);
}

/** Tokens on Arc, ranked by holders. */
export async function loadAssets(): Promise<Intel<Asset[]>> {
  const tokens = await settle(getTokens());
  return envelope(buildAssets(tokens ?? []), { tokens });
}

/** One token: explorer metadata, counters, recent transfers and the listed apps seen in them. */
export async function loadAsset(address: string): Promise<Intel<AssetDetail> | undefined> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return undefined;
  const [token, counters, transfers] = await Promise.all([settle(getToken(address)), settle(getTokenCounters(address)), settle(getTokenTransfers(address))]);
  if (!token) {
    if (counters || transfers) return undefined;
    throw new IntelUnavailable("Arc data is unavailable right now.");
  }
  const data = buildAssetDetail({ token, counters, transfers, network: ARC_NETWORK });
  return data ? envelope(data, { token, counters, transfers }) : undefined;
}

/** Arcway's own passport contract on this network: proof of onchain use, and the leaderboard. */
export async function loadPassport(): Promise<Intel<PassportStats>> {
  if (!PASSPORT_ADDRESS) {
    return { data: buildPassportStats({ address: null, logs: null }), fetchedAt: new Date().toISOString(), network: ARC_NETWORK, unavailable: [] };
  }
  const [info, counters] = await Promise.all([settle(getAddress(PASSPORT_ADDRESS)), settle(getAddressCounters(PASSPORT_ADDRESS))]);
  // Prefer Arcway's own indexer; fall back to scanning the contract's logs on the explorer.
  const indexed = INDEXER_ENABLED ? await settle(getIndexedCompletions()) : null;
  if (indexed) {
    const data = buildPassportStats({ address: PASSPORT_ADDRESS, logs: null, completions: indexed.rows, truncated: indexed.truncated, info, counters });
    return envelope(data, { info, counters, completions: indexed });
  }
  const logs = await settle(getAddressLogs(PASSPORT_ADDRESS));
  const data = buildPassportStats({ address: PASSPORT_ADDRESS, logs: logs?.items ?? null, truncated: logs?.truncated, info, counters });
  return envelope(data, { info, counters, logs });
}

/** Live check for a submitted contract address: is it a contract on this network, and is its source verified? */
export async function checkContract(address: string): Promise<Intel<{ address: string; isContract: boolean | null; verified: boolean | null; name: string | null; transactions: number | null }>> {
  const [info, counters] = await Promise.all([settle(getAddress(address)), settle(getAddressCounters(address))]);
  const tx = counters?.transactions_count ? Number(counters.transactions_count) : null;
  return envelope({ address, isContract: info?.is_contract ?? null, verified: info?.is_verified ?? null, name: info?.name ?? null, transactions: Number.isFinite(tx) ? tx : null }, { info, counters });
}
