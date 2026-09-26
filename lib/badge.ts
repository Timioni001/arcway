/** Shields-style SVG badge: two segments, Geist-free (renders anywhere), dark or light. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
const width = (s: string) => Math.round(s.length * 6.6 + 18);

export function badgeSvg({ label, value, theme = "light" }: { label: string; value: string; theme?: "light" | "dark" }): string {
  const lw = width(label) + 18;
  const vw = width(value);
  const w = lw + vw;
  const bg = theme === "dark" ? "#0D2342" : "#FFFFFF";
  const fg = theme === "dark" ? "#F4FAFF" : "#132238";
  const border = theme === "dark" ? "#1D3B61" : "#DCE8F0";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="24" viewBox="0 0 ${w} 24" role="img" aria-label="${esc(label)}: ${esc(value)}">
<title>${esc(label)}: ${esc(value)}</title>
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#4FB4EA"/><stop offset="1" stop-color="#246CB0"/></linearGradient></defs>
<rect x=".5" y=".5" width="${w - 1}" height="23" rx="11.5" fill="${bg}" stroke="${border}"/>
<rect x="${lw}" y="2" width="${vw - 2}" height="20" rx="10" fill="url(#g)"/>
<circle cx="13" cy="12" r="4" fill="url(#g)"/>
<g font-family="-apple-system,Segoe UI,Helvetica,Arial,sans-serif" font-size="11" font-weight="600">
<text x="22" y="16" fill="${fg}">${esc(label)}</text>
<text x="${lw + vw / 2 - 1}" y="16" fill="#FFFFFF" text-anchor="middle">${esc(value)}</text>
</g></svg>`;
}
