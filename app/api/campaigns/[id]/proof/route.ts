import { NextResponse } from "next/server";
import { ZERO_ROOT, getCampaignMeta } from "../../../../../lib/campaigns";
import { apiError, parseAddress } from "../../../../../lib/server/http";
import { computeResults, readCampaign } from "../../../../../lib/server/campaigns";

/** A wallet's result in an ended draw or shared pool: amount and Merkle proof, or not drawn. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getCampaignMeta(id);
  const user = parseAddress(new URL(req.url).searchParams.get("address"));
  if (!meta || !user) return apiError(400, "invalid_request", "Unknown campaign or wallet.");
  const state = await readCampaign(meta.id);
  if (!state) return apiError(503, "recording_unavailable", "Campaigns aren't live on this network yet.");
  if (state.resultsRoot === ZERO_ROOT) return NextResponse.json({ status: "pending" });

  const results = await computeResults(meta.id, state).catch(() => null);
  if (!results) return apiError(502, "arc_unavailable", "We couldn't rebuild the results. Try again in a moment.");
  // Never hand out proofs that don't match what is on chain.
  if (results.root !== state.resultsRoot) return apiError(502, "arc_unavailable", "Results are still settling. Try again in a moment.");
  const mine = results.proofOf(user);
  const seed = { block: results.seed.number.toString(), hash: results.seed.hash };
  if (!mine) return NextResponse.json({ status: "not-won", seed, winners: results.allocations.length });
  return NextResponse.json({ status: "won", amount: mine.amount.toString(), proof: mine.proof, seed, winners: results.allocations.length });
}
