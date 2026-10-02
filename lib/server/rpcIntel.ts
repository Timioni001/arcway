import { getContractAddress, parseAbiItem, type Address } from "viem";
import { USDC_ADDRESS } from "../config";
import type { PassportCompletion } from "../intel";
import type { BsStats, BsTokenTransfer, BsTx } from "./explorer";
import { publicClient } from "./arc";

/**
 * Reads straight from Arc's RPC, no explorer involved: the passport's own events, the latest
 * blocks and recent USDC transfers. These keep the leaderboard, the live feed and basic network
 * stats working when the explorer API can't be reached.
 */

const QUEST_COMPLETED = parseAbiItem("event QuestCompleted(address indexed user, bytes32 indexed questId, uint256 xpAwarded)");
const TRANSFER = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

/** getLogs over a range, halving the window when the node refuses a range that big. */
async function logsInRange<T>(from: bigint, to: bigint, read: (a: bigint, b: bigint) => Promise<T[]>, startStep = 100_000n): Promise<T[]> {
  const out: T[] = [];
  let step = startStep;
  let a = from;
  while (a <= to) {
    const b = a + step - 1n > to ? to : a + step - 1n;
    try {
      out.push(...(await read(a, b)));
      a = b + 1n;
    } catch (e) {
      if (step <= 500n) throw e;
      step /= 4n;
    }
  }
  return out;
}

/** Where a contract was deployed: PASSPORT_DEPLOY_BLOCK if set, else a binary search on its code. */
const deployBlocks = new Map<string, bigint>();
async function deployBlock(address: Address, latest: bigint): Promise<bigint> {
  const env = process.env.PASSPORT_DEPLOY_BLOCK;
  if (env && /^\d+$/.test(env)) return BigInt(env);
  const known = deployBlocks.get(address.toLowerCase());
  if (known !== undefined) return known;
  let lo = 0n, hi = latest;
  try {
    while (lo < hi) {
      const mid = (lo + hi) / 2n;
      const code = await publicClient.getCode({ address, blockNumber: mid });
      if (code && code !== "0x") hi = mid; else lo = mid + 1n;
    }
  } catch {
    // Node without history for old blocks: scan the most recent ~3M blocks instead.
    lo = latest > 3_000_000n ? latest - 3_000_000n : 0n;
  }
  deployBlocks.set(address.toLowerCase(), lo);
  return lo;
}

/** Timestamps for the blocks the events landed in (batched, capped; the rest are interpolated). */
async function blockTimes(blocks: bigint[]): Promise<Map<bigint, number>> {
  const unique = [...new Set(blocks)].sort((x, y) => (x < y ? -1 : 1));
  const times = new Map<bigint, number>();
  const pick = unique.length <= 400 ? unique : unique.filter((_, i) => i % Math.ceil(unique.length / 400) === 0 || i === unique.length - 1);
  for (let i = 0; i < pick.length; i += 20) {
    const part = await Promise.all(pick.slice(i, i + 20).map((n) => publicClient.getBlock({ blockNumber: n }).then((b) => [n, Number(b.timestamp) * 1000] as const)));
    for (const [n, t] of part) times.set(n, t);
  }
  const known = [...times.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1));
  for (const n of unique) {
    if (times.has(n) || known.length < 2) continue;
    const after = known.findIndex(([k]) => k > n);
    const [a, b] = after <= 0 ? [known[0], known[1]] : [known[after - 1], known[after]];
    times.set(n, a[1] + ((b[1] - a[1]) * Number(n - a[0])) / Math.max(1, Number(b[0] - a[0])));
  }
  return times;
}

/** Every QuestCompleted the passport has emitted, read incrementally and kept per instance. */
const cache = new Map<string, { to: bigint; rows: PassportCompletion[] }>();
export async function rpcPassportCompletions(address: Address): Promise<{ rows: PassportCompletion[]; truncated: boolean }> {
  const latest = await publicClient.getBlockNumber();
  const key = address.toLowerCase();
  const prev = cache.get(key);
  const from = prev ? prev.to + 1n : await deployBlock(address, latest);
  if (from > latest) return { rows: prev?.rows ?? [], truncated: false };
  const logs = await logsInRange(from, latest, (a, b) => publicClient.getLogs({ address, event: QUEST_COMPLETED, fromBlock: a, toBlock: b }));
  const times = await blockTimes(logs.map((l) => l.blockNumber!).filter((n): n is bigint => n !== null));
  const rows = [...(prev?.rows ?? []), ...logs.map((l) => ({
    user: String(l.args.user).toLowerCase(),
    quest: String(l.args.questId).toLowerCase(),
    xp: Number(l.args.xpAwarded ?? 0n),
    at: l.blockNumber != null && times.has(l.blockNumber) ? new Date(times.get(l.blockNumber)!).toISOString() : null
  }))];
  cache.set(key, { to: latest, rows });
  return { rows, truncated: false };
}

/** Recent transactions (last blocks) and USDC transfers, shaped like the explorer's so one builder serves both. */
export async function rpcPulse(): Promise<{ txs: BsTx[]; transfers: BsTokenTransfer[] }> {
  const latest = await publicClient.getBlockNumber();
  const blocks = await Promise.all(Array.from({ length: 24 }, (_, i) => latest - BigInt(i)).filter((n) => n >= 0n).map((n) => publicClient.getBlock({ blockNumber: n, includeTransactions: true }).catch(() => null)));
  const stamp = new Map<bigint, string>();
  const txs: BsTx[] = [];
  for (const b of blocks) {
    if (!b) continue;
    const at = new Date(Number(b.timestamp) * 1000).toISOString();
    stamp.set(b.number!, at);
    for (const tx of b.transactions) {
      if (typeof tx === "string") continue;
      txs.push({
        hash: tx.hash, timestamp: at, from: { hash: tx.from }, to: tx.to ? { hash: tx.to } : null,
        created_contract: tx.to ? null : { hash: getContractAddress({ from: tx.from, nonce: BigInt(tx.nonce) }) },
        value: tx.value.toString(), status: null
      });
    }
  }
  const logs = await publicClient.getLogs({ address: USDC_ADDRESS, event: TRANSFER, fromBlock: latest > 2_000n ? latest - 2_000n : 0n, toBlock: latest }).catch(() => []);
  const recent = logs.slice(-60).reverse();
  const missing = [...new Set(recent.map((l) => l.blockNumber!).filter((n) => n !== null && !stamp.has(n)))];
  if (missing.length) for (const [n, t] of await blockTimes(missing)) stamp.set(n, new Date(t).toISOString());
  const transfers: BsTokenTransfer[] = recent.map((l) => ({
    transaction_hash: l.transactionHash!, timestamp: l.blockNumber != null ? stamp.get(l.blockNumber) ?? null : null,
    from: { hash: String(l.args.from) }, to: { hash: String(l.args.to) },
    token: { address_hash: USDC_ADDRESS, symbol: "USDC", decimals: "6" }, total: { decimals: "6", value: String(l.args.value ?? 0n) }
  }));
  return { txs: txs.slice(0, 60), transfers };
}

/** Network basics from the chain itself: block height and the recent average block time. */
export async function rpcStats(): Promise<BsStats> {
  const latest = await publicClient.getBlock();
  const back = latest.number! > 200n ? 200n : latest.number!;
  const old = await publicClient.getBlock({ blockNumber: latest.number! - back });
  const avgMs = back > 0n ? (Number(latest.timestamp - old.timestamp) * 1000) / Number(back) : undefined;
  return { total_blocks: latest.number!.toString(), average_block_time: avgMs };
}
