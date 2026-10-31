import type { Address } from "viem";
import { bountiesAbi } from "../bountiesAbi";
import { BOUNTIES_CONTRACT, BOUNTIES_MAINNET, BOUNTIES_MAINNET_BLOCK } from "../config";
import { logsClient, publicClient } from "./arc";
import { blockTimes, logsInRange } from "./rpcIntel";

export type BountyEvent = {
  kind: "created" | "funded" | "claimed" | "closed";
  id: number;
  who: string | null;
  amount: string; // USDC base units
  tx: string;
  at: string | null;
};

type Log = { eventName: string; args: Record<string, unknown>; transactionHash: string | null; blockNumber: bigint | null; logIndex: number | null };

const cache = new Map<string, { to: bigint; events: BountyEvent[] }>();

function toEvent(l: Log, times: Map<bigint, number>): BountyEvent | null {
  const a = l.args;
  const at = l.blockNumber != null && times.has(l.blockNumber) ? new Date(times.get(l.blockNumber)!).toISOString() : null;
  const base = { id: Number(a.id ?? 0), tx: l.transactionHash ?? "", at };
  switch (l.eventName) {
    case "BountyCreated": return { ...base, kind: "created", who: String(a.sponsor).toLowerCase(), amount: (BigInt(String(a.rewardPerClaim)) * BigInt(String(a.maxClaims))).toString() };
    case "BountyClaimed": return { ...base, kind: "claimed", who: String(a.claimer).toLowerCase(), amount: String(a.amount) };
    case "BountyFunded": return { ...base, kind: "funded", who: null, amount: String(a.addedClaims) };
    case "BountyClosed": return { ...base, kind: "closed", who: null, amount: String(a.refunded) };
    default: return null;
  }
}

/** Every ArcwayBounties event, newest first, read straight from Arc and kept incrementally. */
export async function bountyActivity(): Promise<{ events: BountyEvent[] } | undefined> {
  const address = BOUNTIES_CONTRACT as Address | undefined;
  if (!address) return undefined;
  const latest = await publicClient.getBlockNumber();
  const key = address.toLowerCase();
  const prev = cache.get(key);
  const start = prev ? prev.to + 1n : key === BOUNTIES_MAINNET ? BOUNTIES_MAINNET_BLOCK : latest > 500_000n ? latest - 500_000n : 0n;
  if (start > latest) return { events: prev?.events ?? [] };
  const logs = (await logsInRange(start, latest, (from, to) =>
    logsClient.getContractEvents({ address, abi: bountiesAbi, fromBlock: from, toBlock: to }) as Promise<Log[]>));
  const times = await blockTimes(logs.map((l) => l.blockNumber).filter((n): n is bigint => n !== null));
  const fresh = logs.map((l) => toEvent(l, times)).filter((e): e is BountyEvent => e !== null).reverse();
  const events = [...fresh, ...(prev?.events ?? [])];
  cache.set(key, { to: latest, events });
  return { events };
}
