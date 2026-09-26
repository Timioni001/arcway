/** Local calendar day key, e.g. "2026-09-26". */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Consecutive days with at least one transaction, ending today — or yesterday,
 * so a streak isn't "lost" before the user has had a chance to act today.
 */
export function currentStreak(timestamps: string[], now: Date = new Date()): number {
  const days = new Set(timestamps.map((t) => dayKey(new Date(t))));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Activity for the last `n` days, oldest first: one entry per day with a count. */
export function lastDays(timestamps: string[], n = 14, now: Date = new Date()): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const t of timestamps) {
    const k = dayKey(new Date(t));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1 - i));
    const k = dayKey(d);
    return { day: k, count: counts.get(k) ?? 0 };
  });
}
