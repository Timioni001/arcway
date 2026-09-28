'use client';

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useJourneyAction } from "../lib/hooks/actions";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { Status } from "./Status";
import { TransactionStatus } from "./TransactionStatus";

function Ring({ done, total }: { done: number; total: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={`${done} of ${total} quests done`}>
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle className="track" cx="28" cy="28" r={r} />
        <circle className="value" cx="28" cy="28" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - (total ? done / total : 0))} />
      </svg>
      <span aria-hidden="true">{done}/{total}</span>
    </div>
  );
}

/** Navy bar under the hero: the one thing to do next. */
export function NextStepBar() {
  const { step, journey } = useArcwayState();
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

  return (
    <section className="next-bar" aria-labelledby="next-title" aria-busy={busy}>
      <Ring done={journey.done} total={journey.total} />
      <div style={{ minWidth: 0 }}>
        <div className="label">Your next step</div>
        <h2 id="next-title" className="next-bar__title">
          {step.id === "loading" ? <span className="skeleton" style={{ display: "block", width: 240, maxWidth: "100%", height: 20, background: "rgba(169,223,235,.14)" }} aria-label={step.title} /> : step.title}
        </h2>
        <p className="next-bar__body">{step.body}</p>
        {claimState && claimState.phase !== "idle" && (
          <TransactionStatus state={claimState} onRetry={action?.type === "claim" ? () => claim(action.questId) : undefined} />
        )}
        <Status tone="error">{wallet.error}</Status>
        {wallet.error && !wallet.hasBrowserWallet && <Link href="/wallet" className="btn btn--on-dark btn--sm" style={{ marginTop: 10 }}>Get a wallet</Link>}
      </div>
      {action && (
        <div className="next-bar__side">
          <button className="btn btn--on-dark" disabled={busy} aria-busy={busy} onClick={() => run(action)}>
            {busy ? "Working…" : action.label}
            {action.type === "bring-usdc" ? <ArrowUpRight aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
        </div>
      )}
    </section>
  );
}
