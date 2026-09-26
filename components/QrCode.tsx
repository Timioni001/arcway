'use client';

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR for a URL, rendered as SVG. Dark modules in Arcway navy on white for reliable scanning. */
export function QrCode({ value, label, size = 184 }: { value: string; label: string; size?: number }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#080D3D", light: "#FFFFFF" } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(""));
    return () => { alive = false; };
  }, [value]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "arcway-pay-link.svg" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <figure className="qr" style={{ width: size }}>
      <div className="qr__code" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
      {svg && <button type="button" className="btn btn--ghost btn--sm" onClick={download}>Download QR</button>}
    </figure>
  );
}
