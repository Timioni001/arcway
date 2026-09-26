import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame } from "../lib/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Arcway: discover what's being built on Arc";

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>Discover what&apos;s being built on Arc.</div>
          <div style={{ fontSize: 30, marginTop: 28, color: "#A9DDF4" }}>Apps, quests and a passport of everything you do.</div>
        </div>
      </OgFrame>
    ),
    size
  );
}
