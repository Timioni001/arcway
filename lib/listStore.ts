import { readJson, writeJson } from "./storage";

const EMPTY: string[] = [];

/**
 * A string list in localStorage that React can subscribe to
 * (useSyncExternalStore). Syncs across tabs.
 */
export function createListStore(key: string) {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();
  const get = () => {
    if (cache === null) cache = typeof window === "undefined" ? EMPTY : readJson<string[]>(key, []);
    return cache;
  };
  const set = (next: string[]) => {
    cache = next;
    writeJson(key, next);
    listeners.forEach((l) => l());
  };
  return {
    get,
    getServer: () => EMPTY,
    toggle: (id: string) => set(get().includes(id) ? get().filter((x) => x !== id) : [id, ...get()]),
    add: (id: string) => { if (!get().includes(id)) set([id, ...get()]); },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
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
  };
}
