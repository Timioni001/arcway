import { keccak256, toBytes, type Hex } from "viem";

export type QuestRequirement =
  | { kind: "hold-usdc"; minAmount: bigint }
  | { kind: "first-transaction" }
  | { kind: "app-interaction" }
  | { kind: "complete-quests"; questIds: string[] };

export type Quest = {
  id: string;
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
    title: "Arrive on Arc",
    description: "Hold at least 1 USDC on Arc.",
    howTo: "Bring USDC from another chain, or use the faucet on testnet.",
    xp: 10,
    difficulty: "easy",
    minutes: 3,
    steps: ["Copy your wallet address.", "Bring USDC from another chain with CCTP, or use the faucet on testnet.", "Come back here; your balance updates automatically."],
    requirement: { kind: "hold-usdc", minAmount: 1_000_000n }
  },
  {
    id: "first-tx",
    title: "First Arc transaction",
    description: "Make a real transaction on Arc.",
    howTo: "Any transaction from your wallet counts, such as a payment in an Arc app.",
    xp: 25,
    difficulty: "easy",
    minutes: 2,
    steps: ["Switch your wallet to Arc.", "Open an app from Discover and make a small payment or swap.", "Come back here to record it."],
    requirement: { kind: "first-transaction" }
  },
  {
    id: "explore-app",
    title: "Explore an Arc app",
    description: "Complete an interaction with a verified ecosystem app.",
    howTo: "Open a verified app from Discover and complete its first action.",
    xp: 25,
    difficulty: "medium",
    minutes: 5,
    steps: ["Pick a verified app in Discover.", "Complete its first action, shown on the app page.", "Come back here to record it."],
    requirement: { kind: "app-interaction" }
  },
  {
    id: "arc-explorer",
    title: "Arc Explorer",
    description: "Complete the starter path.",
    howTo: "Record the three starter quests on your passport.",
    xp: 50,
    difficulty: "easy",
    minutes: 1,
    steps: ["Record the three starter quests.", "Record Arc Explorer to finish the path."],
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
