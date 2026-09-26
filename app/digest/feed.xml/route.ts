import { NETWORK_NAME } from "../../../lib/config";
import { SOURCE_LABEL } from "../../../lib/intel";
import { loadSignals } from "../../../lib/server/intel";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

/** "What changed on Arc": signals as RSS, so anyone can follow Arc from a reader, Slack or Telegram bot. */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  let items = "";
  try {
    const { data } = await loadSignals();
    items = data.slice(0, 30).map((s) => `
    <item>
      <title>${esc(s.title)}</title>
      <link>${esc(`${origin}/signals#${encodeURIComponent(s.id)}`)}</link>
      <guid isPermaLink="false">${esc(s.id)}</guid>
      <pubDate>${new Date(s.at).toUTCString()}</pubDate>
      <description>${esc(`${s.detail} (${SOURCE_LABEL[s.source]}, ${s.period})${s.evidence ? ` Evidence: ${s.evidence.href}` : ""}`)}</description>
    </item>`).join("");
  } catch {
    /* an empty feed is better than a broken one */
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Arcway: what changed on ${esc(NETWORK_NAME)}</title>
    <link>${esc(`${origin}/digest`)}</link>
    <description>Factual signals from Arc data: activity shifts, new and verified contracts, large USDC transfers, new listings.</description>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } });
}
