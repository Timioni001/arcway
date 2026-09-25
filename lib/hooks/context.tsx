'use client';

import { createContext, useContext, type ReactNode } from "react";
import { useArcway, type Arcway } from "./useArcway";
import { ClaimsProvider } from "./claims";

const Ctx = createContext<Arcway | null>(null);

/** Computes wallet/journey state once and shares it with every section. */
export function ArcwayProvider({ children }: { children: ReactNode }) {
  const arcway = useArcway();
  return (
    <Ctx.Provider value={arcway}>
      <ClaimsProvider address={arcway.address} onRecorded={arcway.refetchAll}>
        {children}
      </ClaimsProvider>
    </Ctx.Provider>
  );
}

export function useArcwayState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useArcwayState must be used inside <ArcwayProvider>");
  return ctx;
}
