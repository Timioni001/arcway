import type { QuestView } from "./quests";

export type ConnectionStatus = "disconnected" | "connecting" | "reconnecting" | "connected";

export type JourneyInput = {
  connection: ConnectionStatus;
  onArc: boolean;
  /** ERC-20 USDC balance (6 decimals); undefined while loading. */
  usdcBalance?: bigint;
  /** Nonce on Arc; undefined while loading. */
  txCount?: number;
  /** Arc reads failed (RPC unreachable). */
  readError?: boolean;
  quests: QuestView[];
  /** Passport contract + verifier are available for recording. */
  recordingEnabled: boolean;
};

export type JourneyAction =
  | { type: "connect" }
  | { type: "switch-network" }
  | { type: "retry" }
  | { type: "bring-usdc" }
  | { type: "discover" }
  | { type: "claim"; questId: string }
  | { type: "view-passport" };

export type JourneyStep = {
  id:
    | "connect"
    | "loading"
    | "switch-network"
    | "read-error"
    | "bring-usdc"
    | "first-transaction"
    | "claim"
    | "explore-app"
    | "keep-going"
    | "done";
  title: string;
  body: string;
  action?: JourneyAction & { label: string };
};

export type JourneyProgress = { done: number; total: number };

/**
 * Answers "I just arrived on Arc. What should I do next?" with exactly one step.
 * Order matters: each step assumes the previous ones are satisfied.
 */
export function nextStep(input: JourneyInput): JourneyStep {
  if (input.connection === "disconnected") {
    return {
      id: "connect",
      title: "Connect a wallet to start",
      body: "See where you are and what to try next. Connecting never moves your money.",
      action: { type: "connect", label: "Connect wallet" }
    };
  }
  if (input.connection !== "connected") {
    return { id: "loading", title: "Connecting to your wallet…", body: "Approve the request in your wallet." };
  }
  if (input.readError) {
    return {
      id: "read-error",
      title: "We can't reach Arc right now",
      body: "This is usually temporary.",
      action: { type: "retry", label: "Try again" }
    };
  }
  if (input.usdcBalance === undefined || input.txCount === undefined) {
    return { id: "loading", title: "Checking your progress…", body: "This takes a second." };
  }

  const done = (id: string) => {
    const q = input.quests.find((quest) => quest.id === id);
    return q?.status === "completed" || q?.status === "claimable";
  };

  // Recording needs no wallet action (the verifier pays gas), so it comes first.
  const claimable = input.recordingEnabled
    ? input.quests.find((q) => q.status === "claimable")
    : undefined;
  if (claimable) {
    return {
      id: "claim",
      title: `Claim your XP for “${claimable.title}”`,
      body: `Nice work. Claiming is free.`,
      action: { type: "claim", questId: claimable.id, label: `Claim ${claimable.xp} XP` }
    };
  }

  if (input.usdcBalance === 0n && input.txCount === 0) {
    return {
      id: "bring-usdc",
      title: "Bring USDC to Arc",
      body: "You'll need a little USDC to try apps on Arc.",
      action: { type: "bring-usdc", label: "Get USDC on Arc" }
    };
  }

  // Only ask for a network switch when the next step needs a wallet transaction on Arc.
  const needsArcTransaction = input.txCount === 0 || !done("explore-app");
  if (needsArcTransaction && !input.onArc) {
    return {
      id: "switch-network",
      title: "Switch your wallet to Arc",
      body: "Your wallet is on another network. Nothing changes without your approval.",
      action: { type: "switch-network", label: "Switch to Arc" }
    };
  }

  if (input.txCount === 0) {
    return {
      id: "first-transaction",
      title: "Try your first app",
      body: "Make a small payment or swap in any app.",
      action: { type: "discover", label: "Find an app" }
    };
  }

  if (!done("explore-app")) {
    return {
      id: "explore-app",
      title: "Explore a verified app",
      body: "Your first action in a verified app earns XP.",
      action: { type: "discover", label: "Explore apps" }
    };
  }

  // Starter tier done: point at the next open quest in the later tiers.
  const next = input.quests.find((q) => q.status === "todo");
  if (next) {
    return {
      id: "keep-going",
      title: `Next: ${next.title}`,
      body: `${next.description} ${next.howTo}`,
      action: { type: "discover", label: "Explore apps" }
    };
  }
  const locked = input.quests.some((q) => q.status !== "completed");
  return {
    id: "done",
    title: locked ? "You've finished the starter quests" : "Every quest done. Pathfinder.",
    body: input.recordingEnabled
      ? "Keep exploring apps to grow your passport."
      : "Claiming XP opens soon. Your progress is saved.",
    action: { type: "discover", label: "Explore more apps" }
  };
}

export function journeyProgress(quests: QuestView[]): JourneyProgress {
  return {
    done: quests.filter((q) => q.status === "completed").length,
    total: quests.length
  };
}
