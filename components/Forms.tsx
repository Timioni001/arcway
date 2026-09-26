import type { CSSProperties } from "react";

/**
 * Arcway signature: overlapping vertical forms stepping through the blue
 * spectrum (sky → blue). Reads as route / layers / gateway. Pure CSS.
 */
const FORMS = [
  { c: "#A9DDF4", x: -120, y: 38 },
  { c: "#75C9F3", x: -60, y: 14 },
  { c: "#4FB4EA", x: 0, y: -10 },
  { c: "#3298D8", x: 60, y: -34 },
  { c: "#246CB0", x: 120, y: -58 }
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
