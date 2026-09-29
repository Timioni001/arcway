import { NextResponse } from "next/server";
import { ZERO_ROOT, getCampaignMeta } from "../../../../../lib/campaigns";
import { apiError, clientIp } from "../../../../../lib/server/http";
import { createRateLimiter } from "../../../../../lib/server/rateLimit";
import { computeResults, publishResults, readCampaign } from "../../../../../lib/server/campaigns";

const perIp = createRateLimiter({ limit: 5, windowMs: 60_000 });
const inFlight = new Map<number, Promise<unknown>>();

/**
 * Publish the results of an ended draw or shared pool. Anyone can trigger it; the outcome is fixed by
 * public data (entries + the seed block), so triggering early or twice changes nothing.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getCampaignMeta(id);
  if (!meta) return apiError(400, "invalid_request", "Unknown campaign.");
  const rate = perIp(clientIp(req));
  if (!rate.ok) return apiError(429, "rate_limited", `Try again in ${rate.retryAfterSeconds}s.`, rate);

  const state = await readCampaign(meta.id);
  if (!state) return apiError(503, "recording_unavailable", "Campaigns aren't live on this network yet.");
  if (state.mode === "first-come") return apiError(400, "invalid_request", "First-come campaigns pay on entry.");
  if (state.resultsRoot !== ZERO_ROOT) return NextResponse.json({ status: "published" });
  if (Date.now() / 1000 < state.end) return NextResponse.json({ status: "not-ended" });
  if (state.entries === 0) return NextResponse.json({ status: "no-entries" });

  if (!inFlight.has(meta.id)) {
    inFlight.set(meta.id, (async () => {
      const results = await computeResults(meta.id, state);
      if (!results) return null;
      return publishResults(meta.id, results);
    })().finally(() => setTimeout(() => inFlight.delete(meta.id), 60_000)));
  }
  try {
    const tx = await inFlight.get(meta.id);
    return NextResponse.json({ status: tx ? "submitted" : "waiting", txHash: tx ?? undefined });
  } catch {
    return apiError(502, "arc_unavailable", "Publishing didn't go through. Try again in a moment.");
  }
}
