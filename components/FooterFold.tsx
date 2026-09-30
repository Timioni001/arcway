'use client';

import { useEffect } from "react";

/**
 * On phones the footer's link groups start folded (they repeat the navigation and cost more
 * than a screen of scrolling); on wider screens they stay open. Server markup is open, so the
 * links work without JavaScript.
 */
export function FooterFold() {
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => document.querySelectorAll<HTMLDetailsElement>(".fgroup, .fold-mobile").forEach((d) => { d.open = !mq.matches; });
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return null;
}
