'use client';

import { ArrowRight, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { QUESTS, type QuestStatus, type QuestView } from "../lib/quests";
import { TransactionStatus } from "./TransactionStatus";

export const STATUS_TEXT: Record<QuestStatus, string> = {
  completed: "Recorded",
  claimable: "Ready to record",
  todo: "Not started",
  locked: "Locked"
};

export function questNumber(id: string) {
  return String(QUESTS.findIndex((q) => q.id === id) + 1).padStart(2, "0");
}

export function QuestStatusPill({ quest, connected }: { quest: QuestView; connected: boolean }) {
  if (!connected) return null;
  const s = quest.status;
  if (quest.checking) return <span className="pill"><span className="dot" />Checking</span>;
  return (
    <span className={`pill${s === "completed" ? " pill--live" : s === "claimable" ? " pill--verified" : ""}`}>
      {s === "completed" ? <Check aria-hidden="true" /> : s === "locked" ? <Lock aria-hidden="true" /> : <span className="dot" />}
      {STATUS_TEXT[s]}
    </span>
  );
}

/** Mission-style card (§16). */
export function QuestCard({ quest }: { quest: QuestView }) {
  const { connection, recordingEnabled } = useArcwayState();
  const { claim, stateOf } = useClaims();
  const connected = connection.status === "connected";
  const state = stateOf(quest.id);
  const busy = state.phase === "verifying" || state.phase === "confirming";
  const canRecord = connected && recordingEnabled && quest.status === "claimable";

  return (
    <article className="quest-card surface" data-status={connected ? quest.status : undefined} aria-labelledby={`q-${quest.id}`}>
      <div className="row row--between">
        <span className="mono muted">QUEST {questNumber(quest.id)}</span>
        <QuestStatusPill quest={quest} connected={connected} />
      </div>
      <h3 id={`q-${quest.id}`} className="title">{quest.title}</h3>
      <div className="quest-card__xp mono-lg">+{quest.xp} XP</div>
      <div className="quest-meta">
        <div><div className="label">Difficulty</div><div className="body-sm" style={{ marginTop: 4, textTransform: "capitalize" }}>{quest.difficulty}</div></div>
        <div><div className="label">Time</div><div className="body-sm mono" style={{ marginTop: 4 }}>{quest.minutes} min</div></div>
      </div>
      <div className="quest-card__foot stack-3">
        {state.phase !== "idle" && <TransactionStatus state={state} onRetry={() => claim(quest.id)} />}
        {canRecord && state.phase !== "recorded" ? (
          <button className="btn btn--blue btn--block" disabled={busy} aria-busy={busy} onClick={() => claim(quest.id)}>
            {busy ? "Recording…" : `Record +${quest.xp} XP`}
          </button>
        ) : (
          <Link href={`/quests/${quest.id}`} className="btn btn--secondary btn--block">
            {connected && quest.status === "completed" ? "View quest" : "Start quest"} <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  );
}

export function QuestGrid() {
  const { quests } = useArcwayState();
  return (
    <ul className="grid-3" style={{ listStyle: "none", padding: 0, margin: 0, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
      {quests.map((q) => (
        <li key={q.id}><QuestCard quest={q} /></li>
      ))}
    </ul>
  );
}
