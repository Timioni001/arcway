'use client';

import { ArrowRight, Check, Lock } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { useIntel } from "../lib/hooks/useIntel";
import { useStyleProgress } from "../lib/hooks/usePassportStyle";
import { STYLE_ITEMS, isUnlocked, unlockText } from "../lib/passportStyle";
import { QUESTS, TOTAL_XP } from "../lib/quests";
import { Medal } from "./Medal";
import { QUEST_TYPE_LOOK } from "./QuestVisual";
import { Ticker } from "./Ticker";
import { LEVELS } from "../lib/levels";

/** The four kinds of reward as a bento: each one drawn as what it is. Collectibles are not live yet and say so. */
export function RewardKinds() {
  const passport = useIntel("passport");
  const season = passport.data?.data.season.label;
  const [month, year] = (season ?? "").split(" ");
  return (
    <ul className="rbento">
      <li className="rtile rtile--xp">
        <span className="rtile__kicker">XP</span>
        <span className="rtile__big mono"><Ticker value={TOTAL_XP} /><small>XP to earn now</small></span>
        <ol className="rtile__ladder" aria-label="Levels">
          {LEVELS.map((l, i) => (
            <li key={l.name} style={{ "--k": i } as React.CSSProperties}><i aria-hidden="true" /><span>{l.name}</span><small className="mono">{l.min}</small></li>
          ))}
        </ol>
        <Link href="/quests" className="rkind__cta">Earn XP<ArrowRight aria-hidden="true" /></Link>
      </li>
      <li className="rtile rtile--badges">
        <span className="rtile__kicker">Badges</span>
        <span className="rtile__fan" aria-hidden="true">
          {QUESTS.slice(0, 3).map((q, i) => <span key={q.id} style={{ "--f": i - 1 } as React.CSSProperties}><Medal questId={q.id} index={i} earned /></span>)}
        </span>
        <span className="rkind__body">{QUESTS.length} badges, one per quest, recorded on Arc.</span>
        <Link href="/passport#rewards" className="rkind__cta">See badges<ArrowRight aria-hidden="true" /></Link>
      </li>
      <li className="rtile rtile--collect">
        <span className="rtile__kicker">Collectibles <span className="badge badge--muted">Coming soon</span></span>
        <span className="rtile__frame" aria-hidden="true"><Lock /></span>
        <span className="rkind__body">Artwork you keep and show on your passport.</span>
      </li>
      <li className="rtile rtile--season">
        <span className="rtile__kicker">Season rewards</span>
        <span className="rtile__cal" aria-hidden="true"><small>{month ? month.slice(0, 3) : "Month"}</small><b>{year ?? ""}</b></span>
        <span className="rkind__body">A new season every month. Top explorers make the leaderboard.</span>
        <Link href="/leaderboard" className="rkind__cta">This season<ArrowRight aria-hidden="true" /></Link>
      </li>
    </ul>
  );
}

/** A passport visa stamp: an ink ring with lettering around the badge, tilted like it was pressed by hand. */
function Stamp({ id, label, hue, tilt, earned, children }: { id: string; label: string; hue: number; tilt: number; earned: boolean; children: React.ReactNode }) {
  const path = `stamp-${id}`;
  return (
    <span className="stamp" data-earned={earned} style={{ "--sh": hue, "--st": `${tilt}deg` } as React.CSSProperties}>
      <svg viewBox="0 0 120 120" className="stamp__ring" aria-hidden="true">
        <defs><path id={path} d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
        <circle cx="60" cy="60" r="56" className="stamp__outer" />
        <circle cx="60" cy="60" r="34" className="stamp__inner" />
        <text className="stamp__text"><textPath href={`#${path}`} startOffset="0">{`ARCWAY · ${label.toUpperCase()} · ARC · `}</textPath></text>
      </svg>
      <span className="stamp__medal">{children}</span>
    </span>
  );
}

/** Badges as a collection: artwork, name, what it's for, how it was earned, and how many explorers hold it. */
export function BadgeGallery() {
  const { quests, connection } = useArcwayState();
  const passport = useIntel("passport");
  const connected = connection.status === "connected";
  const held = new Map((passport.data?.data.byQuest ?? []).map((q) => [q.id, q.count]));
  return (
    <ul className="bgallery">
      {quests.map((q, i) => {
        const earned = connected && q.status === "completed";
        const count = held.get(q.id);
        return (
          <li key={q.id} className="bgallery__item" data-earned={earned}>
            <Stamp id={q.id} label={q.badge.name} hue={QUEST_TYPE_LOOK[q.type].hue} tilt={[-8, 6, -4, 9][i % 4]} earned={earned}>
              <Medal questId={q.id} index={i} earned={earned} />
            </Stamp>
            <div className="bgallery__text">
              <span className="bgallery__name">{q.badge.name}</span>
              <span className="small secondary">{q.badge.description}</span>
              <span className="xs secondary">How: <Link className="link" href={`/quests/${q.id}`}>{q.title}</Link> quest</span>
              <span className="bgallery__meta">
                {earned ? <span className="badge badge--live"><Check aria-hidden="true" />Earned · on Arc</span> : <span className="badge badge--muted">Not earned yet</span>}
                {count !== undefined && <span className="xs secondary">Held by {count.toLocaleString("en-US")} explorer{count === 1 ? "" : "s"}</span>}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Styles unlocked so far, as achievements; the next ones show exactly what to do. */
export function Achievements() {
  const progress = useStyleProgress();
  const earnable = STYLE_ITEMS.filter((i) => i.unlock);
  const done = earnable.filter((i) => isUnlocked(i, progress));
  const next = earnable.filter((i) => !isUnlocked(i, progress)).slice(0, 3);
  return (
    <div className="achv">
      {done.length === 0 ? <p className="small secondary">No achievements yet. Your first quest unlocks a new card theme and a frame.</p> : (
        <ul className="achv__list">
          {done.map((i) => <li key={`${i.kind}-${i.id}`} className="achv__item"><Check aria-hidden="true" /><span><b>{i.name}</b> <span className="xs secondary">{i.kind} unlocked · {unlockText(i).toLowerCase()}</span></span></li>)}
        </ul>
      )}
      {next.length > 0 && (
        <>
          <div className="pstyle__label" style={{ marginTop: 14 }}>Up next</div>
          <ul className="achv__list">
            {next.map((i) => <li key={`${i.kind}-${i.id}`} className="achv__item achv__item--next"><Lock aria-hidden="true" /><span><b>{i.name}</b> <span className="xs secondary">{i.kind} · {unlockText(i)}</span></span></li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/** Quests this wallet completed, recorded on Arc. */
export function QuestHistory() {
  const { quests, connection } = useArcwayState();
  const done = connection.status === "connected" ? quests.filter((q) => q.status === "completed") : [];
  if (!done.length) return <p className="small secondary">No quests completed yet. <Link className="link" href="/quests">Start one</Link>.</p>;
  return (
    <ul className="achv__list">
      {done.map((q) => <li key={q.id} className="achv__item"><Check aria-hidden="true" /><span><Link href={`/quests/${q.id}`}><b>{q.title}</b></Link> <span className="xs secondary">+{q.xp} XP · {q.badge.name} badge</span></span></li>)}
    </ul>
  );
}
