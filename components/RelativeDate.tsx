'use client';

import { timeAgo } from "../lib/format";
import { useClientDate } from "../lib/hooks/useClientDate";

/**
 * "3d ago" in the browser, the exact date (UTC) before that. Static pages are built once, so a
 * relative time computed at build would freeze and mismatch on hydration.
 */
export function RelativeDate({ iso }: { iso: string }) {
  const now = useClientDate();
  const exact = new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return <time dateTime={iso} title={exact}>{now ? timeAgo(iso, now.getTime()) : exact}</time>;
}
