import { APPS, type ArcApp, type Category } from "./registry";

export type BuilderView = {
  id: string;
  name: string;
  github?: string;
  x?: string;
  apps: ArcApp[];
  categories: Category[];
};

/** Builders come from the app registry, so a builder exists only if they ship a listed app. */
export function buildersFrom(apps: ArcApp[] = APPS): BuilderView[] {
  const map = new Map<string, BuilderView>();
  for (const app of apps) {
    if (!app.active || !app.builder) continue;
    const id = app.builder.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const b = map.get(id) ?? { id, name: app.builder.name, github: app.builder.github, x: app.builder.x, apps: [], categories: [] };
    b.apps.push(app);
    if (!b.categories.includes(app.category)) b.categories.push(app.category);
    map.set(id, b);
  }
  return [...map.values()].sort((a, b) => b.apps.length - a.apps.length || a.name.localeCompare(b.name));
}
