import {
  Activity, Blocks, Bookmark, Code2, IdCard, LayoutDashboard, Link2, Network, Radar, RadioTower, Search, Settings, Target, UserRound,
  type LucideIcon
} from "lucide-react";
import { getBuilder } from "./builders";
import { getQuest } from "./quests";
import { getApp } from "./registry";
import { TRAILS } from "./trails";

export type NavItem = { href: string; label: string; icon: LucideIcon; blurb: string };

/** Intelligence first, existing product after. Order is the product's mental model. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, blurb: "The Arc ecosystem at a glance" },
  { href: "/ecosystem", label: "Ecosystem", icon: Network, blurb: "Protocols, categories and how they connect" },
  { href: "/pulse", label: "Pulse", icon: Activity, blurb: "Live activity across Arc" },
  { href: "/radar", label: "Radar", icon: Radar, blurb: "What's new and what changed" },
  { href: "/builders", label: "Builders", icon: Code2, blurb: "Teams, projects and contracts" },
  { href: "/signals", label: "Signals", icon: RadioTower, blurb: "Verified onchain observations" },
  { href: "/apps", label: "Apps", icon: Blocks, blurb: "Browse and try apps on Arc" },
  { href: "/quests", label: "Quests", icon: Target, blurb: "Explore Arc and earn XP" }
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/watchlist", label: "Watchlist", icon: Bookmark, blurb: "What you follow" },
  { href: "/search", label: "Search", icon: Search, blurb: "Search everything" },
  { href: "/settings", label: "Settings", icon: Settings, blurb: "Theme, network and data" }
];

/** Personal pages: reachable from the profile menu, never the visual centre. */
export const YOU_NAV: NavItem[] = [
  { href: "/overview", label: "Your Arc", icon: UserRound, blurb: "Your progress and activity" },
  { href: "/passport", label: "Passport", icon: IdCard, blurb: "Your XP and badges" },
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
