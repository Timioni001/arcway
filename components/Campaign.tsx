'use client';

import { ArrowRight, Check, ChevronRight, Lock, Medal as MedalIcon, Timer, Trophy } from "lucide-react";
import Link from "next/link";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { QUEST_TIERS, type QuestTier, type QuestView } from "../lib/quests";
import { STATUS_TEXT } from "./Quests";
import { Medal } from "./Medal";

const CAMPAIGN_NAME: Record<QuestTier, string> = { Beginner: "Arc Starter", Explorer: "Explorer tier", Regular: "Regular tier", Advanced: "Advanced tier" };

/** The tier you're on as one campaign: reward, progress and a checklist you can act on. */
export function Campaign() {
  const { quests: all, connection, recordingEnabled } = useArcwayState();
  const { claim, stateOf } = useClaims();
  const connected = connection.status === "connected";
  const tier: QuestTier = (connected && QUEST_TIERS.find((t) => all.some((q) => q.tier === t && q.status !== "completed"))) || "Beginner";
  const quests = all.filter((q) => q.tier === tier);
  const finale = quests[quests.length - 1];
  const tierXp = quests.reduce((n, q) => n + q.xp, 0);
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
          <h3 className="h2" style={{ marginTop: 16 }}>{CAMPAIGN_NAME[tier]}</h3>
          <p className="secondary" style={{ marginTop: 8 }}>{tier === "Beginner" ? "Your first steps on Arc." : `Tier ${QUEST_TIERS.indexOf(tier) + 1} of ${QUEST_TIERS.length}.`} Finish all {quests.length} to earn the {finale.badge.name} badge.</p>
          <div className="rewards">
            <span><Trophy aria-hidden="true" /><b className="mono">{tierXp}</b> XP</span>
            <span><MedalIcon aria-hidden="true" /><b className="mono">{quests.length}</b> badges</span>
          </div>
          <PassTrack quests={quests} name={CAMPAIGN_NAME[tier]} />
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

/** Season-pass style track: each quest is a tier on one XP line, its badge sitting on the node. */
function PassTrack({ quests, name }: { quests: QuestView[]; name: string }) {
  const { connection } = useArcwayState();
  const connected = connection.status === "connected";
  let running = 0;
  const tiers = quests.map((q) => ({ q, at: (running += q.xp) }));
  const earned = connected ? quests.filter((q) => q.status === "completed").reduce((n, q) => n + q.xp, 0) : 0;
  const pct = Math.min(100, (earned / running) * 100);
  return (
    <div className="ptrack" role="progressbar" aria-label={`${name} progress`} aria-valuemin={0} aria-valuemax={running} aria-valuenow={earned} aria-valuetext={`${earned} of ${running} XP`}>
      <div className="ptrack__rail"><i style={{ width: `${Math.max(pct, 1.5)}%` }} /></div>
      <ol className="ptrack__tiers">
        {tiers.map(({ q, at }, i) => {
          const done = connected && q.status === "completed";
          return (
            <li key={q.id} className="ptrack__tier" data-done={done} style={{ left: `${(at / running) * 100}%` }}>
              <span className="ptrack__medal"><Medal questId={q.id} index={i} earned={done} size="sm" /></span>
              <span className="ptrack__at mono">{at}</span>
            </li>
          );
        })}
      </ol>
      <div className="row between xs secondary ptrack__legend"><span>{earned} XP earned</span><span className="mono">{running} XP</span></div>
    </div>
  );
}
