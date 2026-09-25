'use client';

import { explorer } from "../lib/config";
import type { ClaimState } from "../lib/hooks/claims";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { getQuest, type QuestView } from "../lib/quests";
import { ExternalLink, Status } from "./Status";

export function QuestList() {
  const { quests, connection, recordingEnabled, reasons, progress } = useArcwayState();
  const connected = connection.status === "connected";

  return (
    <div className="card">
      {!connected && <p className="muted small" style={{ marginTop: 0 }}>Connect a wallet to track your progress.</p>}
      {connected && !recordingEnabled && progress.isSuccess && (
        <p className="muted small" style={{ marginTop: 0 }}>
          Passport recording opens soon. Everything you do on Arc now still counts; you'll be able to record it later.
        </p>
      )}
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {quests.map((quest, i) => (
          <li key={quest.id}>
            {i > 0 && <hr style={{ borderColor: "#252b33", margin: "20px 0" }} />}
            <QuestRow quest={quest} connected={connected} recordingEnabled={recordingEnabled} reason={reasons[quest.id]} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuestRow({ quest, connected, recordingEnabled, reason }: { quest: QuestView; connected: boolean; recordingEnabled: boolean; reason?: string }) {
  const { claim, stateOf } = useClaims();
  const state = stateOf(quest.id);
  const busy = state.phase === "verifying" || state.phase === "confirming";
  const hint = !connected
    ? quest.description
    : quest.status === "completed"
      ? "Recorded on your passport."
      : quest.status === "locked"
        ? `Unlocks after: ${quest.lockedBy.map((id) => getQuest(id)?.title ?? id).join(", ")}.`
        : quest.status === "claimable"
          ? recordingEnabled
            ? "Done! Record it on your passport."
            : "Done! You'll be able to record this when the passport opens."
          : quest.checking
            ? "Checking…"
            : reason ?? quest.howTo;

  return (
    <div>
      <div className="quest">
        <div>
          <b>{quest.title}</b>
          <div className="muted small">{hint}</div>
        </div>
        {connected && quest.status === "claimable" && recordingEnabled ? (
          <button className="button" disabled={busy} aria-busy={busy} onClick={() => claim(quest.id)}>
            {busy ? "Recording…" : `Record +${quest.xp} XP`}
          </button>
        ) : (
          <span aria-label={quest.status === "completed" ? `${quest.xp} XP earned` : `${quest.xp} XP available`}>
            {quest.status === "completed" && connected ? "✓ " : "+"}{quest.xp} XP
          </span>
        )}
      </div>
      <ClaimStatus state={state} />
    </div>
  );
}

export function ClaimStatus({ state }: { state: ClaimState }) {
  switch (state.phase) {
    case "idle":
      return null;
    case "verifying":
      return <Status>Checking your activity on Arc…</Status>;
    case "confirming":
      return (
        <Status>
          Recording on Arc… <ExternalLink href={explorer.tx(state.txHash)}>view transaction</ExternalLink>
        </Status>
      );
    case "recorded":
      return (
        <Status>
          Recorded on your passport.
          {state.txHash && <> <ExternalLink href={explorer.tx(state.txHash)}>View transaction</ExternalLink></>}
        </Status>
      );
    case "error":
      return <Status tone="error">{state.message}</Status>;
  }
}
