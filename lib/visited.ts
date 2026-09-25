import { readJson, writeJson } from "./storage";

const KEY = "arcway:visited-apps";

/** Apps this browser opened from Arcway. Local only; never used for verification. */
export function visitedApps(): string[] {
  return readJson<string[]>(KEY, []);
}

export function markVisited(appId: string) {
  writeJson(KEY, [...new Set([appId, ...visitedApps()])]);
}
