import { readJson, writeJson } from "./storage";

/**
 * What someone follows, kept in this browser: protocols, builders, categories and assets.
 * Ids are typed ("app:uniswap", "builder:circle", "category:Payments") so one list covers all.
 * Replaces the older saved-apps list and migrates it on first read.
 */
export type WatchKind = "app" | "builder" | "category" | "asset";
export const watchId = (kind: WatchKind, key: string) => `${kind}:${key}`;
export function parseWatchId(id: string): { kind: WatchKind; key: string } | null {
  const i = id.indexOf(":");
  const kind = id.slice(0, i) as WatchKind;
  return i > 0 && (kind === "app" || kind === "builder" || kind === "category" || kind === "asset") ? { kind, key: id.slice(i + 1) } : null;
}

const KEY = "arcway:watchlist";
const LEGACY_SAVED = "arcway:saved-apps";
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function load(): string[] {
  const list = readJson<string[] | null>(KEY, null);
  if (list) return list.filter((id) => parseWatchId(id));
  const legacy = readJson<string[]>(LEGACY_SAVED, []).map((a) => watchId("app", a));
  if (legacy.length) writeJson(KEY, legacy);
  return legacy;
}

export const getWatchlist = () => (cache ??= typeof window === "undefined" ? EMPTY : load());
export const getWatchlistServer = () => EMPTY;

function set(next: string[]) {
  cache = next;
  writeJson(KEY, next);
  listeners.forEach((l) => l());
}

export const isWatched = (id: string) => getWatchlist().includes(id);
export const toggleWatch = (id: string) => set(isWatched(id) ? getWatchlist().filter((x) => x !== id) : [id, ...getWatchlist()]);
export const clearWatchlist = () => set([]);

export function subscribeWatchlist(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) { cache = null; listener(); }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** Followed app ids, for places that only care about apps. Stable reference per list change. */
let appsFrom: string[] | null = null;
let appsCache: string[] = EMPTY;
export function getWatchedApps(): string[] {
  const list = getWatchlist();
  if (list !== appsFrom) {
    appsFrom = list;
    appsCache = list.map(parseWatchId).filter((p) => p?.kind === "app").map((p) => p!.key);
  }
  return appsCache;
}
