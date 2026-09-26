import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CHANGE_THRESHOLD, activeApps, buildProtocol, buildPulse, buildRadar, buildSignals, buildSnapshot,
  dayOverWeek, normalizeChart, periodChange, unitsToUsdc
} from "../lib/intel";
import { APPS } from "../lib/registry";

const NOW = Date.parse("2026-09-26T12:00:00Z");
const uni = APPS.find((a) => a.id === "uniswap")!;
const UNI = uni.contracts!.mainnet![0];
const chart = normalizeChart([
  ...Array.from({ length: 7 }, (_, i) => ({ date: `2026-09-${String(18 + i).padStart(2, "0")}`, transactions_count: 1000 })),
  { date: "2026-09-25", transaction_count: 1500 }
]);

describe("chart helpers", () => {
  it("accepts every key Blockscout has used and sorts by date", () => {
    expect(normalizeChart([{ date: "2026-09-02", tx_count: 2 }, { date: "2026-09-01", transactions_count: "1" }, { date: "bad", tx_count: 1 }]))
      .toEqual([{ date: "2026-09-01", count: 1 }, { date: "2026-09-02", count: 2 }]);
  });
  it("compares the last day to the prior seven", () => {
    const d = dayOverWeek(chart)!;
    expect(d.change).toBeCloseTo(0.5);
    expect(d.from).toBe("2026-09-18");
    expect(dayOverWeek(chart.slice(0, 5))).toBeNull();
  });
  it("compares periods only when the previous one is complete", () => {
    expect(periodChange(chart, 7)?.change).toBeNull();
    expect(periodChange(chart, 4)?.change).toBeCloseTo((1000 * 3 + 1500) / 4000 - 1);
  });
  it("converts base units without floating point surprises", () => {
    expect(unitsToUsdc("1234567", 6)).toBeCloseTo(1.234567);
    expect(unitsToUsdc("250000000000000000000000", 18)).toBe(250_000);
    expect(unitsToUsdc("nope", 6)).toBeNull();
  });
});

describe("snapshot", () => {
  it("labels every metric with a source and period, and never invents values", () => {
    const s = buildSnapshot({ stats: null, chart: null, counters: null, usdc: null, activeApps: null, now: NOW });
    for (const m of s.metrics) {
      expect(m.source).toBeTruthy();
      expect(m.period).toBeTruthy();
    }
    expect(s.metrics.filter((m) => m.source !== "project").every((m) => m.value === null)).toBe(true);
  });
  it("uses the latest complete chart day for transactions", () => {
    const s = buildSnapshot({ stats: { transactions_today: "9" }, chart, counters: { new_smart_contracts_24h: "4" }, usdc: null, activeApps: { active: 1, measurable: 1 }, now: NOW });
    const tx = s.metrics.find((m) => m.id === "tx-day")!;
    expect(tx.value).toBe(1500);
    expect(tx.period).toMatch(/Sep 25/);
    expect(s.metrics.find((m) => m.id === "contracts-new")!.value).toBe(4);
  });
});

describe("pulse", () => {
  const txs = [
    { hash: "0x1", timestamp: "2026-09-26T11:00:00Z", from: { hash: "0xaaa" }, to: { hash: UNI.toLowerCase(), is_contract: true }, method: "execute", status: "ok" as const, value: "0" },
    { hash: "0x2", timestamp: "2026-09-26T11:01:00Z", from: { hash: "0xbbb" }, to: null, created_contract: { hash: "0xccc", name: "Vault" }, status: "ok" as const, value: "0" },
    { hash: "0x3", timestamp: "2026-09-26T11:02:00Z", from: { hash: "0xddd" }, to: { hash: "0xeee", is_contract: false }, status: "ok" as const, value: "2000000000000000000" },
    { hash: "0x4", timestamp: "2026-09-26T11:03:00Z", from: { hash: "0xddd" }, to: { hash: "0xfff", is_contract: true, name: "Pool" }, method: "swap", status: "error" as const, value: "0" }
  ];
  const transfers = [
    { transaction_hash: "0x1", timestamp: "2026-09-26T11:00:00Z", from: { hash: "0xaaa" }, to: { hash: UNI }, total: { decimals: "6", value: "5000000" } },
    { transaction_hash: "0x5", timestamp: "2026-09-26T11:04:00Z", from: { hash: "0x111" }, to: { hash: "0x222" }, total: { decimals: "6", value: "150000000000" } }
  ];
  const events = buildPulse({ txs, transfers, network: "mainnet" });
  it("classifies events and matches listed apps", () => {
    expect(events.map((e) => [e.txHash, e.kind])).toEqual([["0x5", "usdc"], ["0x4", "call"], ["0x3", "transfer"], ["0x2", "deploy"], ["0x1", "app"]]);
    expect(events.find((e) => e.txHash === "0x1")).toMatchObject({ title: "Uniswap interaction", amountUsdc: 5, entity: { appSlug: "uniswap" } });
    expect(events.find((e) => e.txHash === "0x4")!.failed).toBe(true);
    expect(events.find((e) => e.txHash === "0x3")!.amountUsdc).toBe(2);
  });
  it("turns large transfers into observed signals with evidence", () => {
    const radar = buildRadar({ verified: [], hot: [], chart, counters: null, apps: [], network: "mainnet", now: NOW });
    const signals = buildSignals({ chart, counters: { new_smart_contracts_24h: "0" }, radar, pulse: events, explorerHome: "https://explorer.arc.io", apps: [], now: NOW });
    const large = signals.find((s) => s.kind === "large-transfer")!;
    expect(large.title).toMatch(/150,000 USDC/);
    expect(large.evidence?.href).toBe("https://explorer.arc.io/tx/0x5");
    expect(signals.find((s) => s.kind === "activity-change")!.title).toBe("Network transactions up 50%");
    expect(signals.some((s) => s.kind === "new-contracts")).toBe(false);
  });
});

