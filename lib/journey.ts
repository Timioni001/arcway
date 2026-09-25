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
      body: "Arcway reads your Arc balance and activity to suggest what to do next. Connecting never moves funds.",
      action: { type: "connect", label: "Connect wallet" }
    };
  }
  if (input.connection !== "connected") {
    return { id: "loading", title: "Connecting to your wallet…", body: "Approve the request in your wallet." };
  }
  if (input.readError) {
    return {
      id: "read-error",
      title: "Arc is not responding",
      body: "We couldn't read your Arc balance. This is usually temporary.",
      action: { type: "retry", label: "Try again" }
    };
  }
  if (input.usdcBalance === undefined || input.txCount === undefined) {
    return { id: "loading", title: "Reading your Arc activity…", body: "This takes a second." };
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
      title: `Record “${claimable.title}” on your passport`,
      body: `You've done it. Record it on-chain for +${claimable.xp} XP. Arcway pays the gas.`,
      action: { type: "claim", questId: claimable.id, label: `Record +${claimable.xp} XP` }
    };
  }

  if (input.usdcBalance === 0n && input.txCount === 0) {
    return {
      id: "bring-usdc",
      title: "Bring USDC to Arc",
      body: "Arc uses USDC for gas, so a small amount of USDC is all you need to get started.",
      action: { type: "bring-usdc", label: "Get USDC on Arc" }
    };
  }

  // Only ask for a network switch when the next step needs a wallet transaction on Arc.
  const needsArcTransaction = input.txCount === 0 || !done("explore-app");
  if (needsArcTransaction && !input.onArc) {
    return {
      id: "switch-network",
      title: "Switch your wallet to Arc",
      body: "Your wallet is on another network. Arcway will ask your wallet to switch; nothing happens without your approval.",
      action: { type: "switch-network", label: "Switch to Arc" }
    };
  }

  if (input.txCount === 0) {
    return {
      id: "first-transaction",
      title: "Make your first Arc transaction",
      body: "Try a small payment in an Arc app. Fees are paid in USDC and settle in under a second.",
      action: { type: "discover", label: "Find an app" }
    };
  }

  if (!done("explore-app")) {
    return {
      id: "explore-app",
      title: "Use a verified Arc app",
      body: "Pick an app by what you want to do. Your first interaction with a verified app counts toward your passport.",
      action: { type: "discover", label: "Explore apps" }
    };
  }

  return {
    id: "done",
    title: "Starter path complete",
    body: input.recordingEnabled
      ? "Your passport is up to date. Keep exploring Arc apps to build your record."
      : "You've done everything on the starter path. Passport recording opens soon.",
    action: { type: "discover", label: "Explore more apps" }
  };
}

export function journeyProgress(quests: QuestView[]): JourneyProgress {
  return {
    done: quests.filter((q) => q.status === "completed").length,
    total: quests.length
  };
}
