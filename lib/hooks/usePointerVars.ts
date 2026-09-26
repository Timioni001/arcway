'use client';

import { useEffect, type RefObject } from "react";

/**
 * Writes the pointer position over `ref` into CSS variables (--px/--py in -1..1,
 * --mx/--my in %). Used for the hero parallax and the passport tilt.
 * Off for touch devices and reduced motion.
 */
export function usePointerVars(ref: RefObject<HTMLElement | null>, onMove?: (px: number, py: number, el: HTMLElement) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 2 - 1;
        const py = ((e.clientY - r.top) / r.height) * 2 - 1;
        el.style.setProperty("--px", px.toFixed(3));
        el.style.setProperty("--py", py.toFixed(3));
        el.style.setProperty("--mx", `${((px + 1) / 2) * 100}%`);
        el.style.setProperty("--my", `${((py + 1) / 2) * 100}%`);
        onMove?.(px, py, el);
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      onMove?.(0, 0, el);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, onMove]);
}
