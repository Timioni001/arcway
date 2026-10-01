import { keccak256, toBytes, type Hex } from "viem";
import { IS_MAINNET } from "./config";

export type QuestRequirement =
  | { kind: "hold-usdc"; minAmount: bigint }
  | { kind: "first-transaction" }
  | { kind: "app-interaction" }
  /** At least `min` transactions sent from the wallet on Arc (its nonce). */
  | { kind: "tx-count"; min: number }
  /** Successful transactions on at least `min` different days (UTC). */
  | { kind: "active-days"; min: number }
  /** At least `min` successful actions in verified apps. */
  | { kind: "app-actions"; min: number }
  | { kind: "complete-quests"; questIds: string[] };

/** What kind of thing the quest asks for, in plain words. */
export type QuestType = "Learn" | "Explore" | "Try an app" | "Onchain action" | "Collect" | "Seasonal" | "Community";

/** Progression: each tier introduces a little more of Arc. */
export const QUEST_TIERS = ["Beginner", "Explorer", "Regular", "Advanced"] as const;
export type QuestTier = (typeof QUEST_TIERS)[number];

export const DIFFICULTY_LABEL: Record<Quest["difficulty"], string> = { easy: "Beginner", medium: "Intermediate", hard: "Advanced" };

export type Quest = {
  id: string;
  type: QuestType;
  tier: QuestTier;
  /** The badge this quest awards, recorded on Arc with the XP. */
  badge: { name: string; description: string };
  title: string;
  description: string;
  /** Concrete instruction shown while the quest is not yet done. */
  howTo: string;
  xp: number;
  difficulty: "easy" | "medium" | "hard";
  /** Rough hands-on time, in minutes. */
  minutes: number;
  /** Quests that take place over several days say so instead of minutes. */
  days?: number;
  /** The tier's previous finale: the quest stays locked until it is recorded. */
  after?: string;
  /** Concrete steps shown on the quest page. */
  steps: string[];
  requirement: QuestRequirement;
};

