'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const AMBIENT = ".fdots, .hero__art, .emap, .pass, .glance, .ppromo__card, .jpath, .rbento, .part";

/**
 * Decorative loops (drifting shapes, floating dots, pulsing map core) only run while on screen.
 * Off-screen they are paused, so scrolling and taps get the whole frame budget.
 */
export function AmbientPause() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) (e.target as HTMLElement).toggleAttribute("data-idle", !e.isIntersecting);
    });
    document.querySelectorAll(AMBIENT).forEach((el) => io.observe(el));
    const onVis = () => document.documentElement.toggleAttribute("data-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [pathname]);
  return null;
}
