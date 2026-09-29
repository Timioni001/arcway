import { type Address, type Hex, decodeEventLog, getAddress, isAddressEqual } from "viem";
import { passportAbi } from "../abi";
import { buildResults, allocate, type ResultsTree } from "../campaignDraw";
import { campaignsAbi, erc20ApproveAbi } from "../campaignsAbi";
import { type CampaignMeta, type CampaignState, type CampaignTask, modeOf } from "../campaigns";
import { CAMPAIGNS_ADDRESS, PASSPORT_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arcChain } from "../config";
import { questHash } from "../quests";
import { publicClient, verifierClient } from "./arc";
import { getAddressLogs, getAddressTxs } from "./explorer";

/** How long an entry signature stays valid: long enough to confirm in a wallet, short enough to not linger. */
export const ENTRY_TTL_SECONDS = 15 * 60;

export async function readCampaign(id: number): Promise<CampaignState | null> {
  if (!CAMPAIGNS_ADDRESS) return null;
  try {
    const c = await publicClient.readContract({ address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "getCampaign", args: [BigInt(id)] });
    return {
      creator: c.creator, mode: modeOf(c.mode), start: Number(c.start), end: Number(c.end), claimUntil: Number(c.claimUntil),
      maxWinners: Number(c.maxWinners), entries: Number(c.entries), refunded: c.refunded, pool: c.pool, paid: c.paid,
      allocated: c.allocated, resultsRoot: c.resultsRoot, metadataHash: c.metadataHash
    };
  } catch {
    return null;
  }
}

export type TaskCheck = { label: string; done: boolean; note?: string };

async function checkTask(task: CampaignTask, user: Address, state: CampaignState): Promise<TaskCheck> {
  switch (task.kind) {
    case "use-app": {
      const txs = await getAddressTxs(user);
      const hit = txs.some((t) => {
        const at = t.timestamp ? Date.parse(t.timestamp) / 1000 : 0;
        return t.status !== "error" && at >= state.start && t.to?.hash && task.contracts.some((c) => isAddressEqual(c, t.to!.hash as Address));
      });
      return { label: task.label, done: hit, note: hit ? undefined : "No transaction to the app since the campaign started yet." };
    }
    case "hold-usdc": {
      const bal = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20ApproveAbi, functionName: "balanceOf", args: [user] });
      const need = BigInt(Math.round(task.minUsdc * 10 ** USDC_DECIMALS));
      return { label: task.label, done: bal >= need, note: bal >= need ? undefined : `Needs at least ${task.minUsdc} USDC in this wallet.` };
    }
    case "arcway-quest": {
      if (!PASSPORT_ADDRESS) return { label: task.label, done: false, note: "Quest records aren't available on this network yet." };
      const done = await publicClient.readContract({ address: PASSPORT_ADDRESS, abi: passportAbi, functionName: "completedQuest", args: [user, questHash(task.questId)] });
      return { label: task.label, done, note: done ? undefined : "Finish the quest on Arcway first." };
    }
  }
}

export async function checkTasks(meta: CampaignMeta, state: CampaignState, user: Address): Promise<TaskCheck[]> {
  return Promise.all(meta.tasks.map((t) => checkTask(t, user, state).catch(() => ({ label: t.label, done: false, note: "Couldn't check right now. Try again in a moment." }))));
}

export async function hasEntered(id: number, user: Address): Promise<boolean> {
  if (!CAMPAIGNS_ADDRESS) return false;
  return publicClient.readContract({ address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "entered", args: [BigInt(id), user] });
}

/** EIP-712 approval the contract checks in enter(): this wallet completed the tasks, valid until `deadline`. */
export async function signEntry(id: number, user: Address, deadline: number): Promise<Hex | null> {
  const wallet = verifierClient();
  if (!wallet || !CAMPAIGNS_ADDRESS) return null;
  return wallet.signTypedData({
    account: wallet.account,
    domain: { name: "ArcwayCampaigns", version: "1", chainId: arcChain.id, verifyingContract: CAMPAIGNS_ADDRESS },
    types: { Entry: [{ name: "campaignId", type: "uint256" }, { name: "user", type: "address" }, { name: "deadline", type: "uint256" }] },
    primaryType: "Entry",
    message: { campaignId: BigInt(id), user, deadline: BigInt(deadline) }
  });
}

/** Everyone who joined, in entry order, from the contract's Entered events. */
export async function getEntrants(id: number): Promise<Address[]> {
  if (!CAMPAIGNS_ADDRESS) return [];
  const { items } = await getAddressLogs(CAMPAIGNS_ADDRESS, 200);
  const rows: { n: number; user: Address }[] = [];
  for (const log of items) {
    try {
      const ev = decodeEventLog({ abi: campaignsAbi, data: log.data as Hex, topics: log.topics.filter(Boolean) as [Hex, ...Hex[]] });
      if (ev.eventName === "Entered" && ev.args.id === BigInt(id)) rows.push({ n: Number(ev.args.entryNumber), user: getAddress(ev.args.user) });
    } catch {
      /* another event */
    }
  }
  return rows.sort((a, b) => a.n - b.n).map((r) => r.user);
}

const seedCache = new Map<number, { number: bigint; hash: Hex }>();

/** The first Arc block at or after `timestampSec`. Its hash is the draw seed: unknowable while the campaign was open. */
export async function seedBlock(timestampSec: number): Promise<{ number: bigint; hash: Hex } | null> {
  const cached = seedCache.get(timestampSec);
  if (cached) return cached;
  const latest = await publicClient.getBlock();
  if (Number(latest.timestamp) < timestampSec) return null;
  let lo = 0n, hi = latest.number;
  while (lo < hi) {
    const mid = (lo + hi) / 2n;
    const b = await publicClient.getBlock({ blockNumber: mid });
    if (Number(b.timestamp) >= timestampSec) hi = mid; else lo = mid + 1n;
  }
  const block = await publicClient.getBlock({ blockNumber: lo });
  const found = { number: block.number, hash: block.hash };
  seedCache.set(timestampSec, found);
  return found;
}

export type Results = ResultsTree & { seed: { number: bigint; hash: Hex }; entrants: number };

/** Deterministic results for an ended Raffle/Split: same inputs, same winners, every time. */
export async function computeResults(id: number, state: CampaignState): Promise<Results | null> {
  if (state.mode === "first-come") return null;
  const seed = await seedBlock(state.end);
  if (!seed) return null;
  const entrants = await getEntrants(id);
  // Only ever build results from the complete entry list: the explorer can lag or cut a long
  // history short, and results are published once. The contract's own count is the check.
  if (entrants.length !== state.entries) return null;
  const tree = buildResults(BigInt(id), allocate(state.mode, state.pool, state.maxWinners, entrants, seed.hash));
  return { ...tree, seed, entrants: entrants.length };
}

/** Publish results on chain (verifier only). Idempotent: does nothing if they are already there. */
export async function publishResults(id: number, results: Results): Promise<Hex | null> {
  const wallet = verifierClient();
  if (!wallet || !CAMPAIGNS_ADDRESS || results.total === 0n) return null;
  const { request } = await publicClient.simulateContract({
    account: wallet.account, address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "publishResults", args: [BigInt(id), results.root, results.total]
  });
  return wallet.writeContract(request);
}
