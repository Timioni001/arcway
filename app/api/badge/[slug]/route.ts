import { badgeSvg } from "../../../../lib/badge";
import { loadProtocol } from "../../../../lib/server/intel";
import { getApp } from "../../../../lib/registry";

export const dynamic = "force-dynamic";

const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K` : n.toLocaleString("en-US"));

/** "Arcway | Live on Arc" badge for an app's README or site; shows real transaction counts when measurable. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const theme = new URL(req.url).searchParams.get("theme") === "dark" ? "dark" : "light";
  const app = getApp(slug);
  let value = app ? "Listed on Arc" : "Not listed";
  if (app) {
    try {
      const intel = await loadProtocol(slug);
      if (intel?.data.txCount) value = `${compact(intel.data.txCount)} tx on Arc`;
    } catch {
      /* fall back to the listing badge */
    }
  }
  return new Response(badgeSvg({ label: "Arcway", value, theme }), {
    status: app ? 200 : 404,
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600" }
  });
}
