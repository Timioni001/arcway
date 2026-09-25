/** Arc at the centre, three branches, two leaves each (§14 slide 03). */
const BRANCHES = [
  { label: "APPS", leaves: ["PAYMENTS", "DEFI"] },
  { label: "QUESTS", leaves: ["MISSIONS", "XP"] },
  { label: "BUILDERS", leaves: ["REPOS", "PROFILES"] }
];

/** Ids are per-SVG: a gradient inside a display:none SVG can't be referenced by the visible one. */
function Defs({ id, height }: { id: string; height: number }) {
  return (
    <defs>
      {/* userSpaceOnUse: straight vertical paths have a zero-width bbox, which breaks bbox gradients. */}
      <linearGradient id={`${id}-path`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={height}>
        <stop offset="0" stopColor="#8CCBFF" stopOpacity=".7" />
        <stop offset="1" stopColor="#155EEF" stopOpacity=".15" />
      </linearGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#155EEF" stopOpacity=".55" />
        <stop offset="1" stopColor="#155EEF" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Node({ x, y, w, label, kind }: { x: number; y: number; w: number; label: string; kind: "core" | "node" | "leaf" }) {
  const h = kind === "core" ? 52 : kind === "node" ? 44 : 36;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} className={kind === "core" ? "node node--core" : kind === "node" ? "node" : "leaf"} />
      <text x={x} y={y + (kind === "leaf" ? 4 : 5)} textAnchor="middle" fontSize={kind === "leaf" ? 12 : 14} className={kind === "leaf" ? "t-leaf" : undefined}>
        {label}
      </text>
    </g>
  );
}

function Desktop() {
  const cx = 480;
  const xs = [200, 480, 760];
  return (
    <svg className="netmap__desktop" viewBox="0 0 960 460" role="img" aria-label="Arc connects apps, quests and builders">
      <Defs id="nm-d" height={460} />
      <circle cx={cx} cy={60} r={120} fill="url(#nm-d-glow)" />
      {xs.map((x, i) => {
        const d = `M${cx} 86 C ${cx} 150, ${x} 130, ${x} 196`;
        return (
          <g key={i}>
            <path d={d} className="path" stroke="url(#nm-d-path)" />
            <path d={d} className="pulse" style={{ animationDelay: `${i * 1.4}s` }} />
            <path d={`M${x} 218 V 300 M${x} 300 C ${x} 320, ${x - 70} 320, ${x - 70} 344 M${x} 300 C ${x} 320, ${x + 70} 320, ${x + 70} 344`} className="path" stroke="url(#nm-d-path)" />
          </g>
        );
      })}
      <Node x={cx} y={60} w={120} label="ARC" kind="core" />
      {BRANCHES.map((b, i) => (
        <g key={b.label}>
          <Node x={xs[i]} y={218} w={140} label={b.label} kind="node" />
          <Node x={xs[i] - 70} y={380} w={124} label={b.leaves[0]} kind="leaf" />
          <Node x={xs[i] + 70} y={380} w={124} label={b.leaves[1]} kind="leaf" />
        </g>
      ))}
    </svg>
  );
}

function Mobile() {
  const rows = [150, 300, 450];
  return (
    <svg className="netmap__mobile" viewBox="0 0 360 560" role="img" aria-label="Arc connects apps, quests and builders">
      <Defs id="nm-m" height={560} />
      <circle cx={70} cy={50} r={90} fill="url(#nm-m-glow)" />
      <path d="M70 76 V 450" className="path" stroke="url(#nm-m-path)" />
      <path d="M70 76 V 450" className="pulse" />
      <Node x={70} y={50} w={110} label="ARC" kind="core" />
      {BRANCHES.map((b, i) => (
        <g key={b.label}>
          <path d={`M70 ${rows[i]} H 110`} className="path" stroke="url(#nm-m-path)" />
          <Node x={180} y={rows[i]} w={140} label={b.label} kind="node" />
          <text x={116} y={rows[i] + 44} fontSize={12} className="t-leaf">{b.leaves.join("  ·  ")}</text>
        </g>
      ))}
    </svg>
  );
}

export function NetworkMap() {
  return (
    <div className="netmap surface surface--lg">
      <Desktop />
      <Mobile />
    </div>
  );
}