describe("radar and signals", () => {
  const verified = [
    { address: { hash: "0xold" }, name: "Old", verified_at: "2026-08-01T00:00:00Z" },
    { address: { hash: UNI }, name: "UniversalRouter", verified_at: "2026-09-25T00:00:00Z", compiler_version: "v0.8.26+commit.8a97fa7a" }
  ];
  const hot = [{ contract_address: { hash: "0xhot", name: "Mystery" }, transactions_count: 900, total_gas_used: 1 }, { contract_address: { hash: UNI }, transactions_count: 500, total_gas_used: 1 }];
  const radar = buildRadar({ verified, hot, chart, counters: { new_smart_contracts_24h: "3", new_verified_smart_contracts_24h: "1" }, network: "mainnet", now: NOW });
  it("sorts newly verified contracts and links listed apps", () => {
    expect(radar.verified[0]).toMatchObject({ name: "UniversalRouter", app: { slug: "uniswap" } });
    expect(radar.hot.map((h) => h.app?.slug ?? null)).toEqual([null, "uniswap"]);
    expect(radar.changes.day.find((c) => c.id === "tx")!.delta).toBeCloseTo(0.5);
    expect(radar.changes.week.find((c) => c.id === "verified")!.value).toBe(1);
  });
  it("only reports recent verifications and listed hot contracts", () => {
    const signals = buildSignals({ chart: null, counters: null, radar, pulse: [], explorerHome: "https://x", now: NOW });
    expect(signals.filter((s) => s.kind === "contract-verified").map((s) => s.title)).toEqual(["Contract verified: UniversalRouter"]);
    expect(signals.find((s) => s.kind === "hot-contract")!.detail).toMatch(/#2/);
    for (const s of signals) expect(["observed", "derived", "project"]).toContain(s.source);
  });
  it("stays quiet on small changes", () => {
    const flat = normalizeChart(Array.from({ length: 8 }, (_, i) => ({ date: `2026-09-${String(18 + i).padStart(2, "0")}`, tx_count: 1000 + i })));
    const signals = buildSignals({ chart: flat, counters: null, radar: { ...radar, verified: [], hot: [], newApps: [] }, pulse: [], explorerHome: "https://x", now: NOW });
    expect(signals).toEqual([]);
    expect(ACTIVITY_CHANGE_THRESHOLD).toBeGreaterThan(0);
  });
});

describe("protocol intelligence", () => {
  it("sums activity only when every contract was read", () => {
    const full = buildProtocol({
      app: uni,
      network: "mainnet",
      contracts: [
        { address: UNI, info: { hash: UNI, name: "UniversalRouter", is_verified: true }, counters: { transactions_count: "10" }, txs: [{ hash: "0x9", timestamp: "2026-09-26T10:00:00Z", from: { hash: "0x1" }, to: { hash: UNI, is_contract: true } }] },
        { address: "0xB", info: null, counters: { transactions_count: "5" }, txs: [] }
      ]
    });
    expect(full.txCount).toBe(15);
    expect(full.lastActive).toBe("2026-09-26T10:00:00Z");
    expect(full.recent[0].kind).toBe("app");
    expect(activeApps([full], NOW)).toEqual({ active: 1, measurable: 1 });
    const partial = buildProtocol({ app: uni, network: "mainnet", contracts: [{ address: UNI, info: null, counters: null, txs: null }] });
    expect(partial.txCount).toBeNull();
    expect(activeApps([partial], NOW)).toEqual({ active: 0, measurable: 1 });
  });
});
