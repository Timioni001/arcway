import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame } from "../lib/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Arcway: Explore Arc. Complete quests. Build your Passport.";

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Explore Arc.</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Complete quests.</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: "#7FC4EE" }}>Build your Passport.</div>
          <div style={{ fontSize: 28, marginTop: 26, color: "#A9DDF4" }}>17 quests, 2,145 XP, live on Arc Mainnet.</div>
        </div>
      </OgFrame>
    ),
    size
  );
}
