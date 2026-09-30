import { keccak256, toBytes, type Hex } from "viem";
import { IS_MAINNET } from "./config";

export type QuestRequirement =
  | { kind: "hold-usdc"; minAmount: bigint }
  | { kind: "first-transaction" }
  | { kind: "app-interaction" }
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
  /** Rough time to complete, in minutes. */
  minutes: number;
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

export function prerequisites(quest: Quest): string[] {
  return quest.requirement.kind === "complete-quests" ? quest.requirement.questIds : [];
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
