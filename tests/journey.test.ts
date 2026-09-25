import { describe, expect, it } from "vitest";
import { nextStep, type JourneyInput } from "../lib/journey";
import { questViews } from "../lib/quests";

const views = (completed: string[] = [], eligible: Record<string, boolean> = {}) =>
  questViews({ completed: new Set(completed), eligible });

const base: JourneyInput = {
  connection: "connected",
  onArc: true,
  usdcBalance: 5_000_000n,
  txCount: 3,
  quests: views(),
  recordingEnabled: true
};

describe("nextStep", () => {
  it("asks to connect first", () => {
    expect(nextStep({ ...base, connection: "disconnected" }).action?.type).toBe("connect");
  });

  it("waits while connecting or loading reads", () => {
    expect(nextStep({ ...base, connection: "reconnecting" }).id).toBe("loading");
    expect(nextStep({ ...base, usdcBalance: undefined }).id).toBe("loading");
  });

  it("offers retry when Arc reads fail", () => {
    expect(nextStep({ ...base, readError: true }).action?.type).toBe("retry");
  });

  it("sends empty wallets to bring USDC, even on the wrong network", () => {
    expect(nextStep({ ...base, onArc: false, usdcBalance: 0n, txCount: 0 }).id).toBe("bring-usdc");
  });

  it("prefers recording a claimable quest (no wallet action needed)", () => {
    const step = nextStep({ ...base, onArc: false, quests: views([], { "first-tx": true }) });
    expect(step.action).toMatchObject({ type: "claim", questId: "first-tx" });
  });

  it("does not offer claims while recording is disabled", () => {
    const step = nextStep({ ...base, recordingEnabled: false, txCount: 0, quests: views([], { "arrive-with-usdc": true }) });
    expect(step.id).toBe("first-transaction");
  });

  it("asks to switch network only when a transaction is needed", () => {
    expect(nextStep({ ...base, onArc: false, txCount: 0, recordingEnabled: false }).id).toBe("switch-network");
    const allDone = views(["arrive-with-usdc", "first-tx", "explore-app", "arc-explorer"]);
    expect(nextStep({ ...base, onArc: false, quests: allDone }).id).toBe("done");
  });

  it("points to discovery until an app interaction happens", () => {
    expect(nextStep({ ...base, quests: views(["arrive-with-usdc", "first-tx"]) }).id).toBe("explore-app");
  });
});

describe("questViews", () => {
  it("locks the starter-path quest until prerequisites are recorded", () => {
    const explorer = views(["first-tx"], { "arc-explorer": true }).find((q) => q.id === "arc-explorer")!;
    expect(explorer.status).toBe("locked");
    expect(explorer.lockedBy).toEqual(["arrive-with-usdc", "explore-app"]);
  });

  it("marks unknown eligibility as checking", () => {
    const q = views().find((q) => q.id === "first-tx")!;
    expect(q).toMatchObject({ status: "todo", checking: true });
  });

  it("completed wins over eligibility", () => {
    expect(views(["first-tx"], { "first-tx": true }).find((q) => q.id === "first-tx")!.status).toBe("completed");
  });
});
