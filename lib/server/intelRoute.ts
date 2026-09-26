import { NextResponse } from "next/server";
import { apiError, clientIp } from "./http";
import { IntelUnavailable } from "./intel";
import { createRateLimiter } from "./rateLimit";

const limiter = createRateLimiter({ limit: 120, windowMs: 60_000 });

/**
 * Shared handler for /api/intel/*: rate limit, short CDN caching so the explorer
 * sees at most a few reads per window, and a clean 502 when Arc data is unreachable.
 */
export async function intelResponse(req: Request, load: () => Promise<unknown>, maxAge = 15) {
  const rate = limiter(clientIp(req));
  if (!rate.ok) return apiError(429, "rate_limited", "Too many requests. Slow down a little.", rate);
  try {
    const body = await load();
    if (body === undefined) return apiError(404, "invalid_request", "Not found.");
    return NextResponse.json(body, { headers: { "cache-control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 4}` } });
  } catch (e) {
    const message = e instanceof IntelUnavailable ? e.message : "Arc data is unavailable right now.";
    return apiError(502, "arc_unavailable", message);
  }
}
