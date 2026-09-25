'use client';

import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { explorer } from "../lib/config";
import type { ClaimState } from "../lib/hooks/claims";
import { ExternalLink } from "./Status";

const STEPS = ["Verify", "Confirm", "Recorded"] as const;

/**
 * Recording states. "Recorded" only after the receipt confirms; the verifier
 * pays gas, so there's no wallet step. Green only for success, red only for errors.
 */
export function TransactionStatus({ state, onRetry }: { state: ClaimState; onRetry?: () => void }) {
  if (state.phase === "idle") return null;
  const step = state.phase === "verifying" ? 0 : state.phase === "confirming" ? 1 : 3;
  const tone = state.phase === "error" ? "error" : state.phase === "recorded" ? "ok" : "info";
  const txHash = "txHash" in state ? state.txHash : undefined;
  const title = {
    verifying: "Verifying on Arc…",
    confirming: "Confirming on Arc…",
    recorded: "Recorded on your passport",
    error: "Recording failed"
  }[state.phase];

  return (
    <div className="tx" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <div className="tx__head">
        {tone === "error" ? <CircleAlert style={{ color: "var(--error)" }} aria-hidden="true" />
          : tone === "ok" ? <CircleCheck style={{ color: "var(--success)" }} aria-hidden="true" />
          : <LoaderCircle className="spin" style={{ color: "var(--primary)" }} aria-hidden="true" />}
        {title}
      </div>

      {state.phase === "error" ? (
        <p className="small secondary" style={{ marginTop: 6 }}>{state.message}</p>
      ) : (
        <>
          <div className="tx__track" aria-hidden="true">
            {STEPS.map((s, i) => <span key={s} className="tx__seg" data-state={i < step ? "done" : i === step ? "active" : "todo"} />)}
          </div>
          <span className="visually-hidden">Step {Math.min(step + 1, 3)} of 3</span>
        </>
      )}

      <div className="row" style={{ marginTop: 10, gap: 16 }}>
        {state.phase === "error" && state.retryable && onRetry && (
          <button className="btn btn--secondary btn--sm" onClick={onRetry}>Try again</button>
        )}
        {txHash && state.phase !== "error" && <ExternalLink href={explorer.tx(txHash)}>View transaction</ExternalLink>}
        {state.phase === "error" && (state.code || txHash) && (
          <details>
            <summary>Details</summary>
            <div className="mono xs secondary" style={{ marginTop: 6, wordBreak: "break-all" }}>
              {state.code && <div>code: {state.code}</div>}
              {txHash && <div>tx: {txHash}</div>}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
