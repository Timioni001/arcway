import {
  Activity, Award, HandCoins, Blocks, Bookmark, Code2, Coins, Compass, Gift, House, IdCard, LayoutGrid, Link2, Megaphone, Network, Newspaper, RadioTower, Rocket, Search, Settings, Target, Trophy, UserRound, Wallet,
  type LucideIcon
} from "lucide-react";
import { getBuilder } from "./builders";
import { getCampaignMeta } from "./campaigns";
import { getQuest } from "./quests";
import { getApp } from "./registry";
import { TRAILS } from "./trails";

export type NavItem = { href: string; label: string; icon: LucideIcon; blurb: string };

export type NavGroup = { label: string; items: NavItem[] };

/**
 * People first: four public jobs (Home, Explore, Quests, Passport) and More for everything deeper.
 * Network intelligence keeps its routes (/pulse, /radar, /signals) but uses plain names:
 * Activity, What's New and Insights. Features without their own job live inside a section.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/", label: "Home", icon: House, blurb: "Start here" },
      { href: "/apps", label: "Explore", icon: Compass, blurb: "Apps, categories, assets and builders on Arc" },
      { href: "/quests", label: "Quests", icon: Target, blurb: "Short tasks that earn XP and badges" },
      { href: "/passport", label: "Passport", icon: IdCard, blurb: "Your level, badges and style" }
    ]
  }
];

/** Deeper and secondary areas. A group in the desktop sidebar, a page (/more) on mobile. */
export const MORE_NAV: NavItem[] = [
  { href: "/pulse", label: "Activity", icon: Activity, blurb: "See what is happening on Arc" },
  { href: "/radar", label: "What's New", icon: Newspaper, blurb: "See what changed on Arc" },
  { href: "/signals", label: "Insights", icon: RadioTower, blurb: "Notable patterns, with evidence" },
  { href: "/builders", label: "Builders", icon: Code2, blurb: "The teams behind the apps" },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark, blurb: "Apps, builders and assets you follow" },
  { href: "/submit", label: "For Builders", icon: Rocket, blurb: "List your app, run a campaign, add a badge" },
  { href: "/settings", label: "Settings", icon: Settings, blurb: "Theme, network and data" }
];

export const PRIMARY_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const SECONDARY_NAV: NavItem[] = [
  { href: "/search", label: "Search", icon: Search, blurb: "Search everything" }
];

/**
 * Views that live inside a section instead of the sidebar. The section's own page comes first.
 * Shown as tabs on the section's pages and listed on the More page.
 */
export const SECTION_VIEWS: Record<string, NavItem[]> = {
  "/apps": [
    { href: "/apps", label: "Apps", icon: Blocks, blurb: "" },
    { href: "/ecosystem", label: "Categories", icon: Network, blurb: "Every app by category, on one map" },
    { href: "/assets", label: "Assets", icon: Coins, blurb: "Tokens on Arc and their activity" },
    { href: "/builders", label: "Builders", icon: Code2, blurb: "" },
    { href: "/radar", label: "What's New", icon: Newspaper, blurb: "" },
    { href: "/pulse", label: "Activity", icon: Activity, blurb: "" }
  ],
  "/quests": [
    { href: "/quests", label: "Quests", icon: Target, blurb: "" },
    { href: "/campaigns", label: "Campaigns", icon: Gift, blurb: "Complete tasks, share a USDC prize pool" },
    { href: "/sponsor", label: "Sponsor", icon: HandCoins, blurb: "Put USDC behind a quest; finishers claim it" },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy, blurb: "Top explorers this season" }
  ],
  "/submit": [
    { href: "/submit", label: "Submit a project", icon: Rocket, blurb: "" },
    { href: "/launch", label: "Launch a campaign", icon: Megaphone, blurb: "Reward people for trying your app" },
    { href: "/widgets", label: "Badges", icon: Award, blurb: "Show your app is live on Arc" }
  ]
};

