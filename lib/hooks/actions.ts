'use client';

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { BRIDGE_URL } from "../config";
import type { JourneyAction } from "../journey";
import { SECTIONS } from "../sections";
import { useClaims } from "./claims";
import { useArcwayState } from "./context";
import { useWallet } from "./useWallet";

export { SECTIONS };

/** Moves focus as well as scroll so keyboard and screen-reader users land in the right place. */
export function goToSection(id: string, focusSelector?: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  const target = (focusSelector && section.querySelector<HTMLElement>(focusSelector)) || section;
  if (target === section && !section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  return true;
}

export function useJourneyAction() {
  const wallet = useWallet();
  const router = useRouter();
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
          return void window.open(BRIDGE_URL, "_blank", "noopener,noreferrer");
        case "discover":
          // On the landing page, jump to the section; elsewhere open the Discover page.
          return void (goToSection(SECTIONS.discover, "input") || router.push("/apps"));
        case "claim":
          return claim(action.questId);
        case "view-passport":
          return router.push("/passport");
      }
    },
    [wallet, claim, refetchAll, router]
  );

  return { run, wallet };
}
