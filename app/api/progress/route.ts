import { NextResponse } from "next/server";
import type { ProgressResponse } from "../../../lib/api";
import { PASSPORT_ADDRESS } from "../../../lib/config";
import { verifierClient } from "../../../lib/server/arc";
import { apiError, clientIp, parseAddress } from "../../../lib/server/http";
import { createRateLimiter } from "../../../lib/server/rateLimit";
import { checkAll } from "../../../lib/server/verify";

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(req: Request) {
  const address = parseAddress(new URL(req.url).searchParams.get("address"));
  if (!address) return apiError(400, "invalid_request", "That doesn't look like a valid wallet address.");

  const rate = limiter(clientIp(req));
  if (!rate.ok) return apiError(429, "rate_limited", "Too many requests. Slow down a little.", rate);

  try {
    const { snap, eligibility } = await checkAll(address);
    return NextResponse.json({
      address,
      eligibility,
      completed: [...snap.completed],
      recordingEnabled: Boolean(PASSPORT_ADDRESS && verifierClient())
    } satisfies ProgressResponse);
  } catch {
    return apiError(502, "arc_unavailable", "We couldn't reach Arc to check your progress. Try again shortly.");
  }
}
