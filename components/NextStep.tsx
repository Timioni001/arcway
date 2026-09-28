'use client';

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useJourneyAction } from "../lib/hooks/actions";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { Status } from "./Status";
import { TransactionStatus } from "./TransactionStatus";

/** The one thing this wallet should do next. `panel` renders inside the dark network panel. */
export function NextStep({ variant = "card" }: { variant?: "card" | "panel" }) {
  const { step, journey, connection } = useArcwayState();
  const { run, wallet } = useJourneyAction();
  const { stateOf, claim } = useClaims();
  const action = step.action;
  const claimState = action?.type === "claim" ? stateOf(action.questId) : undefined;
  const busy =
    step.id === "loading" ||
    (action?.type === "connect" && wallet.connecting) ||
    (action?.type === "switch-network" && wallet.switching) ||
    claimState?.phase === "verifying" ||
    claimState?.phase === "confirming";
  const onPanel = variant === "panel";

  const body = (
    <>
      <div className="row between">
        <span className="label">Next step</span>
        {connection.status === "connected" && (
          <span className="mono xs" style={{ color: onPanel ? "#A7B8D0" : "var(--text-secondary)" }}>
            {journey.done}/{journey.total}<span className="visually-hidden"> quests recorded</span>
          </span>
        )}
      </div>
      <div className="h4" id={`next-${variant}`} style={{ marginTop: 8 }}>
        {step.id === "loading" ? <span className="skeleton" style={{ display: "block", width: "70%", height: 20 }} aria-label={step.title} /> : step.title}
      </div>
      {action && (
        <button
          className={`btn btn--sm ${onPanel ? "btn--on-dark" : "btn--primary"}`}
          style={{ marginTop: 14 }}
          disabled={busy}
          aria-busy={busy}
          onClick={() => run(action)}
        >
          {busy ? "Working…" : action.label}
          {action.type === "bring-usdc" ? <ArrowUpRight aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        </button>
      )}
      {claimState && claimState.phase !== "idle" && (
        <div style={{ marginTop: 14, color: "var(--text)" }}>
          <TransactionStatus state={claimState} onRetry={action?.type === "claim" ? () => claim(action.questId) : undefined} />
        </div>
      )}
      <Status tone="error">{wallet.error}</Status>
      {wallet.error && !wallet.hasBrowserWallet && <Link href="/wallet" className="btn btn--primary btn--sm" style={{ marginTop: 10 }}>Get a wallet</Link>}
    </>
  );

  return onPanel ? (
    <div className="panel__step" aria-labelledby={`next-${variant}`} aria-busy={busy}>{body}</div>
  ) : (
    <div className="card pad" aria-labelledby={`next-${variant}`} aria-busy={busy}>{body}</div>
  );
}
