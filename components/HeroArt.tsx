'use client';

import { Sparkles, Target } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { usePointerVars } from "../lib/hooks/usePointerVars";
import { CategoryTile } from "./CategoryIcon";
import { Forms } from "./Forms";

/** Stacked forms with floating chips; layers drift at different depths with the pointer. */
export function HeroArt() {
  const ref = useRef<HTMLDivElement>(null);
  usePointerVars(ref);
  const chip = (depth: number, pos: CSSProperties, delay: string) => ({ ...pos, "--depth": depth, "--delay": delay }) as CSSProperties;

  return (
    <div className="hero__art" ref={ref} aria-hidden="true">
      <Forms />
      <div className="float-chip" style={chip(18, { left: "2%", top: "16%" }, "0s")}>
        <CategoryTile category="Payments" />
        <span>Payments<small>Send USDC in seconds</small></span>
      </div>
      <div className="float-chip" style={chip(28, { right: "0%", top: "40%" }, "-2s")}>
        <span className="tile" data-shade="3"><Target /></span>
        <span>Quests<small>Earn XP as you go</small></span>
      </div>
      <div className="float-chip" style={chip(12, { left: "12%", bottom: "8%" }, "-4s")}>
        <span className="tile" data-shade="1"><Sparkles /></span>
        <span>Passport<small>Your record on Arc</small></span>
      </div>
    </div>
  );
}
