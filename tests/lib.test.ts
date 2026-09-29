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

import { FEE_ACTIONS, feeUsd, formatUsd } from "../lib/fees";
describe("fees", () => {
  it("prices gas in USDC (18-decimal native units)", () => {
    // 65k gas at 20 gwei = 0.0013 USDC
    expect(feeUsd(65_000n, 20_000_000_000n)).toBeCloseTo(0.0013, 10);
    expect(feeUsd(65_000n, 20_000_000_000n, 1000)).toBeCloseTo(1.3, 10);
    expect(feeUsd(65_000n, 20_000_000_000n, -3)).toBe(0);
  });
  it("formats small costs without rounding them to zero", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(0.00001)).toBe("<$0.0001");
    expect(formatUsd(0.0013)).toBe("$0.0013");
    expect(formatUsd(0.25)).toBe("$0.250");
    expect(formatUsd(1234.5)).toBe("$1,234.50");
  });
  it("has one estimate per action", () => {
    expect(new Set(FEE_ACTIONS.map((a) => a.id)).size).toBe(FEE_ACTIONS.length);
  });
});

import { buildPayPath, cleanNote, parseAmount, readPayRequest } from "../lib/pay";
describe("pay links", () => {
  it("parses amounts into 6-decimal USDC", () => {
    expect(parseAmount("10")).toMatchObject({ ok: true, value: 10_000_000n, text: "10" });
    expect(parseAmount(" 2.50 ")).toMatchObject({ ok: true, value: 2_500_000n, text: "2.5" });
    expect(parseAmount("1,000")).toMatchObject({ ok: true, value: 1_000_000_000n });
    expect(parseAmount("007.10")).toMatchObject({ ok: true, text: "7.1" });
  });
  it("rejects bad amounts with a reason", () => {
    for (const bad of ["", "0", "abc", "1.2345678", "-5", ".", "2000000"]) expect(parseAmount(bad).ok, bad).toBe(false);
  });
  it("cleans notes and builds canonical links", () => {
    expect(cleanNote("  Coffee <script>\u0000 ")).toBe("Coffee script");
    expect(cleanNote("x".repeat(200))).toHaveLength(80);
    expect(buildPayPath("0x7a00000000000000000000000000000000092f1a", "5", "Lunch & coffee"))
      .toBe("/pay/0x7A00000000000000000000000000000000092f1A?amount=5&note=Lunch+%26+coffee");
  });
  it("reads requests defensively", () => {
    expect(readPayRequest("nope", {})).toBeNull();
    const r = readPayRequest("0x7a00000000000000000000000000000000092f1a", { amount: "-1", note: "hi" })!;
    expect(r.amount).toBeUndefined();
    expect(r.note).toBe("hi");
  });
});

