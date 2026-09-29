'use client';

import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { useIntel } from "../lib/hooks/useIntel";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { levelFor } from "../lib/levels";
import { getItem, unlockedCount } from "../lib/passportStyle";
import { DIFFICULTY_LABEL, QUESTS } from "../lib/quests";
import { APPS } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { RelativeDate } from "./RelativeDate";
import { SourceTag } from "./IntelBits";

/** Popular right now: quests ranked by how many explorers completed them on Arc (all time). */
export function PopularQuests() {
  const passport = useIntel("passport");
  const counts = new Map((passport.data?.data.byQuest ?? []).map((q) => [q.id, q.count]));
  const ranked = [...QUESTS].filter((q) => q.id !== "arc-explorer").sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)).slice(0, 3);
  return (
    <ul className="qpreview">
      {ranked.map((q) => {
        const n = counts.get(q.id);
        return (
          <li key={q.id}>
            <Link href={`/quests/${q.id}`} className="qcard">
              <span className="qcard__top"><span className="tag">{q.type}</span>{n ? <span className="xs secondary">{n.toLocaleString("en-US")} completed</span> : null}</span>
              <span className="qcard__title">{q.title}</span>
              <span className="qcard__body">{q.description}</span>
              <span className="qcard__facts">
                <span><b className="mono">+{q.xp} XP</b> · {q.badge.name} badge</span>
                <span className="xs secondary">{DIFFICULTY_LABEL[q.difficulty]} · {q.minutes} min</span>
              </span>
              <span className="qcard__cta">Start<ArrowRight aria-hidden="true" /></span>
            </Link>
          </li>
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
