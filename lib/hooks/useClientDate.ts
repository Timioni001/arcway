'use client';

import { useEffect, useState } from "react";

/**
 * Today's date, but only once the page is running in the browser. Static pages are built once,
 * so anything read from the clock during render would bake in the build day and mismatch on
 * hydration for every later visitor. Server and first render get null; render a neutral placeholder.
 */
export function useClientDate(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}
