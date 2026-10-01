import { erc20Abi, type Address } from "viem";
import { passportAbi } from "../abi";
import { PASSPORT_ADDRESS, USDC_ADDRESS } from "../config";
import { QUESTS, getQuest, questHash, type Quest } from "../quests";
import { questEligibleContracts } from "../registry";
import { fetchActivity, type ActivityItem } from "./activity";
import { publicClient } from "./arc";

export type Eligibility = { eligible: boolean; reason?: string };

/** Everything needed to judge every quest, fetched once per request. */
export type ChainSnapshot = {
  usdcBalance: bigint;
  txCount: number;
  completed: Set<string>;
  activity: () => Promise<ActivityItem[]>;
};

export async function readCompleted(user: Address): Promise<Set<string>> {
  if (!PASSPORT_ADDRESS) return new Set();
  const results = await publicClient.multicall({
    allowFailure: false,
    contracts: QUESTS.map((q) => ({
      address: PASSPORT_ADDRESS!,
      abi: passportAbi,
      functionName: "completedQuest" as const,
      args: [user, questHash(q.id)] as const
    }))
  });
  return new Set(QUESTS.filter((_, i) => results[i]).map((q) => q.id));
}

export async function snapshot(user: Address): Promise<ChainSnapshot> {
  const [usdcBalance, txCount, completed] = await Promise.all([
    publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [user] }),
    publicClient.getTransactionCount({ address: user }),
    readCompleted(user)
  ]);
  let activity: Promise<ActivityItem[]> | undefined;
  return { usdcBalance, txCount, completed, activity: () => (activity ??= fetchActivity(user, fetch, 5)) };
}

/** Days (UTC) with at least one successful transaction. */
export function activeDays(items: ActivityItem[]): number {
  return new Set(items.filter((tx) => tx.success && tx.timestamp).map((tx) => tx.timestamp.slice(0, 10))).size;
}

/** Successful transactions sent to a verified app's published contracts. */
export function appActions(items: ActivityItem[], contracts: Set<string>): number {
  return items.filter((tx) => tx.success && tx.to && contracts.has(tx.to.toLowerCase())).length;
}

const progress = (have: number, need: number, unit: string) => `${Math.min(have, need)} of ${need} ${unit} so far.`;

/** Server-side source of truth for quest completion. Never trust the browser's claim. */
export async function checkQuest(quest: Quest, snap: ChainSnapshot): Promise<Eligibility> {
  if (quest.after && !snap.completed.has(quest.after)) {
    return { eligible: false, reason: `Claim ${getQuest(quest.after)?.title ?? "the previous tier"} first to open this tier.` };
  }
  const req = quest.requirement;
  switch (req.kind) {
    case "hold-usdc":
      return snap.usdcBalance >= req.minAmount
        ? { eligible: true }
        : { eligible: false, reason: "Hold at least 1 USDC on Arc." };
    case "first-transaction":
      return snap.txCount > 0
        ? { eligible: true }
        : { eligible: false, reason: "No transactions from this wallet yet." };
    case "app-interaction": {
      const contracts = questEligibleContracts();
      if (contracts.size === 0) return { eligible: false, reason: "Verified apps are coming soon." };
      if (snap.txCount === 0) return { eligible: false, reason: "No transactions from this wallet yet." };
      const items = await snap.activity();
      return items.some((tx) => tx.success && tx.to && contracts.has(tx.to.toLowerCase()))
        ? { eligible: true }
        : { eligible: false, reason: "No action in a verified app yet." };
    }
    case "tx-count":
      return snap.txCount >= req.min
        ? { eligible: true }
        : { eligible: false, reason: progress(snap.txCount, req.min, "transactions") };
    case "active-days": {
      const days = activeDays(await snap.activity());
      return days >= req.min ? { eligible: true } : { eligible: false, reason: progress(days, req.min, "days") };
    }
    case "app-actions": {
      const contracts = questEligibleContracts();
      if (contracts.size === 0) return { eligible: false, reason: "Verified apps are coming soon." };
      const n = snap.txCount === 0 ? 0 : appActions(await snap.activity(), contracts);
      return n >= req.min ? { eligible: true } : { eligible: false, reason: progress(n, req.min, "actions in verified apps") };
    }
    case "complete-quests": {
      const missing = req.questIds.filter((id) => !snap.completed.has(id));
      return missing.length === 0
        ? { eligible: true }
        : { eligible: false, reason: `Claim ${missing.map((id) => getQuest(id)?.title ?? id).join(", ")} first.` };
    }
  }
}

export async function checkAll(user: Address) {
  const snap = await snapshot(user);
  const entries = await Promise.all(
    QUESTS.map(async (quest) => {
      if (snap.completed.has(quest.id)) return [quest.id, { eligible: true }] as const;
      try {
        return [quest.id, await checkQuest(quest, snap)] as const;
      } catch {
        return [quest.id, { eligible: false, reason: "Couldn't check right now. Try again shortly." }] as const;
      }
    })
  );
  return { snap, eligibility: Object.fromEntries(entries) as Record<string, Eligibility> };
}
