import { keccak256, toBytes } from "viem";
import { describe, expect, it, vi } from "vitest";
import { humanizeError } from "../lib/errors";
import { formatUsdc, shortAddress, timeAgo } from "../lib/format";
import { questHash } from "../lib/quests";
import { APPS, CATEGORIES, discoverApps, isVerified, questEligibleContracts, type ArcApp } from "../lib/registry";
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
  const src = { checkedAt: "2026-09-26", sourceUrl: "https://example.com" };
  const addr = "0x00000000000000000000000000000000000000Aa" as const;
  const app = (over: Partial<ArcApp>): ArcApp => ({
    id: "x", slug: "x", name: "X", tagline: "", description: "", category: "Payments", status: "live",
    features: [], active: true, addedAt: "2026-09-01", firstAction: "", ...over
  });
  const verified = { contracts: { testnet: [addr] }, verification: src };

  it("ranks featured, then verified, then newest; samples last", () => {
    const apps = [
      app({ id: "s", sample: true, featured: true }),
      app({ id: "old", addedAt: "2026-01-01", ...verified }),
      app({ id: "new", addedAt: "2026-09-20", ...verified }),
      app({ id: "unv", addedAt: "2026-09-24" }),
      app({ id: "feat", featured: true })
    ];
    expect(discoverApps(apps, {}, "testnet").map((a) => a.id)).toEqual(["feat", "new", "old", "unv", "s"]);
  });

  it("searches features and builders", () => {
    expect(discoverApps([app({ id: "c", builder: { name: "Circle" } })], { search: "circle" })).toHaveLength(1);
    expect(discoverApps([app({ id: "g", features: ["USDC gas"] })], { search: "gas" })).toHaveLength(1);
    expect(discoverApps([app({ id: "t", category: "Trading" })], { category: "Payments" })).toHaveLength(0);
  });

  it("verification is per network and needs a source", () => {
    expect(isVerified(app(verified), "testnet")).toBe(true);
    expect(isVerified(app(verified), "mainnet")).toBe(false);
    expect(isVerified(app({ contracts: { testnet: [addr] } }), "testnet")).toBe(false);
    expect(isVerified(app({ ...verified, sample: true }), "testnet")).toBe(false);
  });

  it("only counts verified contracts on the current network for quests", () => {
    const set = questEligibleContracts([
      app(verified),
      app({ contracts: { testnet: ["0x00000000000000000000000000000000000000bb"] } }),
      app({ contracts: { mainnet: ["0x00000000000000000000000000000000000000cc"] }, verification: src })
    ], "testnet");
    expect([...set]).toEqual([addr.toLowerCase()]);
  });

  it("the live registry is real: no samples, unique slugs, https links, known categories", () => {
    expect(APPS.filter((a) => a.sample)).toEqual([]);
    expect(new Set(APPS.map((a) => a.slug)).size).toBe(APPS.length);
    for (const a of APPS) {
      expect(a.url, a.name).toMatch(/^https:\/\//);
      expect(CATEGORIES).toContain(a.category);
    }
  });

  it("Uniswap counts for quests on mainnet only", () => {
    const uni = APPS.find((a) => a.id === "uniswap")!;
    expect(isVerified(uni, "mainnet")).toBe(true);
    expect(isVerified(uni, "testnet")).toBe(false);
    expect(questEligibleContracts(APPS, "mainnet").has("0x4fca4a51ab4f23a7447b3284fbd7d73289a89fb1")).toBe(true);
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

import { buildersFrom } from "../lib/builders";
import { questProgress, questViews } from "../lib/quests";
describe("builders and quest progress", () => {
  it("derives builders from active apps only", () => {
    const b = buildersFrom();
    const circle = b.find((x) => x.name === "Circle")!;
    expect(circle.apps.map((a) => a.slug).sort()).toEqual(["arc-portal", "circle-cctp"]);
    expect(b[0].name).toBe("Circle"); // most apps first
  });
  it("reports partial progress for the starter path", () => {
    const views = questViews({ completed: new Set(["first-tx"]), eligible: {} });
    expect(questProgress(views.find((q) => q.id === "arc-explorer")!)).toBeCloseTo(1 / 3);
    expect(questProgress(views.find((q) => q.id === "first-tx")!)).toBe(1);
    expect(questProgress(views.find((q) => q.id === "explore-app")!)).toBe(0);
  });
});

import { dayLabel } from "../lib/format";
describe("dayLabel", () => {
  it("groups by relative day", () => {
    const now = new Date(2026, 8, 25, 15);
    expect(dayLabel(new Date(2026, 8, 25, 1).toISOString(), now)).toBe("Today");
    expect(dayLabel(new Date(2026, 8, 24, 23).toISOString(), now)).toBe("Yesterday");
    expect(dayLabel(new Date(2026, 8, 2).toISOString(), now)).toBe("Sep 2");
  });
});

import { currentStreak, lastDays } from "../lib/streak";
describe("streaks", () => {
  const now = new Date(2026, 8, 26, 15);
  const at = (d: number, h = 12) => new Date(2026, 8, d, h).toISOString();
  it("counts consecutive days ending today", () => {
    expect(currentStreak([at(26), at(25), at(24, 1), at(22)], now)).toBe(3);
  });
  it("keeps yesterday's streak alive until today ends", () => {
    expect(currentStreak([at(25), at(24)], now)).toBe(2);
  });
  it("is zero after a missed day", () => {
    expect(currentStreak([at(23), at(22)], now)).toBe(0);
    expect(currentStreak([], now)).toBe(0);
  });
  it("buckets the last n days oldest first", () => {
    const days = lastDays([at(26), at(26, 9), at(20)], 7, now);
    expect(days.map((d) => d.count)).toEqual([1, 0, 0, 0, 0, 0, 2]);
    expect(days[6].day).toBe("2026-09-26");
  });
});
