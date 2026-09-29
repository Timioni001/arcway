import {
  Activity, Award, Blocks, Gift, Megaphone, Bookmark, Code2, House, IdCard, LayoutGrid, Link2, Network, Newspaper, Radar, RadioTower, Rocket, Search, Settings, Target, Trophy, UserRound, Wallet,
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
 * Simple first, technical later (progressive disclosure): what a newcomer needs at the top,
 * live network data and builder tools further down.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Get started",
    items: [
      { href: "/", label: "Home", icon: House, blurb: "What Arc and Arcway are" },
      { href: "/apps", label: "Apps", icon: Blocks, blurb: "Find apps to try on Arc" },
      { href: "/quests", label: "Quests", icon: Target, blurb: "Learn Arc by doing, earn XP" },
      { href: "/passport", label: "Passport", icon: IdCard, blurb: "Your XP, level and badges" },
      { href: "/wallet", label: "Get a wallet", icon: Wallet, blurb: "Create a free Arc wallet in seconds" }
    ]
  },
  {
    label: "Explore Arc",
    items: [
      { href: "/ecosystem", label: "Ecosystem", icon: Network, blurb: "Every app, by category, on one map" },
      { href: "/builders", label: "Builders", icon: Code2, blurb: "The teams behind the apps" },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy, blurb: "Top explorers this season" },
      { href: "/campaigns", label: "Campaigns", icon: Gift, blurb: "Complete tasks, share a USDC prize pool" }
    ]
  },
  {
    label: "Live data",
    items: [
      { href: "/digest", label: "Arc today", icon: Newspaper, blurb: "Today's changes in one page" },
      { href: "/pulse", label: "Pulse", icon: Activity, blurb: "Activity on Arc as it happens" },
      { href: "/radar", label: "Radar", icon: Radar, blurb: "New contracts and what changed" },
      { href: "/signals", label: "Signals", icon: RadioTower, blurb: "Notable changes, with evidence" }
    ]
  },
  {
    label: "For builders",
    items: [
      { href: "/submit", label: "Submit a project", icon: Rocket, blurb: "Get your Arc app listed" },
      { href: "/launch", label: "Launch a campaign", icon: Megaphone, blurb: "Reward people for trying your app" },
      { href: "/widgets", label: "Badges", icon: Award, blurb: "Show your app is live on Arc" }
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

/** Mobile tabs: the four simplest destinations, and "More" for everything else (no hidden dropdown). */
export const BOTTOM_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: House, blurb: "" },
  { href: "/apps", label: "Apps", icon: Blocks, blurb: "" },
  { href: "/quests", label: "Quests", icon: Target, blurb: "" },
  { href: "/passport", label: "Passport", icon: IdCard, blurb: "" },
  { href: "/more", label: "More", icon: LayoutGrid, blurb: "" }
];

/** The group a top-level page belongs to, for the section tabs in the top bar. Detail pages get breadcrumbs instead. */
export function sectionFor(pathname: string): NavGroup | null {
  return NAV_GROUPS.find((g) => g.items.some((n) => n.href === pathname)) ?? null;
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const ALL = [...PRIMARY_NAV, ...SECONDARY_NAV, ...YOU_NAV];
const EXTRA: Record<string, string> = { terms: "Terms of Use", privacy: "Privacy Policy", trails: "Apps", more: "More" };

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
    first === "passport" || first === "pay" ? `${second.slice(0, 6)}…${second.slice(-4)}` :
    undefined;
  return [sectionCrumb, { label: name ?? "Details" }];
}

export function currentSection(pathname: string): NavItem {
  return ALL.find((n) => isActive(pathname, n.href) && n.href !== "/") ?? PRIMARY_NAV[0];
}
