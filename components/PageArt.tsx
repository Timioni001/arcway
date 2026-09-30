import type { LucideIcon } from "lucide-react";

/**
 * Each section has its own signature: a hue and a small drawing of what the section is about.
 * Pure SVG and CSS, decorative only, drawn in the section's hue.
 */
export type ArtKind = "constellation" | "path" | "pulse" | "stack" | "lens" | "coins" | "blocks" | "gift" | "podium" | "grid" | "map" | "icon";

const LOOKS: Record<string, { art: ArtKind; hue: number }> = {
  Explore: { art: "constellation", hue: 205 },
  Ecosystem: { art: "map", hue: 190 },
  Assets: { art: "coins", hue: 38 },
  Builders: { art: "blocks", hue: 258 },
  Quests: { art: "path", hue: 214 },
  Campaigns: { art: "gift", hue: 340 },
  Leaderboard: { art: "podium", hue: 44 },
  Activity: { art: "pulse", hue: 168 },
  "What's New": { art: "stack", hue: 222 },
  "Daily digest": { art: "stack", hue: 222 },
  Insights: { art: "lens", hue: 280 },
  More: { art: "grid", hue: 210 }
};

export function lookFor(kicker: string) {
  return LOOKS[kicker] ?? { art: "icon" as ArtKind, hue: 207 };
}

export function PageArt({ art, icon: Icon }: { art: ArtKind; icon?: LucideIcon }) {
  return (
    <div className="part" data-art={art} aria-hidden="true">
      {art === "icon" ? (
        <span className="part__icon">{Icon && <Icon />}<i /><i /></span>
      ) : (
        <svg viewBox="0 0 240 160" className="part__svg">{ART[art]}</svg>
      )}
    </div>
  );
}

const ART: Record<Exclude<ArtKind, "icon">, React.ReactNode> = {
  constellation: (
    <>
      <path className="a-line" d="M30 120 L78 70 L128 96 L170 40 L214 78 M78 70 L96 28 M128 96 L150 136" />
      {[[30, 120, 7], [78, 70, 10], [128, 96, 8], [170, 40, 12], [214, 78, 7], [96, 28, 6], [150, 136, 6]].map(([x, y, r], i) => (
        <circle key={i} className="a-star" cx={x} cy={y} r={r} style={{ "--d": i } as React.CSSProperties} />
      ))}
    </>
  ),
  map: (
    <>
      {[70, 48, 26].map((r) => <circle key={r} className="a-ring" cx="120" cy="80" r={r} />)}
      {[[120, 10], [185, 60], [165, 130], [70, 135], [52, 50]].map(([x, y], i) => <circle key={i} className="a-star" cx={x} cy={y} r="7" style={{ "--d": i } as React.CSSProperties} />)}
      <circle className="a-core" cx="120" cy="80" r="14" />
    </>
  ),
  coins: (
    <>
      {[0, 1, 2, 3].map((i) => <ellipse key={i} className="a-coin" cx="100" cy={118 - i * 16} rx="46" ry="14" style={{ "--d": i } as React.CSSProperties} />)}
      {[0, 1].map((i) => <ellipse key={i} className="a-coin" cx="172" cy={122 - i * 16} rx="34" ry="11" style={{ "--d": i + 4 } as React.CSSProperties} />)}
    </>
  ),
  blocks: (
    <>
      {[[40, 90], [84, 90], [128, 90], [62, 50], [106, 50], [84, 10], [172, 90], [150, 50]].map(([x, y], i) => (
        <rect key={i} className="a-block" x={x} y={y} width="40" height="36" rx="9" style={{ "--d": i } as React.CSSProperties} />
      ))}
    </>
  ),
  path: (
    <>
      <path className="a-line a-line--thick" d="M24 130 C 70 130, 70 80, 116 80 S 170 30, 216 30" />
      {[[24, 130], [116, 80], [216, 30]].map(([x, y], i) => <circle key={i} className="a-node" cx={x} cy={y} r="14" style={{ "--d": i } as React.CSSProperties} />)}
    </>
  ),
  gift: (
    <>
      <rect className="a-block" x="70" y="62" width="100" height="78" rx="12" />
      <rect className="a-lid" x="62" y="44" width="116" height="26" rx="8" />
      <path className="a-line a-line--thick" d="M120 44 V140 M120 44 C 100 20, 80 30, 96 44 M120 44 C 140 20, 160 30, 144 44" />
      {[[40, 40], [200, 60], [205, 120], [36, 110]].map(([x, y], i) => <circle key={i} className="a-star" cx={x} cy={y} r="5" style={{ "--d": i } as React.CSSProperties} />)}
    </>
  ),
  podium: (
    <>
      <rect className="a-block a-block--2" x="40" y="80" width="52" height="64" rx="8" />
      <rect className="a-block a-block--1" x="94" y="52" width="52" height="92" rx="8" />
      <rect className="a-block a-block--3" x="148" y="98" width="52" height="46" rx="8" />
      <path className="a-crown" d="M104 38 L110 22 L120 32 L130 22 L136 38 Z" />
    </>
  ),
  pulse: (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} className="a-bar" x={16 + i * 15.5} y="30" width="9" height="100" rx="4.5" style={{ "--d": i } as React.CSSProperties} />
      ))}
    </>
  ),
  stack: (
    <>
      {[2, 1, 0].map((i) => <rect key={i} className="a-card" x={46 + i * 14} y={30 + i * 16} width="140" height="84" rx="14" style={{ "--d": i } as React.CSSProperties} />)}
      <path className="a-line" d="M60 64 H130 M60 82 H150 M60 100 H110" />
    </>
  ),
  lens: (
    <>
      {[62, 44, 26].map((r, i) => <circle key={r} className="a-ring a-ring--pulse" cx="110" cy="80" r={r} style={{ "--d": i } as React.CSSProperties} />)}
      <path className="a-line a-line--thick" d="M150 120 L196 150" />
      <circle className="a-core" cx="110" cy="80" r="10" />
    </>
  ),
  grid: (
    <>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} className="a-block" x={30 + (i % 4) * 48} y={20 + Math.floor(i / 4) * 44} width="36" height="34" rx="9" style={{ "--d": i } as React.CSSProperties} />
      ))}
    </>
  )
};
