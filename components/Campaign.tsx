'use client';

import { ArrowRight, Check, ChevronRight, Lock, Medal as MedalIcon, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { TOTAL_XP } from "../lib/quests";
import { STATUS_TEXT } from "./Quests";

/** The starter quests as one campaign: reward, progress and a checklist you can act on. */
export function Campaign() {
  const { quests, connection, recordingEnabled } = useArcwayState();
  const { claim, stateOf } = useClaims();
  const connected = connection.status === "connected";
  const done = connected ? quests.filter((q) => q.status === "completed").length : 0;
  const pct = Math.round((done / quests.length) * 100);
  const minutes = quests.reduce((m, q) => m + q.minutes, 0);
  const next = quests.find((q) => q.status !== "completed" && q.status !== "locked") ?? quests[0];
  const finished = connected && done === quests.length;

  return (
    <div className="campaign card spotlight">
      <div className="campaign__intro">
        <div className="campaign__intro-body">
          <div className="row" style={{ gap: 8 }}>
            <span className="badge">Campaign</span>
            <span className="xs secondary row" style={{ gap: 4 }}><Timer aria-hidden="true" style={{ width: 14 }} />About {minutes} min</span>
          </div>
          <h3 className="h2" style={{ marginTop: 16 }}>Arc Starter</h3>
          <p className="secondary" style={{ marginTop: 8 }}>Your first steps on Arc. Finish all four to earn the Arc Explorer badge.</p>
          <div className="rewards">
            <span><Trophy aria-hidden="true" /><b className="mono">{TOTAL_XP}</b> XP</span>
            <span><MedalIcon aria-hidden="true" /><b className="mono">{quests.length}</b> badges</span>
          </div>
          <div style={{ marginTop: 24 }}>
            <div className="row between xs secondary"><span>Progress</span><span className="mono">{done}/{quests.length}</span></div>
            <div className="progress progress--lg" style={{ marginTop: 8 }} role="progressbar" aria-label="Campaign progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <i style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>
          <Link href={finished ? "/passport" : `/quests/${next.id}`} className="btn btn--primary" style={{ marginTop: 24 }}>
            {finished ? "View your passport" : done ? "Continue" : "Start campaign"} <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ol className="campaign__list">
        {quests.map((q, i) => {
          const state = connected ? q.status : "todo";
          const cs = stateOf(q.id);
          const busy = cs.phase === "verifying" || cs.phase === "confirming";
          return (
            <li key={q.id} className="campaign__row" data-state={state}>
              <span className="campaign__mark" aria-hidden="true">
                {state === "completed" ? <Check /> : state === "locked" ? <Lock /> : i + 1}
              </span>
              <Link href={`/quests/${q.id}`} className="campaign__text">
                <span className="campaign__title">{q.title}</span>
                <span className="xs secondary">{connected ? STATUS_TEXT[q.status] : q.description}</span>
              </Link>
              {connected && recordingEnabled && q.status === "claimable" && cs.phase !== "recorded" ? (
                <button className="btn btn--primary btn--sm" onClick={() => claim(q.id)} disabled={busy} aria-busy={busy}>
                  {busy ? "Claiming…" : `Claim ${q.xp} XP`}
                </button>
              ) : (
                <span className="campaign__xp mono">+{q.xp}</span>
              )}
              <ChevronRight className="campaign__chev" aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
