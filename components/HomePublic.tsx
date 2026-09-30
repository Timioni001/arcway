'use client';

import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { useIntel } from "../lib/hooks/useIntel";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { levelFor } from "../lib/levels";
import { getItem, unlockedCount } from "../lib/passportStyle";
import { DIFFICULTY_LABEL, QUESTS } from "../lib/quests";
import { APPS } from "../lib/registry";
import { AddressAvatar } from "./AddressAvatar";
import { AppMark } from "./CategoryIcon";
import { useClientDate } from "../lib/hooks/useClientDate";
import { RelativeDate } from "./RelativeDate";
import { SourceTag } from "./IntelBits";
import { DifficultyPips, QUEST_TYPE_LOOK, QuestTypeMark } from "./QuestVisual";
import { Reveal } from "./Reveal";

/** Popular right now: quests ranked by how many explorers completed them on Arc (all time). Styled as tickets. */
export function PopularQuests() {
  const passport = useIntel("passport");
  const counts = new Map((passport.data?.data.byQuest ?? []).map((q) => [q.id, q.count]));
  const ranked = [...QUESTS].filter((q) => q.id !== "arc-explorer").sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)).slice(0, 3);
  return (
    <ul className="qpreview">
      {ranked.map((q, i) => {
        const n = counts.get(q.id);
        return (
          <Reveal as="li" key={q.id} delay={i * 80}>
            <Link href={`/quests/${q.id}`} className="qcard" style={{ "--qh": QUEST_TYPE_LOOK[q.type].hue } as React.CSSProperties}>
              <span className="qcard__head">
                <QuestTypeMark type={q.type} size="lg" />
                <span className="qcard__type">{q.type}{n ? <small>{n.toLocaleString("en-US")} completed</small> : null}</span>
                <span className="qcard__xp mono">+{q.xp}<small>XP</small></span>
              </span>
              <span className="qcard__tear" aria-hidden="true" />
              <span className="qcard__main">
                <span className="qcard__title">{q.title}</span>
                <span className="qcard__body">{q.description}</span>
                <span className="qcard__facts">
                  <span className="qcard__badge">{q.badge.name} badge</span>
                  <DifficultyPips difficulty={q.difficulty} label={DIFFICULTY_LABEL[q.difficulty]} />
                  <span className="xs secondary">{q.minutes} min</span>
                </span>
                <span className="qcard__cta">Start<ArrowRight aria-hidden="true" /></span>
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

/** What's new, in plain words: apps added to Arcway, and changes Arc data shows. */
export function HomeNews() {
  const radar = useIntel("radar");
  const apps = APPS.filter((a) => a.active && !a.sample).sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 3);
  const day = radar.data?.data.changes.day ?? [];
  const verified = day.find((c) => c.id === "verified" && c.value);
  const tx = day.find((c) => c.id === "tx" && c.delta !== null && c.delta !== undefined && Math.abs(c.delta) >= 0.05);
  return (
    <ul className="news">
      {apps.map((a) => (
        <li key={a.id} className="news__item">
          <AppMark app={a} size="sm" />
          <span className="news__text"><span className="news__kind">New app added</span><Link href={`/apps/${a.slug}`}>{a.name}</Link> <span className="secondary">· {a.category}</span></span>
          <span className="xs secondary"><RelativeDate iso={a.addedAt} /></span>
        </li>
      ))}
      {verified && (
        <li className="news__item">
          <span className="news__icon" aria-hidden="true"><Check /></span>
          <span className="news__text"><span className="news__kind">New contracts verified</span>{verified.value!.toLocaleString("en-US")} contracts published their source code</span>
          <SourceTag source={verified.source} period={verified.period} />
        </li>
      )}
      {tx && (
        <li className="news__item">
          <span className="news__icon" aria-hidden="true"><Sparkles /></span>
          <span className="news__text"><span className="news__kind">Activity {tx.delta! > 0 ? "increased" : "decreased"}</span>Transactions on Arc {tx.delta! > 0 ? "up" : "down"} {Math.abs(Math.round(tx.delta! * 100))}% on the day before</span>
          <SourceTag source={tx.source} period={tx.period} />
        </li>
      )}
    </ul>
  );
}

/** Your passport at a glance, or what it will hold once you start. */
export function HomePassport() {
  const { xp, quests, connection } = useArcwayState();
  const { style, progress } = usePassportStyle();
  const connected = connection.status === "connected";
  const level = levelFor(connected ? xp : 0);
  const done = connected ? quests.filter((q) => q.status === "completed") : [];
  const styles = unlockedCount(progress);
  const rows = [
    { label: "Level", value: connected ? level.name : "Newcomer" },
    { label: "XP", value: connected ? xp.toLocaleString("en-US") : "0" },
    { label: "Badges", value: `${done.length} of ${quests.length}` },
    { label: "Current style", value: connected ? getItem("theme", style.theme)?.name ?? "Arc blue" : "Arc blue" }
  ];
  return (
    <div className="hpass">
      <dl className="hpass__stats">
        {rows.map((r) => <div key={r.label}><dt>{r.label}</dt><dd>{r.value}</dd></div>)}
      </dl>
      <div className="hpass__recent">
        <div className="pstyle__label">Recent achievements</div>
        {done.length ? (
          <ul className="achv__list" style={{ marginTop: 8 }}>
            {done.slice(-3).reverse().map((q) => <li key={q.id} className="achv__item"><Check aria-hidden="true" /><span><b>{q.badge.name}</b> <span className="xs secondary">+{q.xp} XP</span></span></li>)}
          </ul>
        ) : (
          <p className="small secondary" style={{ marginTop: 6 }}>{connected ? "Complete a quest to earn your first badge and unlock a new card theme." : "Connect a wallet to start. Your first quest unlocks a badge, XP and a new card theme."}</p>
        )}
        {connected && <p className="xs secondary" style={{ marginTop: 10 }}>{styles.unlocked} of {styles.total} styles unlocked</p>}
      </div>
    </div>
  );
}

/** Top explorers this season, as a stage: the leader large, the next four as a ranked strip. */
export function HomeLeaderboard() {
  const q = useIntel("passport");
  const { connection } = useArcwayState();
  const now = useClientDate();
  const p = q.data?.data;
  const rows = p?.season.leaderboard ?? [];
  const me = connection.address?.toLowerCase();
  const myRank = me ? rows.findIndex((r) => r.address.toLowerCase() === me) : -1;
  const daysLeft = now ? Math.max(0, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).getTime() - now.getTime()) / 86_400_000 : null;
  const [leader, ...rest] = rows;
  return (
    <div className="hlb">
      <div className="hlb__season">
        <span className="hlb__kicker">Season</span>
        <b>{p?.season.label ?? "This month"}</b>
        <small>{daysLeft === null ? "Resets on the 1st (UTC)" : `${Math.ceil(daysLeft)} day${Math.ceil(daysLeft) === 1 ? "" : "s"} left`}</small>
        <span className="hlb__you">{me ? (myRank >= 0 ? `You are #${myRank + 1}` : "You are not ranked yet") : "Connect to see your rank"}</span>
      </div>
      {q.isPending ? (
        <div className="hlb__board"><div className="skeleton" style={{ height: 120, borderRadius: 20 }} /></div>
      ) : !leader ? (
        <div className="hlb__board hlb__empty">
          <span className="hlb__crown" aria-hidden="true"><Crown /></span>
          <b>The board is open</b>
          <span className="small">No XP recorded this season yet. Claim a quest and take the first spot.</span>
          <Link href="/quests" className="btn btn--primary btn--sm">Start a quest <ArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <div className="hlb__board">
          <Link href={`/passport/${leader.address}`} className="hlb__leader">
            <span className="hlb__crown" aria-hidden="true"><Crown /></span>
            <span className="podium__avatar hlb__avatar"><AddressAvatar address={leader.address} size="lg" /></span>
            <span className="hlb__who"><span className="mono">{leader.address.slice(0, 6)}…{leader.address.slice(-4)}</span><small>{levelFor(leader.xp).name} · {leader.quests} quest{leader.quests === 1 ? "" : "s"}</small></span>
            <span className="hlb__xp mono">{leader.xp}<small>XP</small></span>
          </Link>
          {rest.length > 0 && (
            <ol className="hlb__list" start={2}>
              {rest.slice(0, 4).map((r, i) => (
                <li key={r.address}>
                  <span className="hlb__rank mono" data-rank={i + 2}>{i + 2}</span>
                  <AddressAvatar address={r.address} />
                  <Link href={`/passport/${r.address}`} className="mono small">{r.address.slice(0, 6)}…{r.address.slice(-4)}</Link>
                  <span className="mono small hlb__pts">{r.xp} XP</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
