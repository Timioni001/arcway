import { readJson, writeJson } from "./storage";

const KEY = "arcway:recent-searches";
const MAX = 5;
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

/** Last few searches, newest first, kept only in this browser. */
export const getRecent = () => (cache ??= typeof window === "undefined" ? EMPTY : readJson<string[]>(KEY, []));
export const getRecentServer = () => EMPTY;

function set(next: string[]) {
  cache = next;
  writeJson(KEY, next);
  listeners.forEach((l) => l());
}

export function rememberSearch(term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  set([t, ...getRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
}

export const clearRecent = () => set([]);

export function subscribeRecent(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