import { APPS as ALL_APPS } from "../lib/registry";
import { TRAILS, trailProgress } from "../lib/trails";
describe("trails", () => {
  it("only link to apps that exist", () => {
    const slugs = new Set(ALL_APPS.map((a) => a.slug));
    for (const t of TRAILS) for (const s of t.steps) if (s.appSlug) expect(slugs.has(s.appSlug), `${t.id}:${s.id}`).toBe(true);
  });
  it("counts progress per trail", () => {
    const t = TRAILS[0];
    expect(trailProgress(t, [`${t.id}:${t.steps[0].id}`, "other:x"])).toEqual({ done: 1, total: t.steps.length, complete: false });
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import { appForContract, availableStatusFilters, isNew, matchesStatus } from "../lib/registry";
import { builderId, builderMark, getBuilder } from "../lib/builders";
import { resultCount, searchAll, suggestedCategories } from "../lib/search";
import { addressHues } from "../lib/avatar";
describe("status filters", () => {
  const base = ALL_APPS[0];
  it("marks apps new only within 14 days", () => {
    const now = Date.parse("2026-09-26T00:00:00Z");
    expect(isNew({ ...base, addedAt: "2026-09-20" }, now)).toBe(true);
    expect(isNew({ ...base, addedAt: "2026-09-01" }, now)).toBe(false);
    expect(isNew({ ...base, addedAt: "2026-10-01" }, now)).toBe(false);
    expect(isNew({ ...base, addedAt: "2026-09-20", sample: true }, now)).toBe(false);
  });
  it("only offers filters that match at least one app", () => {
    const now = Date.parse("2026-12-31T00:00:00Z");
    const filters = availableStatusFilters(ALL_APPS, "mainnet", now);
    expect(filters).toContain("live");
    expect(filters).not.toContain("new");
    for (const f of filters) expect(ALL_APPS.some((a) => a.active && matchesStatus(a, f, "mainnet", now))).toBe(true);
  });
  it("maps a contract back to its app", () => {
    const uni = ALL_APPS.find((a) => a.id === "uniswap")!;
    const c = uni.contracts!.mainnet![0];
    expect(appForContract(c.toUpperCase().replace("0X", "0x"), ALL_APPS, "mainnet")?.id).toBe("uniswap");
    expect(appForContract("0x0000000000000000000000000000000000000001", ALL_APPS, "mainnet")).toBeUndefined();
    expect(appForContract(null)).toBeUndefined();
  });
});

describe("logos", () => {
  it("point at files that exist", () => {
    for (const a of ALL_APPS) if (a.logo) expect(existsSync(join(process.cwd(), "public", a.logo)), a.id).toBe(true);
  });
  it("builders use a real logo when any of their apps has one", () => {
    for (const b of buildersFrom()) if (b.apps.some((a) => a.logo)) expect(builderMark(b).logo).toBeTruthy();
  });
});

describe("builders and search", () => {
  it("builds stable slugs and finds builders by them", () => {
    expect(builderId("Uniswap Labs")).toBe("uniswap-labs");
    expect(getBuilder("uniswap-labs")?.apps.map((a) => a.id)).toContain("uniswap");
    expect(getBuilder("nope")).toBeUndefined();
  });
  it("groups results by kind", () => {
    expect(resultCount(searchAll(""))).toBe(0);
    const r = searchAll("circle");
    expect(r.builders.map((b) => b.id)).toContain("circle");
    expect(searchAll("pay").categories).toContain("Payments");
    expect(suggestedCategories(3)).toHaveLength(3);
  });
  it("gives every address its own avatar hues", () => {
    expect(addressHues("0xabcdef123456")).toEqual(addressHues("0xABCDEF123456"));
    expect(addressHues("0x111111222222")).not.toEqual(addressHues("0x999999888888"));
  });
});

import { DEFAULT_STYLE, STYLE_ITEMS, cleanName, isUnlocked, resolveStyle, unlockText, unlockedCount } from "../lib/passportStyle";

describe("passport styles", () => {
  const none = { quests: 0, apps: 0, questIds: [] as string[] };
  const some = { quests: 3, apps: 5, questIds: ["arrive-with-usdc", "first-tx", "explore-app"] };
  it("starts with only the defaults unlocked", () => {
    expect(STYLE_ITEMS.filter((i) => isUnlocked(i, none)).every((i) => i.unlock === null)).toBe(true);
    expect(unlockedCount(none)).toEqual({ unlocked: 0, total: STYLE_ITEMS.filter((i) => i.unlock).length });
  });
  it("unlocks by participation and says how", () => {
    const halo = STYLE_ITEMS.find((i) => i.id === "halo")!;
    expect(isUnlocked(halo, some)).toBe(true);
    expect(unlockText(halo)).toBe("Complete 3 quests");
    expect(unlockText(STYLE_ITEMS.find((i) => i.id === "app-hopper")!)).toBe("Explore 5 Arc apps");
    expect(isUnlocked(STYLE_ITEMS.find((i) => i.id === "aurora")!, some)).toBe(false);
  });
  it("never shows a locked style, even if one was stored", () => {
    expect(resolveStyle({ theme: "aurora", frame: "halo", title: "arc-explorer", name: " Ada " }, none)).toEqual({ ...DEFAULT_STYLE, name: "Ada" });
    expect(resolveStyle({ theme: "midnight", frame: "halo", title: "app-hopper" }, some)).toMatchObject({ theme: "midnight", frame: "halo", title: "app-hopper" });
    expect(resolveStyle({ theme: "nope" }, some).theme).toBe("arc");
  });
  it("keeps display names short and plain", () => {
    expect(cleanName("<b>Ada</b>  Lovelace!!")).toBe("bAdab Lovelace");
    expect(cleanName("x".repeat(40))).toHaveLength(24);
  });
});
