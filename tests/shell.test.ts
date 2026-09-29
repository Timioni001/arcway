import { describe, expect, it } from "vitest";
import { RINGS, layoutEcosystem, neighbours } from "../lib/ecosystem";
import { BOTTOM_NAV, MORE_NAV, NAV_GROUPS, PRIMARY_NAV, crumbsFor, isActive, isBottomActive, isNavActive, sectionHref, viewsFor } from "../lib/nav";
import { onchainMatch } from "../lib/search";
import { parseWatchId, watchId } from "../lib/watchlist";

describe("navigation", () => {
  it("leads with four public jobs and keeps intelligence under More", () => {
    expect(PRIMARY_NAV.map((n) => n.label)).toEqual(["Home", "Explore", "Quests", "Passport"]);
    expect(MORE_NAV.map((n) => n.label)).toEqual(["Activity", "What's New", "Insights", "Builders", "Watchlist", "For Builders", "Settings"]);
    expect(MORE_NAV.slice(0, 3).map((n) => n.href)).toEqual(["/pulse", "/radar", "/signals"]);
    expect(BOTTOM_NAV.map((n) => n.label)).toEqual(["Home", "Explore", "Quests", "Passport", "More"]);
    expect(NAV_GROUPS).toHaveLength(1);
  });
  it("folds features into their section", () => {
    expect(sectionHref("/campaigns/abc")).toBe("/quests");
    expect(sectionHref("/launch")).toBe("/submit");
    expect(sectionHref("/trails/get-started")).toBe("/apps");
    expect(isNavActive("/leaderboard", "/quests")).toBe(true);
    expect(isNavActive("/leaderboard", "/apps")).toBe(false);
    expect(viewsFor("/ecosystem")?.map((v) => v.label)).toEqual(["Apps", "Categories", "Assets", "Builders", "What's New", "Activity"]);
    expect(viewsFor("/passport/0x1")).toBeNull();
    expect(viewsFor("/signals")).toBeNull();
    expect(isBottomActive("/assets/0x36", "/apps")).toBe(true);
    expect(isBottomActive("/signals", "/more")).toBe(true);
    expect(isBottomActive("/quests", "/more")).toBe(false);
  });
  it("matches the overview only at the root", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/pulse", "/")).toBe(false);
    expect(isActive("/apps/uniswap", "/apps")).toBe(true);
    expect(isActive("/apps-x", "/apps")).toBe(false);
  });
  it("builds breadcrumbs with entity names", () => {
    expect(crumbsFor("/")).toEqual([{ label: "Home" }]);
    expect(crumbsFor("/more")).toEqual([{ label: "More" }]);
    expect(crumbsFor("/pulse")).toEqual([{ label: "Activity" }]);
    expect(crumbsFor("/campaigns")).toEqual([{ label: "Campaigns" }]);
    expect(crumbsFor("/apps/uniswap")).toEqual([{ label: "Explore", href: "/apps" }, { label: "Uniswap" }]);
    expect(crumbsFor("/builders/circle")[1].label).toBe("Circle");
    expect(crumbsFor("/terms")).toEqual([{ label: "Terms of Use" }]);
  });
});

describe("ecosystem map layout", () => {
  const layout = layoutEcosystem();
  it("places every live app once, on its ring, linked to its category and builder", () => {
    const apps = layout.nodes.filter((n) => n.kind === "app");
    expect(new Set(apps.map((n) => n.id)).size).toBe(apps.length);
    for (const n of apps) {
      expect(Math.hypot(n.x - layout.cx, n.y - layout.cy)).toBeCloseTo(RINGS.app, 0);
      const links = neighbours(layout, n.id);
      expect([...links].some((id) => id.startsWith("cat:"))).toBe(true);
    }
    expect(neighbours(layout, "builder:circle").size).toBe(3); // itself + two apps
  });
  it("keeps nodes inside the canvas", () => {
    for (const n of layout.nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(layout.width);
      expect(n.y).toBeGreaterThan(0);
      expect(n.y).toBeLessThan(layout.height);
    }
  });
});

describe("watchlist ids and onchain search", () => {
  it("round-trips typed ids and rejects unknown kinds", () => {
    expect(parseWatchId(watchId("category", "Lend & Earn"))).toEqual({ kind: "category", key: "Lend & Earn" });
    expect(parseWatchId("wallet:0x1")).toBeNull();
  });
  it("recognises addresses and transaction hashes", () => {
    expect(onchainMatch("0x7a00000000000000000000000000000000092f1a")).toMatchObject({ kind: "address" });
    expect(onchainMatch(`0x${"a".repeat(64)}`)).toEqual({ kind: "tx", value: `0x${"a".repeat(64)}` });
    expect(onchainMatch("0x123")).toBeNull();
  });
});

import { badgeSvg } from "../lib/badge";
import { EMPTY_SUBMISSION, submissionIssueUrl, validateSubmission } from "../lib/submit";

describe("submissions and badges", () => {
  const good = { ...EMPTY_SUBMISSION, name: "Tipjar", url: "https://tipjar.app", category: "Payments" as const, tagline: "Send USDC tips with a link.", contracts: "0x7a00000000000000000000000000000000092f1a", repo: "https://github.com/me/tipjar", profile: "https://x.com/me" };
  it("explains every missing field in plain words", () => {
    const e = validateSubmission(EMPTY_SUBMISSION);
    expect(Object.keys(e).sort()).toEqual(["category", "contracts", "name", "profile", "repo", "tagline", "url"]);
    expect(validateSubmission(good)).toEqual({});
    expect(validateSubmission({ ...good, contracts: "0x123" }).contracts).toMatch(/valid address/);
  });
  it("builds a pre-filled issue with the live checks", () => {
    const url = new URL(submissionIssueUrl(good, { "0x7a00000000000000000000000000000000092f1a": "contract, source verified" }));
    expect(url.pathname).toMatch(/\/issues\/new$/);
    expect(url.searchParams.get("title")).toBe("Listing: Tipjar");
    expect(url.searchParams.get("body")).toContain("contract, source verified");
    expect(url.searchParams.get("labels")).toBe("listing");
  });
  it("renders an escaped SVG badge", () => {
    const svg = badgeSvg({ label: "Arcway", value: "1.2K tx on Arc <b>" });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("&lt;b&gt;");
    expect(svg).not.toContain("<b>");
  });
});
