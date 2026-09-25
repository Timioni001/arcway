'use client';

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { Hash } from "viem";
import { usePublicClient } from "wagmi";
import { ApiRequestError, apiFetch, type ClaimResponse } from "../api";
import { arcChain } from "../config";
import { humanizeError } from "../errors";

export type ClaimState =
  | { phase: "idle" }
  | { phase: "verifying" }
  | { phase: "confirming"; txHash: string }
  | { phase: "recorded"; txHash?: string }
  | { phase: "error"; message: string; retryable: boolean; code?: string; txHash?: string };

type ClaimsContext = {
  claim: (questId: string) => Promise<void>;
  stateOf: (questId: string) => ClaimState;
  reset: (questId: string) => void;
};

const Ctx = createContext<ClaimsContext | null>(null);
const IDLE: ClaimState = { phase: "idle" };

/**
 * Claim lifecycle: verify on the server → verifier submits → wait for the receipt
 * here → refresh progress. One claim per quest at a time.
 */
export function ClaimsProvider({ address, onRecorded, children }: { address?: string; onRecorded: () => void; children: ReactNode }) {
  const [states, setStates] = useState<Record<string, ClaimState>>({});
  const inFlight = useRef(new Set<string>());
  const client = usePublicClient({ chainId: arcChain.id });
  const queryClient = useQueryClient();

  const set = useCallback((id: string, state: ClaimState) => setStates((s) => ({ ...s, [id]: state })), []);

  const claim = useCallback(
    async (questId: string) => {
      if (!address || inFlight.current.has(questId)) return;
      inFlight.current.add(questId);
      set(questId, { phase: "verifying" });
      let txHash: string | undefined;
      try {
        const res = await apiFetch<ClaimResponse>("/api/quests/claim", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ address, questId })
        });
        if (res.status === "submitted") {
          txHash = res.txHash;
          set(questId, { phase: "confirming", txHash: res.txHash });
          const receipt = await client!.waitForTransactionReceipt({ hash: res.txHash as Hash, timeout: 60_000 });
          if (receipt.status !== "success") {
            throw new ApiRequestError("submit_failed", "Recording was reverted on Arc. Nothing was lost — try again.");
          }
          set(questId, { phase: "recorded", txHash: res.txHash });
        } else {
          set(questId, { phase: "recorded" });
        }
        await queryClient.invalidateQueries({ queryKey: ["arcway"] });
        onRecorded();
      } catch (error) {
        const retryable = !(error instanceof ApiRequestError && error.code === "recording_unavailable");
        set(questId, {
          phase: "error",
          retryable,
          txHash,
          code: error instanceof ApiRequestError ? error.code : error instanceof Error ? error.name : undefined,
          message: error instanceof ApiRequestError ? error.message : humanizeError(error)
        });
      } finally {
        inFlight.current.delete(questId);
      }
    },
    [address, client, onRecorded, queryClient, set]
  );

  const value: ClaimsContext = {
    claim,
    stateOf: (id) => states[id] ?? IDLE,
    reset: (id) => set(id, IDLE)
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClaims() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useClaims must be used inside <ClaimsProvider>");
  return ctx;
}
