'use client';

import { useCallback } from "react";
import type { JourneyAction } from "../journey";
import { useClaims } from "./claims";
import { useArcwayState } from "./context";
import { useWallet } from "./useWallet";
import { SECTIONS } from "../sections";

export { SECTIONS };

/** Moves focus as well as scroll so keyboard and screen-reader users land in the right place. */
export function goToSection(id: string, focusSelector?: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  const target = (focusSelector && section.querySelector<HTMLElement>(focusSelector)) || section;
  if (target === section && !section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

export function useJourneyAction() {
  const wallet = useWallet();
  const { claim } = useClaims();
  const { refetchAll } = useArcwayState();

  const run = useCallback(
    (action: JourneyAction) => {
      switch (action.type) {
        case "connect":
          return wallet.connect();
        case "switch-network":
          return wallet.switchToArc();
        case "retry":
          return refetchAll();
        case "bring-usdc":
          return goToSection(SECTIONS.onboard, "a, button");
        case "discover":
          return goToSection(SECTIONS.discover, "input");
        case "claim":
          return claim(action.questId);
        case "view-passport":
          return goToSection(SECTIONS.passport);
      }
    },
    [wallet, claim, refetchAll]
  );

  return { run, wallet };
}
