'use client';

import { ArrowRight, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { QUESTS, questProgress, type QuestStatus, type QuestView } from "../lib/quests";
import { TransactionStatus } from "./TransactionStatus";

export const STATUS_TEXT: Record<QuestStatus, string> = {
  completed: "Recorded",
  claimable: "Ready to record",
  todo: "To do",
  locked: "Locked"
};

export function questNumber(id: string) {
  return String(QUESTS.findIndex((q) => q.id === id) + 1).padStart(2, "0");
}

export function QuestBadge({ quest }: { quest: QuestView }) {
  const s = quest.status;
  if (quest.checking) return <span className="badge badge--muted">Checking</span>;
  if (s === "completed") return <span className="badge badge--live"><Check aria-hidden="true" />{STATUS_TEXT[s]}</span>;
  if (s === "locked") return <span className="badge badge--muted"><Lock aria-hidden="true" />{STATUS_TEXT[s]}</span>;
  return <span className={`badge${s === "todo" ? " badge--muted" : ""}`}>{STATUS_TEXT[s]}</span>;
}

export function QuestCard({ quest }: { quest: QuestView }) {
  const { connection, recordingEnabled } = useArcwayState();
  const { claim, stateOf } = useClaims();
  const connected = connection.status === "connected";
  const state = stateOf(quest.id);
  const busy = state.phase === "verifying" || state.phase === "confirming";
  const canRecord = connected && recordingEnabled && quest.status === "claimable" && state.phase !== "recorded";
  const pct = Math.round(questProgress(quest) * 100);

  return (
    <article className="quest-card card" data-status={connected ? quest.status : undefined} aria-labelledby={`q-${quest.id}`}>
      <div className="row between">
        <span className="label">Quest {questNumber(quest.id)}</span>
        {connected ? <QuestBadge quest={quest} /> : <span className="mono xs secondary">{quest.minutes} min</span>}
      </div>
      <div>
        <h3 id={`q-${quest.id}`} className="h4">{quest.title}</h3>
        <p className="small secondary" style={{ marginTop: 6 }}>{quest.description}</p>
      </div>
      <div className="quest-card__reward">
        <span className="quest-card__xp mono">+{quest.xp} XP</span>
        {connected && <span className="mono xs secondary">{pct}%</span>}
      </div>
      {connected && (
        <div className="progress" role="progressbar" aria-label={`${quest.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <i style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="quest-card__foot">
        {state.phase !== "idle" && <div style={{ marginBottom: 12 }}><TransactionStatus state={state} onRetry={() => claim(quest.id)} /></div>}
        {canRecord ? (
          <button className="btn btn--primary btn--block" disabled={busy} aria-busy={busy} onClick={() => claim(quest.id)}>
            {busy ? "Recording…" : `Record +${quest.xp} XP`}
          </button>
        ) : (
          <Link href={`/quests/${quest.id}`} className="app-card__open">
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
    <ul className="cards cards--4">
      {quests.map((q) => <li key={q.id}><QuestCard quest={q} /></li>)}
    </ul>
  );
}
