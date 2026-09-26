import type { Page } from "@playwright/test";
import { encodeAbiParameters, encodeEventTopics } from "viem";
import { passportAbi } from "../../lib/abi";
import { questHash } from "../../lib/quests";
import { buildPassportStats, buildProtocol, buildPulse, buildRadar, buildSignals, buildSnapshot, normalizeChart, type Intel } from "../../lib/intel";
import { APPS } from "../../lib/registry";

/**
 * Test-only data in Blockscout's response shapes, run through the real derivations,
 * so UI tests are deterministic and never depend on a live explorer.
 */
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (d: number) => new Date(now - d * 86_400_000).toISOString().slice(0, 10);
const uni = APPS.find((a) => a.id === "uniswap")!;
const UNI = (uni.contracts?.mainnet ?? [])[0] ?? "0x4fca4a51ab4f23a7447b3284fbd7d73289a89fb1";
const hex = (n: number, len = 40) => `0x${n.toString(16).padStart(len, "0")}`;

const chart = normalizeChart(Array.from({ length: 30 }, (_, i) => ({ date: day(30 - i), transactions_count: 42_000 + Math.round(Math.sin(i / 3) * 6_000) + i * 900 })));
const txs = Array.from({ length: 24 }, (_, i) => {
  const kind = i % 4;
  return {
    hash: hex(1000 + i, 64),
    timestamp: iso(i * 23_000 + 4_000),
    from: { hash: hex(500 + i) },
    to: kind === 0 ? { hash: UNI, is_contract: true, name: "UniversalRouter" } : kind === 1 ? null : { hash: hex(900 + i), is_contract: kind === 2, name: kind === 2 ? "StablePool" : null },
    created_contract: kind === 1 ? { hash: hex(700 + i), name: i % 8 === 1 ? "PaymentSplitter" : null } : null,
    method: kind === 0 ? "execute" : kind === 2 ? "swap" : null,
    status: i === 6 ? ("error" as const) : ("ok" as const),
    value: kind === 3 ? (BigInt(25 + i) * 10n ** 18n).toString() : "0"
  };
});
const transfers = Array.from({ length: 10 }, (_, i) => ({
  transaction_hash: hex(3000 + i, 64),
  timestamp: iso(i * 41_000 + 9_000),
  from: { hash: hex(40 + i) },
  to: { hash: hex(80 + i) },
  type: "token_transfer",
  total: { decimals: "6", value: (i === 2 ? 250_000n * 10n ** 6n : BigInt(120 + i * 37) * 10n ** 6n).toString() }
}));
const verified = [
  { address: { hash: UNI }, name: "UniversalRouter", verified_at: iso(5 * 3_600_000), compiler_version: "v0.8.26+commit.8a97fa7a" },
  { address: { hash: hex(4101) }, name: "LendingPool", verified_at: iso(26 * 3_600_000), compiler_version: "v0.8.24+commit.e11b9ed9" },
  { address: { hash: hex(4102) }, name: "PaymentRouter", verified_at: iso(3 * 86_400_000) },
  { address: { hash: hex(4103) }, name: "AgentVault", verified_at: iso(5 * 86_400_000) }
];
const hot = [
  { contract_address: { hash: hex(4200), name: "StablePool" }, transactions_count: 18_420, total_gas_used: 1 },
  { contract_address: { hash: UNI, name: "UniversalRouter" }, transactions_count: 9_310, total_gas_used: 1 },
  { contract_address: { hash: hex(4201), name: null }, transactions_count: 4_105, total_gas_used: 1 }
];
const counters = { new_smart_contracts_24h: "37", new_verified_smart_contracts_24h: "4", smart_contracts: "12840", verified_smart_contracts: "1316" };

const env = <T,>(data: T): Intel<T> => ({ data, fetchedAt: new Date().toISOString(), network: "mainnet", unavailable: [] });
const pulse = buildPulse({ txs, transfers, network: "mainnet" });
const radar = buildRadar({ verified, hot, chart, counters, network: "mainnet", now });

export const INTEL = {
  snapshot: env(buildSnapshot({ stats: { total_addresses: "1843200", average_block_time: 480, transactions_today: "51230" }, chart, counters, usdc: { transfers_count: "9412077", token_holders_count: "412330" }, activeApps: { active: 1, measurable: 1 }, now })),
  pulse: env(pulse),
  radar: env(radar),
  signals: env(buildSignals({ chart, counters, radar, pulse, explorerHome: "https://explorer.arc.io", now })),
  protocol: env(buildProtocol({
    app: uni,
    network: "mainnet",
    contracts: (uni.contracts?.mainnet ?? [UNI]).map((address, i) => ({
      address,
      info: { hash: address, name: ["UniversalRouter", "UniversalRouter", "SwapRouter02", "QuoterV2", "NonfungiblePositionManager"][i] ?? null, is_verified: i !== 3 },
      counters: { transactions_count: String(120_000 - i * 21_000) },
      txs: txs.filter((t) => t.to?.hash === UNI).map((t) => ({ ...t, to: { hash: address, is_contract: true } }))
    }))
  }))
};

const passportLogs = [
  { user: "0x7a00000000000000000000000000000000092f1a", quest: "arrive-with-usdc", xp: 10 },
  { user: "0x7a00000000000000000000000000000000092f1a", quest: "first-tx", xp: 25 },
  { user: "0x1111111111111111111111111111111111111111", quest: "arrive-with-usdc", xp: 10 }
].map((l, i) => ({
  block_number: 100 + i,
  block_timestamp: iso(i * 3_600_000),
  index: 0,
  transaction_hash: hex(9000 + i, 64),
  topics: encodeEventTopics({ abi: passportAbi, eventName: "QuestCompleted", args: { user: l.user as `0x${string}`, questId: questHash(l.quest) } }) as string[],
  data: encodeAbiParameters([{ type: "uint256" }], [BigInt(l.xp)])
}));

export const EXTRA: Record<string, unknown> = {
  passport: env(buildPassportStats({ address: "0xa8a4A8FdE3fdCe351b9b22ACc3368e3b308b0107", logs: passportLogs, info: { hash: "0xa8a4", is_verified: true }, counters: { transactions_count: "3" }, now })),
  check: env({ address: "0x7a00000000000000000000000000000000092f1a", isContract: true, verified: true, name: "Tipjar", transactions: 42 })
};

/** Serve fixtures for every intel endpoint. `fail` makes them return the real error shape. */
export async function mockIntel(page: Page, { fail = false }: { fail?: boolean } = {}) {
  await page.route("**/api/intel/**", async (route) => {
    if (fail) return route.fulfill({ status: 502, json: { error: "arc_unavailable", message: "Arc data is unavailable right now." } });
    const path = new URL(route.request().url()).pathname.replace("/api/intel/", "");
    const key = path.startsWith("protocol/") ? "protocol" : (path as keyof typeof INTEL);
    if (path in EXTRA) return route.fulfill({ json: EXTRA[path] });
    const body = key === "protocol" && !path.endsWith("/uniswap") ? { ...INTEL.protocol, data: { ...INTEL.protocol.data, slug: path.split("/")[1], measurable: false, contracts: [], txCount: null, lastActive: null, recent: [] } } : INTEL[key];
    return body ? route.fulfill({ json: body }) : route.fulfill({ status: 404, json: { error: "invalid_request", message: "Not found." } });
  });
}
