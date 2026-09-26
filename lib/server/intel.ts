import { ARC_NETWORK, USDC_ADDRESS, explorer } from "../config";
import {
  activeApps, buildProtocol, buildPulse, buildRadar, buildSignals, buildSnapshot,
  type Intel, type ProtocolIntel, type PulseEvent, type Radar, type Signal, type Snapshot
} from "../intel";
import { APPS, appContracts, getApp, type ArcApp } from "../registry";
import {
  getAddress, getAddressCounters, getAddressTxs, getContractCounters, getHotContracts, getLatestTxs,
  getStats, getTokenCounters, getTokenTransfers, getTxChart, getVerifiedContracts, settle
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
