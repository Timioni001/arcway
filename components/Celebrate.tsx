'use client';

import { useEffect, useRef } from "react";

export const CELEBRATE_EVENT = "arcway:celebrate";
const COLORS = ["#C9EAF3", "#78C6DE", "#3D91BE", "#2464A5", "#16A34A", "#F5FAFF"];

/** A short burst of confetti when XP is claimed. Skipped entirely with reduced motion. */
export function Celebrate() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const onCelebrate = () => {
      const canvas = ref.current;
      if (!canvas || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.scale(dpr, dpr);
      const parts = Array.from({ length: 140 }, () => ({
        x: innerWidth / 2 + (Math.random() - 0.5) * 120,
        y: innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
      const start = performance.now();
      const frame = (t: number) => {
        const age = t - start;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (const p of parts) {
          p.vy += 0.35;
          p.vx *= 0.99;
          p.x += p.vx;
          p.y += p.vy;
          p.r += p.vr;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - age / 2200);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.fillStyle = p.c;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
        if (age < 2200) requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, innerWidth, innerHeight);
      };
      requestAnimationFrame(frame);
    };
    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    return () => window.removeEventListener(CELEBRATE_EVENT, onCelebrate);
  }, []);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}
