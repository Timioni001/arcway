import { type Address, type Hex, keccak256, toBytes } from "viem";
import { formatUsdc } from "./format";

/**
 * Live campaigns: a project locks a USDC prize pool in the ArcwayCampaigns escrow and rewards people
 * who complete tasks that can be checked on Arc. Entry is always free. Nothing here is estimated:
 * pool, entries and payouts are read from the contract.
 */

export type CampaignMode = "first-come" | "raffle" | "split";
export const MODES: CampaignMode[] = ["first-come", "raffle", "split"];
export const modeIndex = (m: CampaignMode) => MODES.indexOf(m);
export const modeOf = (i: number): CampaignMode => MODES[i] ?? "first-come";

export const MODE_LABEL: Record<CampaignMode, string> = {
  "first-come": "First come",
  raffle: "Prize draw",
  split: "Shared pool"
};
export const MODE_HELP: Record<CampaignMode, string> = {
  "first-come": "A fixed reward, paid the moment an eligible person joins, until the pool runs out.",
  raffle: "Winners are drawn after the campaign ends from everyone who joined. Everyone has the same chance.",
  split: "When the campaign ends, the pool is split equally between everyone who joined."
};

/** Tasks Arcway can check on chain, so nobody has to trust a screenshot. */
export type CampaignTask =
  | { kind: "use-app"; label: string; contracts: Address[] }
  | { kind: "hold-usdc"; label: string; minUsdc: number }
  | { kind: "arcway-quest"; label: string; questId: string };

export const TASK_KINDS: { kind: CampaignTask["kind"]; title: string; help: string }[] = [
  { kind: "use-app", title: "Use the app", help: "Send at least one transaction to the project's contract during the campaign." },
  { kind: "hold-usdc", title: "Hold USDC", help: "Hold at least a set amount of USDC on Arc when joining." },
  { kind: "arcway-quest", title: "Finish an Arcway quest", help: "Complete one of Arcway's starter quests." }
];

/** The public description of a campaign. Its hash is stored on chain, so it can't change after launch. */
export type CampaignMeta = {
  /** On-chain campaign id in ArcwayCampaigns. */
  id: number;
  slug: string;
  /** App slug from the registry, when the project is listed on Arcway. */
  app?: string;
  project: string;
  title: string;
  summary: string;
  tasks: CampaignTask[];
};

/** Reviewed, listed campaigns. Launching creates the on-chain campaign; listing adds it here after review. */
export const CAMPAIGNS: CampaignMeta[] = [];

export const getCampaignMeta = (slugOrId: string) => CAMPAIGNS.find((c) => c.slug === slugOrId || String(c.id) === slugOrId);

/** Stable JSON (sorted keys) so the same description always hashes the same. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).filter((k) => (value as Record<string, unknown>)[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** What is committed on chain: everything except the id, which the contract assigns. */
export function metadataHash(meta: Omit<CampaignMeta, "id">): Hex {
  const { slug, app, project, title, summary, tasks } = meta;
  return keccak256(toBytes(canonical({ slug, app, project, title, summary, tasks })));
}

/** On-chain state, as returned by getCampaign. */
export type CampaignState = {
  creator: Address;
  mode: CampaignMode;
  start: number;
  end: number;
  claimUntil: number;
  maxWinners: number;
  entries: number;
  refunded: boolean;
  pool: bigint;
  paid: bigint;
  allocated: bigint;
  resultsRoot: Hex;
  metadataHash: Hex;
};

export type CampaignPhase = "upcoming" | "live" | "drawing" | "claiming" | "closed";

export function phaseOf(c: CampaignState, nowSec: number): CampaignPhase {
  if (c.refunded || nowSec >= c.claimUntil) return "closed";
  if (nowSec < c.start) return "upcoming";
  if (nowSec < c.end) return c.mode === "first-come" && c.entries >= c.maxWinners ? "closed" : "live";
  if (c.mode === "first-come") return "closed";
  return c.resultsRoot === ZERO_ROOT ? "drawing" : "claiming";
}

export const ZERO_ROOT = `0x${"0".repeat(64)}` as Hex;

export const PHASE_LABEL: Record<CampaignPhase, string> = {
  upcoming: "Starts soon",
  live: "Live",
  drawing: "Results soon",
  claiming: "Claim rewards",
  closed: "Ended"
};

/** The reward in one plain sentence. */
export function rewardSentence(mode: CampaignMode, pool: bigint, winners: number): string {
  const each = winners > 0 ? pool / BigInt(winners) : 0n;
  if (mode === "first-come") return `${formatUsdc(each)} each for the first ${winners.toLocaleString("en-US")} ${winners === 1 ? "person" : "people"}`;
  if (mode === "raffle") return `${winners.toLocaleString("en-US")} ${winners === 1 ? "winner" : "winners"} drawn, ${formatUsdc(each)} each`;
  return `Shared equally by up to ${winners.toLocaleString("en-US")} people`;
}

/** "3d 4h", "5h 12m", "12m" until a unix time. */
export function timeLeft(untilSec: number, nowSec: number): string {
  const s = Math.max(0, untilSec - nowSec);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export const CAMPAIGN_LIMITS = {
  minDurationHours: 1,
  maxDurationDays: 90,
  minClaimDays: 7,
  maxClaimDays: 90,
  maxWinners: 10_000
};
