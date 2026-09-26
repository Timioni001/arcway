import type { CSSProperties } from "react";

/**
 * Restrained floating white dots: a hint of network activity, not a starfield.
 * Positions come from a seeded generator so server and client render the same.
 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

export function FloatingDots({ count = 18, seed = 7, className = "" }: { count?: number; seed?: number; className?: string }) {
  const rand = seeded(seed);
  const dots = Array.from({ length: count }, () => {
    const size = 1 + rand() * 2; // 1–3px
    return {
      left: `${(rand() * 100).toFixed(2)}%`,
      top: `${(rand() * 100).toFixed(2)}%`,
      "--s": `${size.toFixed(2)}px`,
      "--o": (0.18 + rand() * 0.57).toFixed(2), // 0.18–0.75
      "--b": rand() > 0.78 ? "1px" : "0px",
      "--dx": `${((rand() - 0.5) * 36).toFixed(1)}px`, // up to ~18px each way
      "--dy": `${((rand() - 0.5) * 36).toFixed(1)}px`,
      "--t": `${(8 + rand() * 10).toFixed(1)}s`, // 8–18s
      "--dl": `${(-rand() * 12).toFixed(1)}s`
    } as CSSProperties;
  });
  return (
    <span className={`fdots ${className}`} aria-hidden="true">
      {dots.map((style, i) => <i key={i} style={style} />)}
    </span>
  );
}
