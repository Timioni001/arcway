import { NextResponse } from "next/server";
import { apiError, clientIp, parseAddress } from "../../../lib/server/http";
import { fetchActivity } from "../../../lib/server/activity";
import { createRateLimiter } from "../../../lib/server/rateLimit";

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(req: Request) {
  const address = parseAddress(new URL(req.url).searchParams.get("address"));
  if (!address) return apiError(400, "invalid_request", "That doesn't look like a valid wallet address.");

  const rate = limiter(clientIp(req));
  if (!rate.ok) return apiError(429, "rate_limited", "Too many requests. Slow down a little.", rate);

  try {
    return NextResponse.json({ items: (await fetchActivity(address)).slice(0, 20) });
  } catch {
    return apiError(502, "arc_unavailable", "Activity is temporarily unavailable.");
  }
}
