import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
const FORMS = ["#C9EAF3", "#78C6DE", "#3D91BE", "#2464A5", "#193F7A", "#0D164D"];

/** Shared layout for share images: navy card, Arcway mark, stacked forms on the right. */
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #2464A5 0%, #193F7A 45%, #080D3D 100%)", color: "#F5FAFF", fontFamily: "sans-serif" }}>
      {FORMS.map((c, i) => (
        <div
          key={c}
          style={{ position: "absolute", top: 90 - i * 22, left: 720 + i * 62, width: 96, height: 420, borderRadius: 48, background: `linear-gradient(180deg, #ffffff66, ${c} 40%, ${c})`, transform: "rotate(-12deg)", opacity: 0.9 }}
        />
      ))}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: "100%", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #3D91BE, #193F7A)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,.25)" }}>
            <div style={{ width: 26, height: 26, borderTop: "5px solid #fff", borderLeft: "5px solid #fff", borderRight: "5px solid #fff", borderRadius: "14px 14px 0 0" }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -2 }}>arcway</div>
        </div>
        {children}
      </div>
    </div>
  );
}
