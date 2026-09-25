/**
 * Fixed-window, in-memory limiter. Good enough for a single instance; swap for a
 * shared store (e.g. Postgres/Redis) when running multiple serverless instances.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function check(key: string, now: number = Date.now()) {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      return { ok: true as const };
    }
    if (entry.count >= limit) {
      return { ok: false as const, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count += 1;
    return { ok: true as const };
  };
}
