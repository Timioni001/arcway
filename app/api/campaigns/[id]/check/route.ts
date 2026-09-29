import { NextResponse } from "next/server";
import { getCampaignMeta, phaseOf } from "../../../../../lib/campaigns";
import { apiError, clientIp, parseAddress } from "../../../../../lib/server/http";
import { createRateLimiter } from "../../../../../lib/server/rateLimit";
import { ENTRY_TTL_SECONDS, checkTasks, hasEntered, readCampaign, signEntry } from "../../../../../lib/server/campaigns";

const perIp = createRateLimiter({ limit: 20, windowMs: 60_000 });
const perAddress = createRateLimiter({ limit: 6, windowMs: 60_000 });

/** Check a wallet's tasks for a campaign. When all are done and the campaign is live, return a signed entry. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getCampaignMeta(id);
  const body = (await req.json().catch(() => ({}))) as { address?: unknown };
  const user = parseAddress(body.address);
  if (!meta || !user) return apiError(400, "invalid_request", "Unknown campaign or wallet.");
  for (const rate of [perIp(clientIp(req)), perAddress(user)]) {
    if (!rate.ok) return apiError(429, "rate_limited", `Too many checks. Try again in ${rate.retryAfterSeconds}s.`, rate);
  }

  const state = await readCampaign(meta.id);
  if (!state) return apiError(503, "recording_unavailable", "Campaigns aren't live on this network yet.");
  const now = Math.floor(Date.now() / 1000);
  const phase = phaseOf(state, now);
  const entered = await hasEntered(meta.id, user).catch(() => false);
  let tasks;
  try {
    tasks = await checkTasks(meta, state, user);
  } catch {
    return apiError(502, "arc_unavailable", "We couldn't reach Arc. Try again in a moment.");
  }
  const eligible = tasks.every((t) => t.done);
  if (!eligible || entered || phase !== "live") return NextResponse.json({ tasks, eligible, entered, phase });

  const deadline = Math.min(now + ENTRY_TTL_SECONDS, state.end);
  const signature = await signEntry(meta.id, user, deadline);
  if (!signature) return apiError(503, "recording_unavailable", "Joining opens soon.");
  return NextResponse.json({ tasks, eligible, entered, phase, deadline, signature });
}
