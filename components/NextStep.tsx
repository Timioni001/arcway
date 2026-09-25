'use client';

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { explorer } from "../lib/config";
import { useJourneyAction } from "../lib/hooks/actions";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { ExternalLink, Status } from "./Status";
import { TransactionStatus } from "./TransactionStatus";

/** The single most useful thing this wallet can do right now (glass: wallet state, §06). */
export function NextStep() {
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
  const connected = connection.status === "connected";
  // Blue is reserved for explicitly onchain actions (§26).
  const onchain = action && ["connect", "switch-network", "claim"].includes(action.type);

  return (
    <div className="next glass" aria-labelledby="next-step-title" aria-busy={busy}>
      <div className="row row--between">
        <span className="label">Your next step</span>
        {connected && (
          <span className="row" style={{ gap: 8 }}>
            <span className="next__progress" aria-hidden="true">
              {Array.from({ length: journey.total }, (_, i) => <i key={i} data-on={i < journey.done} />)}
            </span>
            <span className="mono muted">{journey.done}/{journey.total}</span>
            <span className="visually-hidden">{journey.done} of {journey.total} quests recorded</span>
          </span>
        )}
      </div>
      <h2 id="next-step-title" className="title" style={{ marginTop: 12 }}>
        {step.id === "loading" ? <span className="shimmer" style={{ display: "inline-block", width: 220, height: 20 }} aria-label={step.title} /> : step.title}
      </h2>
      <p className="body-sm muted" style={{ marginTop: 6 }}>{step.body}</p>
      {action && (
        <div className="row" style={{ marginTop: 16 }}>
          <button className={`btn ${onchain ? "btn--blue" : "btn--secondary"}`} disabled={busy} aria-busy={busy} onClick={() => run(action)}>
            {busy ? "Working…" : action.label}
            {action.type === "bring-usdc" ? <ArrowUpRight aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
        </div>
      )}
      {claimState && claimState.phase !== "idle" && (
        <div style={{ marginTop: 16 }}>
          <TransactionStatus state={claimState} onRetry={action?.type === "claim" ? () => claim(action.questId) : undefined} />
        </div>
      )}
      <Status tone="error">{wallet.error}</Status>
      {step.id === "read-error" && connection.address && (
        <Status>
          You can also check your wallet on <ExternalLink href={explorer.address(connection.address)}>{explorer.name}</ExternalLink>
        </Status>
      )}
    </div>
  );
}
