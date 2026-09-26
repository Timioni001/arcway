import { APPS, type ArcApp, type Category } from "./registry";

export type BuilderView = {
  id: string;
  name: string;
  github?: string;
  x?: string;
  apps: ArcApp[];
  categories: Category[];
};

export const builderId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const getBuilder = (id: string, apps: ArcApp[] = APPS) => buildersFrom(apps).find((b) => b.id === id);

/** Builders come from the app registry, so a builder exists only if they ship a listed app. */
export function buildersFrom(apps: ArcApp[] = APPS): BuilderView[] {
  const map = new Map<string, BuilderView>();
  for (const app of apps) {
    if (!app.active || !app.builder) continue;
    const id = builderId(app.builder.name);
    const b = map.get(id) ?? { id, name: app.builder.name, github: app.builder.github, x: app.builder.x, apps: [], categories: [] };
    b.apps.push(app);
    if (!b.categories.includes(app.category)) b.categories.push(app.category);
    map.set(id, b);
  }
  return [...map.values()].sort((a, b) => b.apps.length - a.apps.length || a.name.localeCompare(b.name));
}

/** The app whose logo stands for a builder: the first one with a real logo. */
export const builderMark = (b: BuilderView): ArcApp => b.apps.find((a) => a.logo) ?? b.apps[0];
