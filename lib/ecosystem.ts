import { buildersFrom, type BuilderView } from "./builders";
import { APPS, CATEGORIES, appContracts, type ArcApp, type Category } from "./registry";

/**
 * Deterministic radial layout for the ecosystem map:
 * Arc at the centre, categories on the inner ring, apps grouped by category on the
 * middle ring, builders on the outer ring next to their apps. Relationships come only
 * from the registry (category, builder, published contracts), never inferred.
 */
export type MapNode =
  | { id: string; kind: "arc"; label: string; x: number; y: number; angle: number }
  | { id: string; kind: "category"; label: string; x: number; y: number; angle: number; category: Category; count: number }
  | { id: string; kind: "app"; label: string; x: number; y: number; angle: number; app: ArcApp; contracts: number }
  | { id: string; kind: "builder"; label: string; x: number; y: number; angle: number; builder: BuilderView };

export type MapEdge = { from: string; to: string; kind: "arc" | "category" | "builder" };

export type EcosystemLayout = { width: number; height: number; cx: number; cy: number; nodes: MapNode[]; edges: MapEdge[] };

export const RINGS = { category: 150, app: 268, builder: 405 };

const rad = (deg: number) => (deg * Math.PI) / 180;
const at = (cx: number, cy: number, r: number, deg: number) => ({ x: +(cx + r * Math.cos(rad(deg))).toFixed(1), y: +(cy + r * Math.sin(rad(deg))).toFixed(1) });

export function layoutEcosystem(apps: ArcApp[] = APPS): EcosystemLayout {
  const width = 1100;
  const height = 900;
  const cx = width / 2;
  const cy = height / 2;
  const live = apps.filter((a) => a.active && !a.sample);
  const sector = 360 / CATEGORIES.length;

  const nodes: MapNode[] = [{ id: "arc", kind: "arc", label: "Arc", x: cx, y: cy, angle: 0 }];
  const edges: MapEdge[] = [];
  const appAngle = new Map<string, number>();

  CATEGORIES.forEach((category, ci) => {
    const angle = -90 + ci * sector;
    const inCat = live.filter((a) => a.category === category).sort((a, b) => a.name.localeCompare(b.name));
    const catId = `cat:${category}`;
    nodes.push({ id: catId, kind: "category", label: category, ...at(cx, cy, RINGS.category, angle), angle, category, count: inCat.length });
    edges.push({ from: "arc", to: catId, kind: "arc" });
    const step = Math.min(15, (sector - 8) / Math.max(1, inCat.length));
    inCat.forEach((app, i) => {
      const a = angle + (i - (inCat.length - 1) / 2) * step;
      appAngle.set(app.id, a);
      nodes.push({ id: `app:${app.id}`, kind: "app", label: app.name, ...at(cx, cy, RINGS.app, a), angle: a, app, contracts: appContracts(app).length });
      edges.push({ from: catId, to: `app:${app.id}`, kind: "category" });
    });
  });

  // Builders sit at the mean angle of their apps; nudge apart when two land together.
  const placed: number[] = [];
  for (const builder of buildersFrom(live)) {
    const angles = builder.apps.map((a) => appAngle.get(a.id)).filter((a): a is number => a !== undefined);
    if (!angles.length) continue;
    let angle = angles.reduce((s, a) => s + a, 0) / angles.length;
    while (placed.some((p) => Math.abs(p - angle) < 9)) angle += 9;
    placed.push(angle);
    nodes.push({ id: `builder:${builder.id}`, kind: "builder", label: builder.name, ...at(cx, cy, RINGS.builder, angle), angle, builder });
    for (const app of builder.apps) edges.push({ from: `app:${app.id}`, to: `builder:${builder.id}`, kind: "builder" });
  }

  return { width, height, cx, cy, nodes, edges };
}

/** Everything directly connected to a node (the node included). */
export function neighbours(layout: EcosystemLayout, id: string): Set<string> {
  const set = new Set([id]);
  for (const e of layout.edges) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
}
