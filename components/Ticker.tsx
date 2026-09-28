'use client';

import { useEffect, useRef } from "react";

const fmt = (n: number, compact: boolean) =>
  compact ? new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n) : Math.round(n).toLocaleString("en-US");

/**
 * Counts up to `value` once it scrolls into view (after Magic UI's NumberTicker, CSS-free).
 * The server renders the final number, so it reads correctly without JS or with reduced motion.
 */
export function Ticker({ value, compact = false }: { value: number; compact?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || value <= 0 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        el.textContent = fmt(value * (1 - Math.pow(1 - t, 3)), compact);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      el.textContent = fmt(0, compact);
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); el.textContent = fmt(value, compact); };
  }, [value, compact]);
  return <span ref={ref}>{fmt(value, compact)}</span>;
}