/** XP values live here (trusted config) and are only ever sent on-chain by the verifier. */
export const QUESTS: Quest[] = [
  {
    id: "arrive-with-usdc",
    type: "Learn",
    tier: "Beginner",
    badge: { name: "Arrival", description: "Brought dollars to Arc for the first time." },
    title: "Arrive on Arc",
    description: "Hold at least 1 USDC on Arc.",
    howTo: "Get a little USDC on Arc.",
    xp: 10,
    difficulty: "easy",
    minutes: 3,
    steps: ["Copy your wallet address.", IS_MAINNET ? "Bring USDC to Arc through Arc Portal, a bridge, or an exchange withdrawal." : "Get free test USDC from Circle's faucet.", "Come back here; your balance updates on its own."],
    requirement: { kind: "hold-usdc", minAmount: 1_000_000n }
  },
  {
    id: "first-tx",
    type: "Onchain action",
    tier: "Beginner",
    badge: { name: "First Step", description: "Made a first transaction on Arc." },
    title: "First transaction",
    description: "Make your first transaction on Arc.",
    howTo: "Any payment or swap from your wallet counts.",
    xp: 25,
    difficulty: "easy",
    minutes: 2,
    steps: ["Switch your wallet to Arc.", "Open an app and make a small payment or swap.", "Come back here and claim your XP."],
    requirement: { kind: "first-transaction" }
  },
  {
    id: "explore-app",
    type: "Try an app",
    tier: "Beginner",
    badge: { name: "App Explorer", description: "Used a verified app on Arc." },
    title: "Explore an app",
    description: "Complete one action in a verified app.",
    howTo: "Open a verified app and complete its first action.",
    xp: 25,
    difficulty: "medium",
    minutes: 5,
    steps: ["Pick a verified app.", "Complete the first action shown on its page.", "Come back here and claim your XP."],
    requirement: { kind: "app-interaction" }
  },
  {
    id: "arc-explorer",
    type: "Collect",
    tier: "Beginner",
    badge: { name: "Arc Explorer", description: "Finished every starter quest." },
    title: "Arc Explorer",
    description: "Finish the three starter quests.",
    howTo: "Claim the three starter quests first.",
    xp: 50,
    difficulty: "easy",
    minutes: 1,
    steps: ["Claim the three starter quests.", "Claim Arc Explorer to finish."],
    requirement: { kind: "complete-quests", questIds: ["arrive-with-usdc", "first-tx", "explore-app"] }
  },

  // Explorer tier: opens after Arc Explorer. Habits, not one-offs.
  {
    id: "five-tx",
    type: "Onchain action",
    tier: "Explorer",
    after: "arc-explorer",
    badge: { name: "Getting Comfortable", description: "Made five transactions on Arc." },
    title: "Getting comfortable",
    description: "Make 5 transactions on Arc.",
    howTo: "Payments, swaps and deposits all count.",
    xp: 40,
    difficulty: "medium",
    minutes: 10,
    steps: ["Use any app on Arc: pay, swap or deposit.", "Do it five times in total from this wallet.", "Come back here and claim your XP."],
    requirement: { kind: "tx-count", min: 5 }
  },
  {
    id: "app-actions-3",
    type: "Try an app",
    tier: "Explorer",
    after: "arc-explorer",
    badge: { name: "Back for More", description: "Three actions in verified apps." },
    title: "Back for more",
    description: "Complete 3 actions in verified apps.",
    howTo: "Each successful action in a verified app counts.",
    xp: 60,
    difficulty: "medium",
    minutes: 10,
    steps: ["Pick a verified app (look for the Verified mark).", "Complete three actions in it, or across several.", "Come back here and claim your XP."],
    requirement: { kind: "app-actions", min: 3 }
  },
  {
    id: "three-days",
    type: "Seasonal",
    tier: "Explorer",
    after: "arc-explorer",
    badge: { name: "Three Days In", description: "Used Arc on three different days." },
    title: "Three days in",
    description: "Use Arc on 3 different days.",
    howTo: "One successful transaction on each of three days (UTC).",
    xp: 60,
    difficulty: "medium",
    minutes: 3,
    days: 3,
    steps: ["Make a transaction on Arc today.", "Come back on two more days and do it again.", "Claim your XP once three days are on record."],
    requirement: { kind: "active-days", min: 3 }
  },
  {
    id: "arc-voyager",
    type: "Collect",
    tier: "Explorer",
    after: "arc-explorer",
    badge: { name: "Voyager", description: "Finished every Explorer quest." },
    title: "Arc Voyager",
    description: "Finish the three Explorer quests.",
    howTo: "Claim the three Explorer quests first.",
    xp: 80,
    difficulty: "medium",
    minutes: 1,
    steps: ["Claim the three Explorer quests.", "Claim Arc Voyager to finish the tier."],
    requirement: { kind: "complete-quests", questIds: ["five-tx", "app-actions-3", "three-days"] }
  },

  // Regular tier: opens after Arc Voyager. Arc as part of the week.
  {
    id: "twenty-five-tx",
    type: "Onchain action",
    tier: "Regular",
    after: "arc-voyager",
    badge: { name: "Regular", description: "Made 25 transactions on Arc." },
    title: "Regular on Arc",
    description: "Make 25 transactions on Arc.",
    howTo: "Every payment, swap or deposit from this wallet counts.",
    xp: 100,
    difficulty: "hard",
    minutes: 30,
    steps: ["Keep using apps on Arc.", "Reach 25 transactions from this wallet.", "Come back here and claim your XP."],
    requirement: { kind: "tx-count", min: 25 }
  },
  {
    id: "app-actions-10",
    type: "Try an app",
    tier: "Regular",
    after: "arc-voyager",
    badge: { name: "App Regular", description: "Ten actions in verified apps." },
    title: "App regular",
    description: "Complete 10 actions in verified apps.",
    howTo: "Each successful action in a verified app counts.",
    xp: 120,
    difficulty: "hard",
    minutes: 30,
    steps: ["Use verified apps for real things: swaps, deposits, payments.", "Reach 10 successful actions in total.", "Come back here and claim your XP."],
    requirement: { kind: "app-actions", min: 10 }
  },
  {
    id: "week-on-arc",
    type: "Seasonal",
    tier: "Regular",
    after: "arc-voyager",
    badge: { name: "Week on Arc", description: "Used Arc on seven different days." },
    title: "A week on Arc",
    description: "Use Arc on 7 different days.",
    howTo: "One successful transaction on each of seven days (UTC).",
    xp: 150,
    difficulty: "hard",
    minutes: 7,
    days: 7,
    steps: ["Make a transaction on Arc on seven different days.", "They don't need to be in a row.", "Claim your XP once seven days are on record."],
    requirement: { kind: "active-days", min: 7 }
  },
  {
    id: "fifty-usdc",
    type: "Learn",
    tier: "Regular",
    after: "arc-voyager",
    badge: { name: "Settled In", description: "Held 50 USDC on Arc." },
    title: "Settled in",
    description: "Hold at least 50 USDC on Arc.",
    howTo: "Keep 50 USDC or more in this wallet on Arc.",
    xp: 75,
    difficulty: "medium",
    minutes: 5,
    steps: ["Bring more USDC to Arc, or keep what you earn there.", "Hold at least 50 USDC in this wallet.", "Come back here and claim your XP."],
    requirement: { kind: "hold-usdc", minAmount: 50_000_000n }
  },
  {
    id: "arc-regular",
    type: "Collect",
    tier: "Regular",
    after: "arc-voyager",
    badge: { name: "Arc Regular", description: "Finished every Regular quest." },
    title: "Arc Regular",
    description: "Finish the four Regular quests.",
    howTo: "Claim the four Regular quests first.",
    xp: 150,
    difficulty: "hard",
    minutes: 1,
    steps: ["Claim the four Regular quests.", "Claim Arc Regular to finish the tier."],
    requirement: { kind: "complete-quests", questIds: ["twenty-five-tx", "app-actions-10", "week-on-arc", "fifty-usdc"] }
  },

  // Advanced tier: opens after Arc Regular. For people who live on Arc.
  {
    id: "century",
    type: "Onchain action",
    tier: "Advanced",
    after: "arc-regular",
    badge: { name: "Century", description: "Made 100 transactions on Arc." },
    title: "Century",
    description: "Make 100 transactions on Arc.",
    howTo: "Every payment, swap or deposit from this wallet counts.",
    xp: 250,
    difficulty: "hard",
    minutes: 120,
    steps: ["Make Arc your everyday chain.", "Reach 100 transactions from this wallet.", "Come back here and claim your XP."],
    requirement: { kind: "tx-count", min: 100 }
  },
  {
    id: "app-actions-25",
    type: "Try an app",
    tier: "Advanced",
    after: "arc-regular",
    badge: { name: "Power User", description: "25 actions in verified apps." },
    title: "Power user",
    description: "Complete 25 actions in verified apps.",
    howTo: "Each successful action in a verified app counts.",
    xp: 250,
    difficulty: "hard",
    minutes: 90,
    steps: ["Use verified apps as your daily tools.", "Reach 25 successful actions in total.", "Come back here and claim your XP."],
    requirement: { kind: "app-actions", min: 25 }
  },
  {
    id: "twenty-days",
    type: "Seasonal",
    tier: "Advanced",
    after: "arc-regular",
    badge: { name: "Resident", description: "Used Arc on twenty different days." },
    title: "Resident",
    description: "Use Arc on 20 different days.",
    howTo: "One successful transaction on each of twenty days (UTC).",
    xp: 300,
    difficulty: "hard",
    minutes: 20,
    days: 20,
    steps: ["Make a transaction on Arc on twenty different days.", "They don't need to be in a row.", "Claim your XP once twenty days are on record."],
    requirement: { kind: "active-days", min: 20 }
  },
  {
    id: "arc-pathfinder",
    type: "Collect",
    tier: "Advanced",
    after: "arc-regular",
    badge: { name: "Pathfinder", description: "Finished every quest on Arcway." },
    title: "Arc Pathfinder",
    description: "Finish the three Advanced quests.",
    howTo: "Claim the three Advanced quests first.",
    xp: 400,
    difficulty: "hard",
    minutes: 1,
    steps: ["Claim the three Advanced quests.", "Claim Arc Pathfinder: every quest done."],
    requirement: { kind: "complete-quests", questIds: ["century", "app-actions-25", "twenty-days"] }
  }
];

