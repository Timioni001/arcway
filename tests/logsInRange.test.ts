import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/server/arc", () => ({ publicClient: {}, logsClient: {} }));
const { logsInRange } = await import("../lib/server/rpcIntel");

describe("logsInRange", () => {
  it("shrinks the window only when the node says the range is too large", async () => {
    const calls: [bigint, bigint][] = [];
    const read = async (a: bigint, b: bigint) => {
      calls.push([a, b]);
      if (b - a + 1n > 10_000n) throw new Error("requested range too large");
      return [a];
    };
    const out = await logsInRange(0n, 19_999n, read, 40_000n);
    expect(out).toEqual([0n, 10_000n]);
    expect(calls.map(([a, b]) => b - a + 1n)).toEqual([20_000n, 10_000n, 10_000n]);
  });

  it("waits and retries the same window on a rate limit", async () => {
    vi.useFakeTimers();
    let n = 0;
    const read = async (a: bigint, b: bigint) => {
      if (n++ === 0) throw Object.assign(new Error("HTTP request failed"), { details: "rate limit exceeded" });
      return [b - a + 1n];
    };
    const p = logsInRange(0n, 99_999n, read, 100_000n);
    await vi.runAllTimersAsync();
    expect(await p).toEqual([100_000n]);
    vi.useRealTimers();
  });
});
