'use client';

import { explorer } from "../lib/config";
import { useJourneyAction } from "../lib/hooks/actions";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { ClaimStatus } from "./QuestList";
import { ExternalLink, Status } from "./Status";

/** The single most useful thing this wallet can do right now. */
export function NextStep() {
  const { step, journey, connection } = useArcwayState();
  const { run, wallet } = useJourneyAction();
  const { stateOf } = useClaims();
  const action = step.action;
  const claim = action?.type === "claim" ? stateOf(action.questId) : undefined;
  const busy =
    step.id === "loading" ||
    (action?.type === "connect" && wallet.connecting) ||
    (action?.type === "switch-network" && wallet.switching) ||
    claim?.phase === "verifying" ||
    claim?.phase === "confirming";

  return (
    <div className="card" style={{ marginTop: 28 }} aria-labelledby="next-step-title" aria-busy={busy}>
      <div className="muted small">
        NEXT STEP{connection.status === "connected" ? ` · ${journey.done}/${journey.total} QUESTS RECORDED` : ""}
      </div>
      <h3 id="next-step-title" style={{ margin: "10px 0 6px" }}>{step.title}</h3>
      <p className="muted" style={{ margin: 0 }}>{step.body}</p>
      {action && (
        <button className="button" style={{ marginTop: 16 }} disabled={busy} aria-busy={busy} onClick={() => run(action)}>
          {busy ? "Working…" : action.label}
        </button>
      )}
      {claim && <ClaimStatus state={claim} />}
      <Status tone="error">{wallet.error}</Status>
      {step.id === "read-error" && (
        <Status>
          You can also check your wallet on <ExternalLink href={explorer.address(connection.address ?? "")}>{explorer.name}</ExternalLink>.
        </Status>
      )}
    </div>
  );
}