export const TOTAL_XP = QUESTS.reduce((sum, q) => sum + q.xp, 0);

export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((q) => q.id === id);
}

/** On-chain id. Matches `keccak256("first-tx")` used in the contract tests. */
export function questHash(id: string): Hex {
  return keccak256(toBytes(id));
}

/** Quests that must be recorded first: the tier gate, then the quests a finale collects. */
export function prerequisites(quest: Quest): string[] {
  const ids = quest.after ? [quest.after] : [];
  if (quest.requirement.kind === "complete-quests") ids.push(...quest.requirement.questIds);
  return ids;
}

export const questsInTier = (tier: QuestTier, quests: Quest[] = QUESTS) => quests.filter((q) => q.tier === tier);
export const tierXp = (tier: QuestTier) => questsInTier(tier).reduce((sum, q) => sum + q.xp, 0);

/** Whether each tier is fully recorded, in tier order: the passport card shows one bar per tier. */
export function tiersDone(views: { tier: QuestTier; status: QuestStatus }[]): boolean[] {
  return QUEST_TIERS.map((tier) => {
    const inTier = views.filter((q) => q.tier === tier);
    return inTier.length > 0 && inTier.every((q) => q.status === "completed");
  });
}

/** "5 min" or, for quests that span days, "3 days". */
export function timeLabel(quest: Pick<Quest, "minutes" | "days">): string {
  if (quest.days) return `${quest.days} days`;
  return quest.minutes >= 60 ? `${Math.round(quest.minutes / 60)} h` : `${quest.minutes} min`;
}

