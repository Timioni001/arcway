import { buildersFrom, type BuilderView } from "./builders";
import { QUESTS, type Quest } from "./quests";
import { contractIndex } from "./intel";
import { APPS, CATEGORIES, discoverApps, type ArcApp, type Category } from "./registry";
import { TRAILS, type Trail } from "./trails";

/** An address or transaction hash typed into search: where it can be opened. */
export type OnchainMatch =
  | { kind: "address"; value: string; app?: ArcApp }
  | { kind: "tx"; value: string };

export function onchainMatch(term: string): OnchainMatch | null {
  const t = term.trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(t)) return { kind: "tx", value: t };
  if (/^0x[0-9a-fA-F]{40}$/.test(t)) return { kind: "address", value: t, app: contractIndex().get(t.toLowerCase()) };
  return null;
}

export type SearchResults = {
  onchain: OnchainMatch | null;
  apps: ArcApp[];
  categories: Category[];
  quests: Quest[];
  builders: BuilderView[];
  trails: Trail[];
};

/** One search over everything Arcway lists, grouped by kind. Empty term → empty results. */
export function searchAll(term: string): SearchResults {
  const t = term.trim().toLowerCase();
  if (!t) return { onchain: null, apps: [], categories: [], quests: [], builders: [], trails: [] };
  return {
    onchain: onchainMatch(term),
    apps: discoverApps(APPS, { search: t }),
    categories: CATEGORIES.filter((c) => c.toLowerCase().includes(t)),
    quests: QUESTS.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(t)),
    builders: buildersFrom().filter((b) => `${b.name} ${b.apps.map((a) => a.name).join(" ")}`.toLowerCase().includes(t)),
    trails: TRAILS.filter((tr) => `${tr.title} ${tr.goal}`.toLowerCase().includes(t))
  };
}

export const resultCount = (r: SearchResults) =>
  (r.onchain ? 1 : 0) + r.apps.length + r.categories.length + r.quests.length + r.builders.length + r.trails.length;

/** Categories suggested before anyone types: the ones with the most live apps. */
export function suggestedCategories(limit = 4): Category[] {
  const counts = new Map<Category, number>();
  for (const a of APPS) if (a.active && !a.sample) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  return [...CATEGORIES].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)).slice(0, limit);
}
