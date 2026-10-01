import { getQuest } from "./quests";
import { readJson, writeJson } from "./storage";

/**
 * How a passport looks. Proof of activity (XP, quests, badges) is onchain; presentation is not:
 * name, theme, frame and title are chosen here and kept in this browser. Every style except the
 * defaults is unlocked by participation, so the passport shows what its owner has done.
 */

export type StyleKind = "theme" | "frame" | "title";

/** What unlocks an item. Quests are recorded onchain; apps explored are counted in this browser. */
export type Unlock = { quests?: number; apps?: number; questId?: string };

export type StyleItem = { id: string; kind: StyleKind; name: string; unlock: Unlock | null };

export type StyleProgress = { quests: number; apps: number; questIds: string[] };

export type PassportStyle = { name: string; theme: string; frame: string; title: string };

export const STYLE_ITEMS: StyleItem[] = [
  { id: "arc", kind: "theme", name: "Arc blue", unlock: null },
  { id: "graphite", kind: "theme", name: "Graphite", unlock: null },
  { id: "midnight", kind: "theme", name: "Midnight carbon", unlock: { questId: "arc-explorer" } },
  { id: "dawn", kind: "theme", name: "Dawn contour", unlock: { questId: "arc-voyager" } },
  { id: "prism", kind: "theme", name: "Prism", unlock: { quests: 10 } },
  { id: "pearl", kind: "theme", name: "Pearl", unlock: { questId: "arc-regular" } },
  { id: "aurora", kind: "theme", name: "Aurora holo", unlock: { questId: "arc-pathfinder" } },
  { id: "none", kind: "frame", name: "No frame", unlock: null },
  { id: "ring", kind: "frame", name: "Ring", unlock: { quests: 4 } },
  { id: "halo", kind: "frame", name: "Halo", unlock: { quests: 12 } },
  { id: "none", kind: "title", name: "No title", unlock: null },
  { id: "first-mover", kind: "title", name: "First Mover", unlock: { questId: "first-tx" } },
  { id: "app-hopper", kind: "title", name: "App Hopper", unlock: { questId: "app-actions-10" } },
  { id: "arc-explorer", kind: "title", name: "Arc Explorer", unlock: { questId: "arc-explorer" } },
  { id: "resident", kind: "title", name: "Resident", unlock: { questId: "twenty-days" } },
  { id: "pathfinder", kind: "title", name: "Pathfinder", unlock: { questId: "arc-pathfinder" } }
];

export const DEFAULT_STYLE: PassportStyle = { name: "", theme: "arc", frame: "none", title: "none" };


export function itemsOf(kind: StyleKind): StyleItem[] {
  return STYLE_ITEMS.filter((i) => i.kind === kind);
}

export function getItem(kind: StyleKind, id: string): StyleItem | undefined {
  return STYLE_ITEMS.find((i) => i.kind === kind && i.id === id);
}

export function isUnlocked(item: StyleItem, p: StyleProgress): boolean {
  const u = item.unlock;
  if (!u) return true;
  if (u.quests !== undefined && p.quests < u.quests) return false;
  if (u.apps !== undefined && p.apps < u.apps) return false;
  if (u.questId !== undefined && !p.questIds.includes(u.questId)) return false;
  return true;
}

/** Plain words for how to get it: "Complete 3 quests", "Explore 5 Arc apps". */
export function unlockText(item: StyleItem): string {
  const u = item.unlock;
  if (!u) return "Included";
  if (u.questId) return `Complete the ${getQuest(u.questId)?.title ?? u.questId} quest`;
  if (u.quests !== undefined) return `Complete ${u.quests} quest${u.quests === 1 ? "" : "s"}`;
  if (u.apps !== undefined) return `Explore ${u.apps} Arc apps`;
  return "";
}

/** How far along an item is: 1 of 3 quests, 2 of 5 apps, 0 of 1 for a named quest. Null when included. */
export function unlockProgress(item: StyleItem, p: StyleProgress): { have: number; need: number } | null {
  const u = item.unlock;
  if (!u) return null;
  if (u.questId) return { have: p.questIds.includes(u.questId) ? 1 : 0, need: 1 };
  if (u.quests !== undefined) return { have: Math.min(p.quests, u.quests), need: u.quests };
  if (u.apps !== undefined) return { have: Math.min(p.apps, u.apps), need: u.apps };
  return null;
}

/** Letters, numbers, spaces and . _ - only; 24 characters at most. */
export function cleanName(raw: string): string {
  return raw.replace(/[^\p{L}\p{N} ._-]/gu, "").replace(/\s+/g, " ").trimStart().slice(0, 24);
}

/** Anything locked or unknown falls back to the default, so a stored style can never show more than was earned. */
export function resolveStyle(stored: Partial<PassportStyle> | null | undefined, p: StyleProgress): PassportStyle {
  const pick = (kind: StyleKind, id: string | undefined) => {
    const item = id ? getItem(kind, id) : undefined;
    return item && isUnlocked(item, p) ? item.id : DEFAULT_STYLE[kind];
  };
  return {
    name: cleanName(stored?.name ?? "").trim(),
    theme: pick("theme", stored?.theme),
    frame: pick("frame", stored?.frame),
    title: pick("title", stored?.title)
  };
}

export function unlockedCount(p: StyleProgress): { unlocked: number; total: number } {
  const earnable = STYLE_ITEMS.filter((i) => i.unlock);
  return { unlocked: earnable.filter((i) => isUnlocked(i, p)).length, total: earnable.length };
}

// ---------------------------------------------------------------- storage (per wallet, this browser)

export const STYLE_EVENT = "arcway:passport-style";
const key = (address: string) => `arcway:passport-style:${address.toLowerCase()}`;

export function loadStyle(address: string): Partial<PassportStyle> | null {
  return readJson<Partial<PassportStyle> | null>(key(address), null);
}

export function saveStyle(address: string, style: PassportStyle) {
  writeJson(key(address), style);
  try { window.dispatchEvent(new Event(STYLE_EVENT)); } catch { /* SSR */ }
}
