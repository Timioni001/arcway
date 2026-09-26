import {
  Activity, Award, Blocks, Bookmark, Code2, IdCard, LayoutDashboard, Link2, Network, Newspaper, Radar, RadioTower, Rocket, Search, Settings, Target, Trophy, UserRound,
  type LucideIcon
} from "lucide-react";
import { getBuilder } from "./builders";
import { getQuest } from "./quests";
import { getApp } from "./registry";
import { TRAILS } from "./trails";

export type NavItem = { href: string; label: string; icon: LucideIcon; blurb: string };

export type NavGroup = { label: string; items: NavItem[] };

/** The product in four sections: understand Arc, discover what's on it, take part, and build on it. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Understand",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard, blurb: "The Arc ecosystem at a glance" },
      { href: "/ecosystem", label: "Ecosystem", icon: Network, blurb: "Protocols, categories and how they connect" },
      { href: "/pulse", label: "Pulse", icon: Activity, blurb: "Live activity across Arc" },
      { href: "/radar", label: "Radar", icon: Radar, blurb: "What's new and what changed" },
      { href: "/signals", label: "Signals", icon: RadioTower, blurb: "Verified onchain observations" }
    ]
  },
  {
    label: "Discover",
    items: [
      { href: "/apps", label: "Apps", icon: Blocks, blurb: "Browse and try apps on Arc" },
      { href: "/builders", label: "Builders", icon: Code2, blurb: "Teams, projects and contracts" }
    ]
  },
  {
    label: "Participate",
    items: [
      { href: "/quests", label: "Quests", icon: Target, blurb: "Explore Arc and earn XP" },
      { href: "/passport", label: "Passport", icon: IdCard, blurb: "Your XP, level and badges" },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy, blurb: "Top explorers this season" }
    ]
  },
  {
    label: "Build on Arc",
    items: [
      { href: "/submit", label: "Submit a project", icon: Rocket, blurb: "Get your Arc app listed" },
      { href: "/widgets", label: "Badges", icon: Award, blurb: "Show your app is live on Arc" },
      { href: "/digest", label: "Arc today", icon: Newspaper, blurb: "Daily digest and RSS" }
    ]
  }
];

export const PRIMARY_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const SECONDARY_NAV: NavItem[] = [
  { href: "/watchlist", label: "Watchlist", icon: Bookmark, blurb: "What you follow" },
  { href: "/search", label: "Search", icon: Search, blurb: "Search everything" },
  { href: "/settings", label: "Settings", icon: Settings, blurb: "Theme, network and data" }
];

/** Personal pages: reachable from the profile menu, never the visual centre. */
export const YOU_NAV: NavItem[] = [
  { href: "/overview", label: "Your Arc", icon: UserRound, blurb: "Your progress and activity" },
  { href: "/activity", label: "Your activity", icon: Activity, blurb: "Your transactions on Arc" },
  { href: "/pay", label: "Pay links", icon: Link2, blurb: "Request USDC with a link" }
];

/** Five items only on mobile; the dropdown holds everything else. */
export const BOTTOM_NAV: { href: string; label: string }[] = [
  { href: "/", label: "Overview" },
  { href: "/ecosystem", label: "Explore" },
  { href: "/pulse", label: "Pulse" },
  { href: "/radar", label: "Radar" },
  { href: "/watchlist", label: "Watchlist" }
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ALL = [...PRIMARY_NAV, ...SECONDARY_NAV, ...YOU_NAV];
const EXTRA: Record<string, string> = { terms: "Terms of Use", privacy: "Privacy Policy", trails: "Apps" };

export type Crumb = { label: string; href?: string };

/** Breadcrumb for the top bar: section, then the entity name when there is one. */
export function crumbsFor(pathname: string): Crumb[] {
  if (pathname === "/") return [{ label: "Overview" }];
  const [first, second] = pathname.split("/").filter(Boolean);
  const section = ALL.find((n) => n.href === `/${first}`);
  const sectionCrumb: Crumb = section ? { label: section.label, href: section.href } : { label: EXTRA[first] ?? "Arcway", href: first === "trails" ? "/apps" : undefined };
  if (!second) return [{ label: sectionCrumb.label }];
  const name =
    first === "apps" ? getApp(second)?.name :
    first === "builders" ? getBuilder(second)?.name :
    first === "quests" ? getQuest(second)?.title :
    first === "trails" ? TRAILS.find((t) => t.id === second)?.title :
    first === "passport" || first === "pay" ? `${second.slice(0, 6)}…${second.slice(-4)}` :
    undefined;
  return [sectionCrumb, { label: name ?? "Details" }];
}

export function currentSection(pathname: string): NavItem {
  return ALL.find((n) => isActive(pathname, n.href) && n.href !== "/") ?? PRIMARY_NAV[0];
}
