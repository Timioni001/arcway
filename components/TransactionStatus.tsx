'use client';

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { explorer } from "../lib/config";
import type { ClaimState } from "../lib/hooks/claims";
import { ExternalLink } from "./Status";

const STEPS = ["Verify", "Confirm on Arc", "Recorded"] as const;

/**
 * Onchain action states (§28). Success is only shown after the receipt confirms.
 * The verifier pays gas, so there is no "waiting for wallet" step for claims.
 */
export function TransactionStatus({ state, onRetry }: { state: ClaimState; onRetry?: () => void }) {
  if (state.phase === "idle") return null;

  const activeIndex = state.phase === "verifying" ? 0 : state.phase === "confirming" ? 1 : state.phase === "recorded" ? 3 : -1;
  const tone = state.phase === "error" ? "error" : state.phase === "recorded" ? "ok" : "info";
  const txHash = "txHash" in state ? state.txHash : undefined;

  const copy = {
    verifying: { title: "Verifying your activity", body: "Checking Arc for the action this quest needs." },
    confirming: { title: "Confirming on Arc", body: "Your passport update has been submitted. Waiting for network confirmation." },
    recorded: { title: "Recorded on your passport", body: "Confirmed on Arc." },
    error: { title: "Recording failed", body: state.phase === "error" ? state.message : "" }
  }[state.phase];

  return (
    <div className="tx" data-tone={tone} role={tone === "error" ? "alert" : "status"} aria-live="polite">
      <div className="row" style={{ gap: 10 }}>
        {tone === "error" ? (
          <CircleAlert aria-hidden="true" style={{ width: 18, color: "var(--aw-danger)" }} />
        ) : tone === "ok" ? (
          <Check aria-hidden="true" style={{ width: 18, color: "var(--aw-ok)" }} />
        ) : (
          <LoaderCircle aria-hidden="true" className="spin" style={{ width: 18, color: "var(--aw-sky)" }} />
        )}
        <span style={{ fontWeight: 600 }}>{copy.title}</span>
      </div>

      {state.phase !== "error" && (
        <>
          <div className="tx__track" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className="tx__seg" data-state={i < activeIndex || activeIndex === 3 ? "done" : i === activeIndex ? "active" : "todo"} />
            ))}
          </div>
          <div className="tx__steps mono muted">
            {STEPS.map((s, i) => (
              <span key={s} data-state={i <= activeIndex || activeIndex === 3 ? "on" : "todo"}>{s}</span>
            ))}
          </div>
        </>
      )}

      <p className="body-sm muted" style={{ marginTop: 12 }}>{copy.body}</p>

      <div className="row" style={{ marginTop: 12 }}>
        {state.phase === "error" && state.retryable && onRetry && (
          <button className="btn btn--secondary btn--sm" onClick={onRetry}>Try again</button>
        )}
        {txHash && state.phase !== "error" && <ExternalLink href={explorer.tx(txHash)}>View transaction</ExternalLink>}
      </div>

      {state.phase === "error" && (state.code || txHash) && (
        <details style={{ marginTop: 12 }}>
          <summary>View details</summary>
          <div className="mono muted" style={{ marginTop: 8, wordBreak: "break-all" }}>
            {state.code && <div>code: {state.code}</div>}
            {txHash && <div>tx: <a className="link" href={explorer.tx(txHash)} target="_blank" rel="noopener noreferrer">{txHash}</a></div>}
          </div>
        </details>
      )}
    </div>
  );
}
