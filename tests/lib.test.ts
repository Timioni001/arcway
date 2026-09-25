import { keccak256, toBytes } from "viem";
import { describe, expect, it, vi } from "vitest";
import { humanizeError } from "../lib/errors";
import { formatUsdc, shortAddress, timeAgo } from "../lib/format";
import { questHash } from "../lib/quests";
import { APPS, discoverApps, questEligibleContracts, type ArcApp } from "../lib/registry";
import { createRateLimiter } from "../lib/server/rateLimit";
import { fetchActivity } from "../lib/server/activity";

describe("formatUsdc", () => {
  it("formats 6-decimal amounts and rounds down", () => {
    expect(formatUsdc(0n)).toBe("0 USDC");
    expect(formatUsdc(1_000_000n)).toBe("1 USDC");
    expect(formatUsdc(1_239_999n)).toBe("1.23 USDC");
    expect(formatUsdc(1_234_567_890_000n)).toBe("1,234,567.89 USDC");
    expect(formatUsdc(5_000n)).toBe("<0.01 USDC");
  });
});

describe("format helpers", () => {
  it("shortens addresses", () => {
    expect(shortAddress("0x3600000000000000000000000000000000000000")).toBe("0x3600…0000");
  });
  it("describes relative time", () => {
    const now = Date.parse("2026-09-25T12:00:00Z");
    expect(timeAgo("2026-09-25T11:59:30Z", now)).toBe("just now");
    expect(timeAgo("2026-09-25T09:00:00Z", now)).toBe("3h ago");
  });
});

describe("questHash", () => {
  it("matches the id scheme used by the contract tests", () => {
    expect(questHash("first-tx")).toBe(keccak256(toBytes("first-tx")));
  });
});

describe("humanizeError", () => {
  it("recognises wallet rejections deep in a cause chain", () => {
    expect(humanizeError({ name: "ConnectorError", cause: { code: 4001 } })).toMatch(/cancelled/);
  });
  it("recognises RPC outages", () => {
    expect(humanizeError({ name: "HttpRequestError" })).toMatch(/couldn't reach Arc/);
  });
  it("falls back to the short message", () => {
    expect(humanizeError({ shortMessage: "Boom", message: "Boom long" })).toBe("Boom");
  });
});

describe("registry", () => {
  const app = (over: Partial<ArcApp>): ArcApp => ({
    id: "x", slug: "x", name: "X", tagline: "", description: "", category: "Payments", status: "live",
    features: [], contractAddresses: [], verified: true, active: true, addedAt: "2026-09-01", firstAction: "", ...over
  });

  it("ranks featured, then verified, then newest; samples last", () => {
    const apps = [
      app({ id: "s", sample: true, featured: true }),
      app({ id: "old", addedAt: "2026-01-01" }),
      app({ id: "new", addedAt: "2026-09-20" }),
      app({ id: "unv", verified: false, addedAt: "2026-09-24" }),
      app({ id: "feat", featured: true, verified: false })
    ];
    expect(discoverApps(apps).map((a) => a.id)).toEqual(["feat", "new", "old", "unv", "s"]);
  });

  it("searches features and builders", () => {
    expect(discoverApps([app({ id: "c", builder: { name: "Circle" } })], { search: "circle" })).toHaveLength(1);
    expect(discoverApps([app({ id: "g", features: ["USDC gas"] })], { search: "gas" })).toHaveLength(1);
  });

  it("filters by category and search, verified real listings first", () => {
    const apps = [
      app({ id: "s", name: "Sample pay", sample: true, verified: false }),
      app({ id: "u", name: "Unverified pay", verified: false }),
      app({ id: "v", name: "Verified pay" }),
      app({ id: "t", name: "Swapper", category: "Trading" }),
      app({ id: "off", name: "Old pay", active: false })
    ];
    expect(discoverApps(apps, { category: "Payments" }).map((a) => a.id)).toEqual(["v", "u", "s"]);
    expect(discoverApps(apps, { search: "  SWAP " }).map((a) => a.id)).toEqual(["t"]);
  });

  it("only counts verified, non-sample contracts for quests", () => {
    const addr = "0x00000000000000000000000000000000000000Aa" as const;
    const set = questEligibleContracts([
      app({ contractAddresses: [addr] }),
      app({ contractAddresses: ["0x00000000000000000000000000000000000000bb"], verified: false }),
      app({ contractAddresses: ["0x00000000000000000000000000000000000000cc"], sample: true })
    ]);
    expect([...set]).toEqual([addr.toLowerCase()]);
  });

  it("ships no sample entry with contract addresses", () => {
    expect(APPS.filter((a) => a.sample && a.contractAddresses.length)).toEqual([]);
  });
});

describe("rate limiter", () => {
  it("blocks after the limit and resets after the window", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 1).ok).toBe(true);
    expect(check("a", 2)).toEqual({ ok: false, retryAfterSeconds: 1 });
    expect(check("b", 2).ok).toBe(true);
    expect(check("a", 1000).ok).toBe(true);
  });
});

describe("fetchActivity", () => {
  const user = "0x000000000000000000000000000000000000cafe";
  it("maps Blockscout transactions", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({
        items: [{ hash: "0x1", timestamp: "t", from: { hash: user }, to: { hash: "0x2" }, method: "transfer", status: "ok" }]
      }))
    );
    expect(await fetchActivity(user, fetchImpl as unknown as typeof fetch)).toEqual([
      { hash: "0x1", timestamp: "t", from: user, to: "0x2", method: "transfer", success: true }
    ]);
  });
  it("treats an unknown address as no activity", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 404 }));
    expect(await fetchActivity(user, fetchImpl as unknown as typeof fetch)).toEqual([]);
  });
});

import { levelFor } from "../lib/levels";
describe("levelFor", () => {
  it("maps XP to level and progress toward the next", () => {
    expect(levelFor(0)).toMatchObject({ index: 0, name: "Newcomer", progress: 0 });
    expect(levelFor(35)).toMatchObject({ name: "Explorer", progress: 0 });
    expect(levelFor(72).progress).toBeCloseTo(0.4933, 3);
    expect(levelFor(500)).toMatchObject({ name: "Pathfinder", progress: 1, next: undefined });
  });
});