/** The nav item that owns a path: its own entry, or the section a folded-in view belongs to. */
const PARENT: Record<string, string> = {
  "/trails": "/apps",
  "/digest": "/apps",
  ...Object.fromEntries(Object.entries(SECTION_VIEWS).flatMap(([parent, views]) => views.map((v) => [v.href, parent])))
};

/** Personal pages: reachable from the profile menu, never the visual centre. */
export const YOU_NAV: NavItem[] = [
  { href: "/overview", label: "Your Arc", icon: UserRound, blurb: "Your progress and activity" },
  { href: "/activity", label: "Your activity", icon: Activity, blurb: "Your transactions on Arc" },
  { href: "/pay", label: "Pay links", icon: Link2, blurb: "Request USDC with a link" },
  { href: "/wallet", label: "Get a wallet", icon: Wallet, blurb: "Create a free Arc wallet with a passkey" }
];

/** Every destination with a description: the More page, search and footer draw from this. */
export const FOLDED_VIEWS: NavItem[] = Object.values(SECTION_VIEWS).flat().filter((v) => v.blurb);
export const ALL_PAGES: NavItem[] = [...PRIMARY_NAV, ...MORE_NAV, ...FOLDED_VIEWS, ...SECONDARY_NAV, ...YOU_NAV];

/** Mobile tabs match the public model; More holds the rest. */
export const BOTTOM_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, blurb: "" },
  { href: "/apps", label: "Explore", icon: Compass, blurb: "" },
  { href: "/quests", label: "Quests", icon: Target, blurb: "" },
  { href: "/passport", label: "Passport", icon: IdCard, blurb: "" },
  { href: "/more", label: "More", icon: LayoutGrid, blurb: "" }
];

/** The section owning a path, after resolving folded-in views (/campaigns → /quests). */
export function sectionHref(pathname: string): string {
  const first = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  return PARENT[first] ?? first;
}

/** Tabs for the section the current top-level page belongs to (detail pages get breadcrumbs instead). */
export function viewsFor(pathname: string): NavItem[] | null {
  if (pathname.split("/").filter(Boolean).length !== 1) return null;
  return SECTION_VIEWS[sectionHref(pathname)] ?? null;
}

/** Rail and tab highlight: true for the item's own pages and for the views folded into it. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return isActive(pathname, href) || sectionHref(pathname) === href;
}

export function isBottomActive(pathname: string, href: string): boolean {
  if (href === "/more") return !BOTTOM_NAV.some((n) => n.href !== "/more" && isNavActive(pathname, n.href));
  return isNavActive(pathname, href);
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ALL = ALL_PAGES;
const EXTRA: Record<string, string> = { terms: "Terms of Use", privacy: "Privacy Policy", trails: "Apps", more: "More", digest: "What's New" };

export type Crumb = { label: string; href?: string };

/** Breadcrumb for the top bar: section, then the entity name when there is one. */
export function crumbsFor(pathname: string): Crumb[] {
  if (pathname === "/") return [{ label: "Home" }];
  const [first, second] = pathname.split("/").filter(Boolean);
  const section = ALL.find((n) => n.href === `/${first}`);
  const sectionCrumb: Crumb = section ? { label: section.label, href: section.href } : { label: EXTRA[first] ?? "Arcway", href: first === "trails" ? "/apps" : undefined };
  if (!second) return [{ label: sectionCrumb.label }];
  const name =
    first === "apps" ? getApp(second)?.name :
    first === "builders" ? getBuilder(second)?.name :
    first === "quests" ? getQuest(second)?.title :
    first === "trails" ? TRAILS.find((t) => t.id === second)?.title :
    first === "campaigns" ? getCampaignMeta(second)?.title :
    first === "passport" || first === "pay" || first === "assets" ? `${second.slice(0, 6)}…${second.slice(-4)}` :
    undefined;
  return [sectionCrumb, { label: name ?? "Details" }];
}

export function currentSection(pathname: string): NavItem {
  return ALL.find((n) => isNavActive(pathname, n.href) && n.href !== "/") ?? PRIMARY_NAV[0];
}
