/**
 * Passport card designs, in the spirit of premium payment cards: every theme is a printed pattern,
 * not a flat colour. Patterns are generated from fixed seeds, so server and browser render the
 * same artwork (no hydration mismatch). Pure SVG, decorative only.
 */

const W = 316;
const H = 200;

/** Small deterministic PRNG (mulberry32): same seed, same card, everywhere. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => n.toFixed(1);

/** Guilloché: interlaced sine ribbons, like the security print on banknotes. */
const GUILLOCHE = Array.from({ length: 22 }, (_, i) => {
  const amp = 14 + (i % 6) * 3;
  const phase = i * 0.42;
  const base = 30 + i * 7.2;
  let d = `M -10 ${f(base + Math.sin(phase) * amp)}`;
  for (let x = 0; x <= W + 10; x += 8) d += ` L ${x} ${f(base + Math.sin(x / 34 + phase) * amp + Math.cos(x / 61 - phase) * 6)}`;
  return d;
});

/** Topographic contours around two peaks. */
const TOPO = (() => {
  const out: string[] = [];
  const peaks = [{ cx: 236, cy: 70, k: 9 }, { cx: 70, cy: 168, k: 6 }];
  peaks.forEach((p, j) => {
    for (let l = 1; l <= p.k; l++) {
      const r = l * 13;
      let d = "";
      for (let s = 0; s <= 64; s++) {
        const th = (s / 64) * Math.PI * 2;
        const rr = r * (1 + 0.16 * Math.sin(3 * th + j + l * 0.3) + 0.08 * Math.sin(5 * th - l * 0.5));
        d += `${s ? "L" : "M"} ${f(p.cx + rr * Math.cos(th))} ${f(p.cy + rr * 0.78 * Math.sin(th))} `;
      }
      out.push(`${d}Z`);
    }
  });
  return out;
})();

/** Low-poly facets for Prism. */
const PRISM = (() => {
  const r = rng(7);
  const cols = 7, rows = 5;
  const pts: [number, number][][] = [];
  for (let y = 0; y <= rows; y++) {
    pts.push([]);
    for (let x = 0; x <= cols; x++) {
      const edgeX = x === 0 || x === cols, edgeY = y === 0 || y === rows;
      pts[y].push([(x / cols) * W + (edgeX ? 0 : (r() - 0.5) * 30), (y / rows) * H + (edgeY ? 0 : (r() - 0.5) * 26)]);
    }
  }
  const tris: { d: string; o: number }[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const [a, b, c, d] = [pts[y][x], pts[y][x + 1], pts[y + 1][x], pts[y + 1][x + 1]];
    const flip = (x + y) % 2 === 0;
    const t1 = flip ? [a, b, d] : [a, b, c];
    const t2 = flip ? [a, d, c] : [b, d, c];
    for (const t of [t1, t2]) tris.push({ d: `M ${t.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L ")} Z`, o: 0.03 + r() * 0.22 });
  }
  return tris;
})();

/** Long flowing waves for Aurora. */
const WAVES = Array.from({ length: 9 }, (_, i) => {
  let d = `M -10 ${f(40 + i * 18)}`;
  for (let x = 0; x <= W + 10; x += 10) d += ` L ${x} ${f(40 + i * 18 + Math.sin(x / 48 + i * 0.7) * (16 + i * 2))}`;
  return d;
});

export const CARD_THEMES = ["arc", "graphite", "midnight", "dawn", "prism", "aurora", "pearl"] as const;

export function CardArt({ theme }: { theme: string }) {
  return (
    <svg className="card-art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="carbon" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4" height="4" fill="rgba(255,255,255,.06)" />
          <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,.06)" />
          <rect x="4" width="4" height="4" fill="rgba(0,0,0,.25)" />
          <rect y="4" width="4" height="4" fill="rgba(0,0,0,.25)" />
        </pattern>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7CF5D8" /><stop offset=".35" stopColor="#8AB8FF" /><stop offset=".65" stopColor="#D49CFF" /><stop offset="1" stopColor="#FFC6A8" />
        </linearGradient>
      </defs>
      {(theme === "arc" || theme === "pearl") && (
        <g className="card-art__guilloche">{GUILLOCHE.map((d, i) => <path key={i} d={d} />)}</g>
      )}
      {theme === "graphite" && (
        <g className="card-art__brushed">
          {Array.from({ length: 70 }, (_, i) => <line key={i} x1="0" x2={W} y1={i * 2.9} y2={i * 2.9} strokeOpacity={0.03 + ((i * 37) % 11) / 160} />)}
          <path className="card-art__arc" d="M 180 230 A 160 160 0 0 1 340 70" />
          <path className="card-art__arc" d="M 210 230 A 130 130 0 0 1 340 100" />
        </g>
      )}
      {theme === "midnight" && (
        <g>
          <rect width={W} height={H} fill="url(#carbon)" />
          <circle cx="250" cy="40" r="90" className="card-art__glow" />
        </g>
      )}
      {theme === "dawn" && <g className="card-art__topo">{TOPO.map((d, i) => <path key={i} d={d} />)}</g>}
      {theme === "prism" && <g>{PRISM.map((t, i) => <path key={i} d={t.d} fill="#fff" fillOpacity={t.o} />)}</g>}
      {theme === "aurora" && (
        <g className="card-art__waves">
          {WAVES.map((d, i) => <path key={i} d={d} stroke="url(#holo)" strokeOpacity={0.25 + (i % 3) * 0.15} />)}
        </g>
      )}
    </svg>
  );
}

/** The EMV-style chip and a contactless mark: what makes a card read as a card. */
export function CardChip() {
  return (
    <span className="card-chip" aria-hidden="true">
      <svg viewBox="0 0 44 34">
        <defs>
          <linearGradient id="chip-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F6E3A8" /><stop offset=".5" stopColor="#D6B25E" /><stop offset="1" stopColor="#F1D88E" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="42" height="32" rx="6" fill="url(#chip-gold)" stroke="rgba(90,60,10,.35)" />
        <path d="M1 12 H15 M1 22 H15 M29 12 H43 M29 22 H43 M15 1 V33 M29 1 V33 M15 17 H29" stroke="rgba(90,60,10,.45)" strokeWidth="1.2" fill="none" />
      </svg>
      <svg viewBox="0 0 24 24" className="card-chip__nfc">
        <path d="M8 6.5a8 8 0 0 1 0 11M12 4a12 12 0 0 1 0 16M16 1.5a16 16 0 0 1 0 21M4 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
