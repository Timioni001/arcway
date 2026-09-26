'use client';

import { Activity, Radar, Send } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { usePointerVars } from "../lib/hooks/usePointerVars";
import { FloatingDots } from "./FloatingDots";
import { Forms } from "./Forms";

/** The Arcway signature on a light field: bright stacked forms, soft bloom, a few drifting dots. */
export function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref);
  const chip = (depth: number, pos: CSSProperties, delay: string) => ({ ...pos, "--depth": depth, "--delay": delay }) as CSSProperties;

  return (
    <div className="hero__art" ref={ref} aria-hidden="true">
      <span className="hero__bloom" />
      <Forms />
      <FloatingDots count={22} seed={11} className="fdots--hero" />
      <div className="float-chip" style={chip(18, { left: "0%", top: "14%" }, "0s")}>
        <span className="tile" data-shade="1"><Send /></span>
        <span>Payments<small>Money that moves in seconds</small></span>
      </div>
      <div className="float-chip" style={chip(28, { right: "0%", top: "44%" }, "-2s")}>
        <span className="tile" data-shade="2"><Activity /></span>
        <span>Live activity<small>What&apos;s happening now</small></span>
      </div>
      <div className="float-chip" style={chip(12, { left: "8%", bottom: "6%" }, "-4s")}>
        <span className="tile" data-shade="3"><Radar /></span>
        <span>What&apos;s new<small>Apps, builders, changes</small></span>
      </div>
    </div>
  );
}
