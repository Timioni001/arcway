import type { CSSProperties } from "react";

/**
 * Arcway signature: overlapping vertical forms stepping through the blue
 * spectrum (sky → navy). Reads as route / layers / gateway. Pure CSS.
 */
const FORMS = [
  { c: "#C9EAF3", x: -150, y: 46 },
  { c: "#78C6DE", x: -90, y: 22 },
  { c: "#3D91BE", x: -30, y: -2 },
  { c: "#2464A5", x: 30, y: -26 },
  { c: "#193F7A", x: 90, y: -50 },
  { c: "#080D3D", x: 150, y: -74 }
];

export function Forms() {
  return (
    <div className="forms" aria-hidden="true">
      {FORMS.map((f, i) => (
        <div
          key={f.c}
          className="form"
          style={{ "--c": f.c, "--x": `${f.x}px`, "--y": `${f.y}px`, "--d": `${-i * 1.1}s` } as CSSProperties}
        />
      ))}
    </div>
  );
}
