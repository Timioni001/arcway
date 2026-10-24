import type { Address, Hex } from "viem";
import { QUESTS, questHash, type Quest } from "./quests";

/** A bounty as the contract returns it. */
export type RawBounty = { sponsor: Address; questId: Hex; rewardPerClaim: bigint; maxClaims: number; claims: number; expiresAt: bigint; closed: boolean; title: string };

export type BountyView = RawBounty & {
  id: number;
  quest: Quest | undefined;
  left: number;
  status: "open" | "expired" | "empty" | "closed";
};

const QUEST_BY_HASH = new Map(QUESTS.map((q) => [questHash(q.id).toLowerCase(), q]));
export const questForHash = (hash: string) => QUEST_BY_HASH.get(hash.toLowerCase());

/** Normalise one bounty and say whether it can still pay out. */
export function viewBounty(id: number, raw: RawBounty, nowSec: number): BountyView {
  const left = Math.max(0, Number(raw.maxClaims) - Number(raw.claims));
  const status: BountyView["status"] = raw.closed ? "closed" : Number(raw.expiresAt) <= nowSec ? "expired" : left === 0 ? "empty" : "open";
  return { ...raw, maxClaims: Number(raw.maxClaims), claims: Number(raw.claims), id, quest: questForHash(raw.questId), left, status };
}

/** The live bounties for one quest, biggest reward first. */
export function bountiesForQuest(all: BountyView[], questId: string): BountyView[] {
  const h = questHash(questId).toLowerCase();
  return all.filter((b) => b.status === "open" && b.questId.toLowerCase() === h).sort((a, b) => (b.rewardPerClaim > a.rewardPerClaim ? 1 : -1));
}

/** Total escrow a sponsor approves: reward × people. */
export const escrowFor = (rewardPerClaim: bigint, people: number) => rewardPerClaim * BigInt(people);

/** Plain words for when a bounty ends. */
export function endsIn(expiresAt: bigint, nowSec: number): string {
  const s = Number(expiresAt) - nowSec;
  if (s <= 0) return "Ended";
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h left` : `${Math.max(1, Math.floor(s / 60))}m left`;
}
