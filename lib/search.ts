import { buildersFrom, type BuilderView } from "./builders";
import { QUESTS, type Quest } from "./quests";
import { APPS, CATEGORIES, discoverApps, type ArcApp, type Category } from "./registry";
import { TRAILS, type Trail } from "./trails";

export type SearchResults = {
  apps: ArcApp[];
  categories: Category[];
  quests: Quest[];
  builders: BuilderView[];
  trails: Trail[];
};

/** One search over everything Arcway lists, grouped by kind. Empty term → empty results. */
export function searchAll(term: string): SearchResults {
  const t = term.trim().toLowerCase();
  if (!t) return { apps: [], categories: [], quests: [], builders: [], trails: [] };
  return {
    apps: discoverApps(APPS, { search: t }),
    categories: CATEGORIES.filter((c) => c.toLowerCase().includes(t)),
    quests: QUESTS.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(t)),
    builders: buildersFrom().filter((b) => `${b.name} ${b.apps.map((a) => a.name).join(" ")}`.toLowerCase().includes(t)),
    trails: TRAILS.filter((tr) => `${tr.title} ${tr.goal}`.toLowerCase().includes(t))
  };
}

export const resultCount = (r: SearchResults) =>
  r.apps.length + r.categories.length + r.quests.length + r.builders.length + r.trails.length;

/** Categories suggested before anyone types: the ones with the most live apps. */
export function suggestedCategories(limit = 4): Category[] {
  const counts = new Map<Category, number>();
  for (const a of APPS) if (a.active && !a.sample) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  return [...CATEGORIES].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)).slice(0, limit);
}
