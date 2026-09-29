'use client';

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { useIntel } from "../lib/hooks/useIntel";
import { useStyleProgress } from "../lib/hooks/usePassportStyle";
import { STYLE_ITEMS, isUnlocked, unlockText } from "../lib/passportStyle";
import { QUESTS, TOTAL_XP } from "../lib/quests";
import { Medal } from "./Medal";

/** The four kinds of reward, each with what is true today. Collectibles are not live yet and say so. */
export function RewardKinds() {
  const passport = useIntel("passport");
  const season = passport.data?.data.season.label;
  const kinds = [
    { title: "XP", body: `Every quest adds XP and moves you up a level. ${TOTAL_XP} XP available now.`, href: "/quests", cta: "Earn XP" },
    { title: "Badges", body: `${QUESTS.length} badges, one for each quest, recorded on Arc with your XP.`, href: "/passport#rewards", cta: "See badges" },
    { title: "Collectibles", body: "Artwork you can keep and show on your passport.", soon: true },
    { title: "Season rewards", body: `A new season every month${season ? `, now ${season}` : ""}. Top explorers make the leaderboard.`, href: "/leaderboard", cta: "This season" }
  ];
  return (
    <ul className="rkinds">
      {kinds.map((k) => (
        <li key={k.title} className="rkind">
          <span className="rkind__title">{k.title}{k.soon && <span className="badge badge--muted">Coming soon</span>}</span>
          <span className="rkind__body">{k.body}</span>
          {k.href && <Link href={k.href} className="rkind__cta">{k.cta}<ArrowRight aria-hidden="true" /></Link>}
        </li>
      ))}
    </ul>
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
            <Medal questId={q.id} index={i} earned={earned} />
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
            {next.map((i) => <li key={`${i.kind}-${i.id}`} className="achv__item achv__item--next"><span><b>{i.name}</b> <span className="xs secondary">{i.kind} · {unlockText(i)}</span></span></li>)}
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
