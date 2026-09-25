import type { CSSProperties } from "react";

/**
 * Stacked glass slabs (§24). Six layers read as one connected system; they are
 * intentionally unlabelled. Pure CSS: no canvas, no Three.js.
 */
const SLABS = [
  { x: -150, y: 40, r: -8, lit: 0.25, rim: 0.12 },
  { x: -92, y: 18, r: -5, lit: 0.4, rim: 0.16 },
  { x: -34, y: -4, r: -2, lit: 0.55, rim: 0.22 },
  { x: 24, y: -22, r: 1, lit: 0.72, rim: 0.3 },
  { x: 82, y: -38, r: 4, lit: 0.88, rim: 0.38 },
  { x: 140, y: -52, r: 7, lit: 1, rim: 0.5 }
];

export function HeroObject({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-stack ${className}`} aria-hidden="true">
      {SLABS.map((s, i) => (
        <div
          key={i}
          className="glass-slab"
          style={
            {
              "--x": `${s.x}px`,
              "--y": `${s.y}px`,
              "--r": `${s.r}deg`,
              "--lit": s.lit,
              "--rim": s.rim,
              "--d": `${-i * 1.3}s`
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
