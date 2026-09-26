import { ImageResponse } from "next/og";
import { getAddress, isAddress, type Address } from "viem";
import { shortAddress } from "../../../lib/format";
import { OG_SIZE, OgFrame } from "../../../lib/og/card";
import { passportSummary } from "../../../lib/server/passportSummary";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Arcway passport";

export default async function Image({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const valid = isAddress(address);
  const s = valid ? await passportSummary(getAddress(address) as Address) : { xp: 0, level: "Newcomer", badges: 0, total: 4 };
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: "#A9DFEB", textTransform: "uppercase" }}>{s.level}</div>
          <div style={{ fontSize: 128, fontWeight: 700, lineHeight: 1, marginTop: 12, letterSpacing: -4 }}>{`${s.xp} XP`}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 28, alignItems: "center" }}>
            {Array.from({ length: s.total }, (_, i) => (
              <div key={i} style={{ width: 56, height: 10, borderRadius: 10, background: i < s.badges ? "#78C6DE" : "rgba(245,250,255,.2)" }} />
            ))}
            <div style={{ fontSize: 26, color: "#C9EAF3", marginLeft: 12 }}>{`${s.badges}/${s.total} badges`}</div>
          </div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#A9DFEB", fontFamily: "monospace" }}>{valid ? shortAddress(getAddress(address)) : ""}</div>
        </div>
      </OgFrame>
    ),
    size
  );
}
