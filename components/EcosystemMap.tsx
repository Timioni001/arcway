'use client';

import { ArrowRight, Code2, FileCode2, Network } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { layoutEcosystem, neighbours, type MapNode } from "../lib/ecosystem";
import { STATUS_LABEL } from "../lib/registry";
import { CATEGORY_META, AppMark, CategoryTile } from "./CategoryIcon";

function labelPos(n: MapNode, offset: number) {
  const a = (n.angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: n.x + cos * offset,
    y: n.y + sin * offset + (sin > 0.6 ? 10 : sin < -0.6 ? -2 : 4),
    anchor: (cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle") as "start" | "end" | "middle"
  };
}

function hrefFor(n: MapNode): string | undefined {
  if (n.kind === "app") return `/apps/${n.app.slug}`;
  if (n.kind === "builder") return `/builders/${n.builder.id}`;
  if (n.kind === "category") return `/ecosystem?category=${encodeURIComponent(n.category)}#protocols`;
  return undefined;
}

/**
 * Interactive map of how Arc's listed protocols relate: categories, apps and the builders behind them.
 * Hover or focus to trace connections; select to see details. Built from the registry only.
 */
export function EcosystemMap({ compact = false }: { compact?: boolean }) {
  const layout = useMemo(() => layoutEcosystem(), []);
  const [showBuilders, setShowBuilders] = useState(!compact);
  const [showContracts, setShowContracts] = useState(true);
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const byId = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout]);
  const visible = (n: MapNode) => showBuilders || n.kind !== "builder";
  const focus = hover ?? selected;

  // Two hops for categories and builders so the whole chain lights up.
  const related = useMemo(() => {
    if (!focus) return null;
    const set = neighbours(layout, focus);
    const node = byId.get(focus);
    if (node?.kind === "category" || node?.kind === "builder") {
      for (const id of [...set]) if (id.startsWith("app:")) for (const x of neighbours(layout, id)) if (x !== "arc") set.add(x);
    }
    return set;
  }, [focus, layout, byId]);

  const apps = layout.nodes.filter((n) => n.kind === "app");
  const builders = layout.nodes.filter((n) => n.kind === "builder");
  const contracts = apps.reduce((s, n) => s + (n.kind === "app" ? n.contracts : 0), 0);
  const current = focus ? byId.get(focus) : undefined;

  const select = (id: string) => setSelected((s) => (s === id ? null : id));
  const nodeProps = (n: MapNode) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-pressed": selected === n.id,
    "aria-label": n.kind === "app" ? `${n.label}, ${n.app.category} app` : n.kind === "builder" ? `${n.label}, builder` : n.kind === "category" ? `${n.label}, ${n.count} apps` : "Arc",
    "data-dim": related ? !related.has(n.id) : undefined,
    "data-active": focus === n.id || undefined,
    onPointerEnter: () => setHover(n.id),
    onPointerLeave: () => setHover(null),
    onFocus: () => setHover(n.id),
    onBlur: () => setHover(null),
    onClick: () => select(n.id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(n.id); }
      if (e.key === "Escape") setSelected(null);
    }
  });

  return (
    <div className="emap" data-compact={compact || undefined}>
      <div className="emap__toolbar">
        <div className="emap__legend" aria-hidden="true">
          <span><i className="lg lg--cat" />Category</span>
          <span><i className="lg lg--app" />App</span>
          {showBuilders && <span><i className="lg lg--builder" />Builder</span>}
          {showContracts && <span><i className="lg lg--contract" />Published contract</span>}
        </div>
        <div className="row" style={{ gap: 6 }} role="group" aria-label="Map layers">
          <button className="chip" aria-pressed={showBuilders} onClick={() => setShowBuilders((v) => !v)}><Code2 aria-hidden="true" />Builders</button>
          <button className="chip" aria-pressed={showContracts} onClick={() => setShowContracts((v) => !v)}><FileCode2 aria-hidden="true" />Contracts</button>
        </div>
      </div>

      <div className="emap__stage">
        <svg className="emap__svg" viewBox={showBuilders ? `0 0 ${layout.width} ${layout.height}` : `${layout.cx - 380} ${layout.cy - 350} 760 700`} role="group" aria-label="Arc ecosystem map" onPointerLeave={() => setHover(null)}>
          <defs>
            <clipPath id="emap-clip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5" /></clipPath>
            <radialGradient id="emap-core" cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#4FB4EA" />
              <stop offset=".55" stopColor="#246CB0" />
              <stop offset="1" stopColor="#10224A" />
            </radialGradient>
          </defs>

          {[150, 268, ...(showBuilders ? [405] : [])].map((r) => (
            <circle key={r} cx={layout.cx} cy={layout.cy} r={r} className="emap__ring" />
          ))}

          <g className="emap__edges">
            {layout.edges.map((e) => {
              const a = byId.get(e.from)!;
              const b = byId.get(e.to)!;
              if (!visible(a) || !visible(b)) return null;
              const on = related ? related.has(a.id) && related.has(b.id) : false;
              return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="emap__edge" data-kind={e.kind} data-on={on || undefined} data-dim={related && !on ? true : undefined} />;
            })}
          </g>

          {layout.nodes.filter(visible).map((n, i) => {
            const d = { "--d": `${Math.min(i * 18, 700)}ms` } as React.CSSProperties;
            if (n.kind === "arc") {
              return (
                <g key={n.id} className="emap__node emap__node--arc" style={d} {...nodeProps(n)}>
                  <circle cx={n.x} cy={n.y} r={46} className="emap__pulse" />
                  <circle cx={n.x} cy={n.y} r={38} fill="url(#emap-core)" />
                  <text x={n.x} y={n.y + 6} textAnchor="middle" className="emap__core-label">Arc</text>
                </g>
              );
            }
            if (n.kind === "category") {
              const meta = CATEGORY_META[n.category];
              const Icon = meta.icon;
              return (
                <g key={n.id} className="emap__node emap__node--cat" style={{ ...d, "--cat": meta.color } as React.CSSProperties} {...nodeProps(n)}>
                  <circle cx={n.x} cy={n.y} r={26} className="emap__cat-bg" />
                  <Icon x={n.x - 11} y={n.y - 11} width={22} height={22} className="emap__cat-icon" aria-hidden="true" />
                  <text x={n.x} y={n.y + 44} textAnchor="middle" className="emap__label emap__label--cat">{n.label}</text>
                </g>
              );
            }
            if (n.kind === "app") {
              const meta = CATEGORY_META[n.app.category];
              const Icon = meta.icon;
              const lp = labelPos(n, 30);
              return (
                <g key={n.id} className="emap__node emap__node--app" style={{ ...d, "--cat": meta.color } as React.CSSProperties} {...nodeProps(n)}>
                  <circle cx={n.x} cy={n.y} r={21} className="emap__app-bg" />
                  {n.app.logo
                    ? <image href={n.app.logo} x={n.x - 18} y={n.y - 18} width={36} height={36} clipPath="url(#emap-clip)" preserveAspectRatio="xMidYMid slice" />
                    : <Icon x={n.x - 10} y={n.y - 10} width={20} height={20} className="emap__cat-icon" aria-hidden="true" />}
                  {showContracts && Array.from({ length: Math.min(n.contracts, 6) }, (_, k) => {
                    const a = ((n.angle + 90 + (k - (Math.min(n.contracts, 6) - 1) / 2) * 22) * Math.PI) / 180;
                    return <circle key={k} cx={n.x + Math.cos(a) * 29} cy={n.y + Math.sin(a) * 29} r={3.4} className="emap__contract" />;
                  })}
                  <text x={lp.x} y={lp.y} textAnchor={lp.anchor} className="emap__label emap__label--app">{n.label}</text>
                </g>
              );
            }
            const lp = labelPos(n, 16);
            return (
              <g key={n.id} className="emap__node emap__node--builder" style={d} {...nodeProps(n)}>
                <rect x={n.x - 7} y={n.y - 7} width={14} height={14} rx={4} className="emap__builder" />
                <text x={lp.x} y={lp.y} textAnchor={lp.anchor} className="emap__label emap__label--builder">{n.label}</text>
              </g>
            );
          })}
        </svg>

        <aside className="emap__panel" aria-live="polite">
          {!current || current.kind === "arc" ? (
            <>
              <div className="emap__panel-kicker"><Network aria-hidden="true" />Arc ecosystem</div>
              <dl className="emap__stats">
                <div><dt>Categories</dt><dd className="mono">{layout.nodes.filter((n) => n.kind === "category").length}</dd></div>
                <div><dt>Apps</dt><dd className="mono">{apps.length}</dd></div>
                <div><dt>Builders</dt><dd className="mono">{builders.length}</dd></div>
                {contracts > 0 && <div><dt>Published contracts</dt><dd className="mono">{contracts}</dd></div>}
              </dl>
              <p className="xs secondary">Hover, focus or select a node to trace its connections. Relationships come from each project&apos;s listing.</p>
            </>
          ) : current.kind === "category" ? (
            <>
              <div className="emap__panel-kicker"><CategoryTile category={current.category} size="xs" />Category</div>
              <h3 className="h4">{current.label}</h3>
              <p className="small secondary">{CATEGORY_META[current.category].blurb}. {current.count} app{current.count === 1 ? "" : "s"} listed.</p>
              <ul className="emap__list">
                {apps.filter((a) => a.kind === "app" && a.app.category === current.category).map((a) => a.kind === "app" && (
                  <li key={a.id}><Link href={`/apps/${a.app.slug}`}><AppMark app={a.app} size="sm" />{a.app.name}</Link></li>
                ))}
              </ul>
            </>
          ) : current.kind === "app" ? (
            <>
              <div className="emap__panel-kicker"><AppMark app={current.app} size="sm" />{current.app.category}</div>
              <h3 className="h4">{current.app.name}</h3>
              <p className="small secondary">{current.app.tagline}</p>
              <dl className="emap__facts">
                <div><dt>Status</dt><dd>{STATUS_LABEL[current.app.status]}</dd></div>
                <div><dt>Builder</dt><dd>{current.app.builder?.name ?? "—"}</dd></div>
                <div><dt>Published contracts</dt><dd className="mono">{current.contracts}</dd></div>
              </dl>
            </>
          ) : (
            <>
              <div className="emap__panel-kicker"><Code2 aria-hidden="true" />Builder</div>
              <h3 className="h4">{current.label}</h3>
              <ul className="emap__list">
                {current.builder.apps.map((a) => <li key={a.id}><Link href={`/apps/${a.slug}`}><AppMark app={a} size="sm" />{a.name}</Link></li>)}
              </ul>
            </>
          )}
          {current && hrefFor(current) && (
            <Link href={hrefFor(current)!} className="link small emap__open">
              {current.kind === "app" ? "Open protocol" : current.kind === "builder" ? "Open builder" : "See protocols"}<ArrowRight aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