export type QuestStatus =
  /** Prerequisites are not recorded yet. */
  | "locked"
  /** Requirement not met (or unknown yet). */
  | "todo"
  /** Requirement met; the verifier can record it. */
  | "claimable"
  /** Recorded on the passport. */
  | "completed";

export type QuestView = Quest & {
  status: QuestStatus;
  /** Eligibility still loading. */
  checking: boolean;
  lockedBy: string[];
};

export type QuestSignals = {
  /** Quest ids recorded on-chain. */
  completed: ReadonlySet<string>;
  /** Server-side eligibility; missing key means unknown. */
  eligible: Readonly<Record<string, boolean | undefined>>;
};

export function questViews(signals: QuestSignals, quests: Quest[] = QUESTS): QuestView[] {
  return quests.map((quest) => {
    const lockedBy = prerequisites(quest).filter((id) => !signals.completed.has(id));
    const eligible = signals.eligible[quest.id];
    let status: QuestStatus;
    if (signals.completed.has(quest.id)) status = "completed";
    else if (lockedBy.length) status = "locked";
    else if (eligible) status = "claimable";
    else status = "todo";
    return { ...quest, status, lockedBy, checking: status !== "completed" && eligible === undefined };
  });
}

export function earnedXp(views: QuestView[]): number {
  return views.filter((q) => q.status === "completed").reduce((sum, q) => sum + q.xp, 0);
}

/** 0..1 progress for the card's bar. Only the starter-path quest has partial progress. */
export function questProgress(view: QuestView): number {
  if (view.status === "completed" || view.status === "claimable") return 1;
  const prereqs = prerequisites(view);
  if (prereqs.length) return (prereqs.length - view.lockedBy.length) / prereqs.length;
  return 0;
}
