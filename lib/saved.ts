import { readJson, writeJson } from "./storage";

/** Apps a visitor saved, kept in this browser. A tiny store for useSyncExternalStore. */
const KEY = "arcway:saved-apps";
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

export function getSaved(): string[] {
  if (cache === null) cache = typeof window === "undefined" ? EMPTY : readJson<string[]>(KEY, []);
  return cache;
}

export function getSavedServer(): string[] {
  return EMPTY;
}

export function toggleSaved(id: string) {
  const cur = getSaved();
  cache = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  writeJson(KEY, cache);
  listeners.forEach((l) => l());
}

export function subscribeSaved(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
