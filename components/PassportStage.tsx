'use client';

import { useEffect, useState } from "react";
import { NETWORK_NAME } from "../lib/config";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useCountUp } from "../lib/hooks/useCountUp";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { levelFor } from "../lib/levels";
import { getItem } from "../lib/passportStyle";
import { visitedApps } from "../lib/visited";
import { AddressAvatar } from "./AddressAvatar";
import { PassCard } from "./PassCard";
import { MyPassportActions } from "./PassportActions";

/** Level as a ring: the arc is progress to the next level, the centre is your XP. */
function LevelRing({ xp }: { xp: number }) {
  const level = levelFor(xp);
  const shown = useCountUp(xp);
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="lring" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="lring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A9DDF4" />
            <stop offset="1" stopColor="#4FB4EA" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={r} className="lring__track" />
        <circle cx="64" cy="64" r={r} className="lring__value" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(level.progress, 0.02))} />
      </svg>
      <span className="lring__centre"><b className="mono">{shown}</b><small>XP</small></span>
    </div>
  );
}

/** The passport's front page: the card on a dark stage, and who it belongs to beside it. */
export function PassportStage() {
  const { xp, quests, connection, txCount } = useArcwayState();
  const { style } = usePassportStyle();
  const connected = connection.status === "connected";
  const address = connected ? connection.address : undefined;
  const myXp = connected ? xp : 0;
  const level = levelFor(myXp);
  const [apps, setApps] = useState(0);
  useEffect(() => setApps(visitedApps().length), []);
  const done = connected ? quests.filter((q) => q.status === "completed").length : 0;
  const title = connected && style.title !== "none" ? getItem("title", style.title)?.name : undefined;
  const stats = [
    { label: "Badges", value: `${done}/${quests.length}` },
    { label: "Apps explored", value: String(apps) },
    { label: "Transactions", value: connected ? String(txCount.data ?? "—") : "0" }
  ];

  return (
    <section className="pstage" aria-labelledby="pstage-title">
      <div className="pstage__card">
        <PassCard />
        <span className="pstage__floor" aria-hidden="true" />
      </div>
      <div className="pstage__id">
        <div className="pstage__kicker">Passport · {NETWORK_NAME}</div>
        <h1 id="pstage-title" className="pstage__title">Your Arc identity</h1>
        <div className="pstage__who">
          <span className="avatar-frame" data-frame={connected ? style.frame : "none"}><AddressAvatar address={address} size="lg" /></span>
          <span className="pstage__name">
            <b>{(connected && style.name) || (address ? shortAddress(address) : "Not connected")}</b>
            <small>{level.name}{title && <> · <span className="pstage__title-chip">{title}</span></>}{connected && style.name && address ? <span className="mono"> · {shortAddress(address)}</span> : null}</small>
          </span>
        </div>
        <div className="pstage__level">
          <LevelRing xp={myXp} />
          <div className="pstage__next">
            <span className="pstage__label">Level</span>
            <b>{level.name}</b>
            <small>{level.next ? `${level.next.min - myXp} XP to ${level.next.name}` : "Top level reached"}</small>
          </div>
        </div>
        <dl className="pstage__stats">
          {stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd className="mono">{s.value}</dd></div>)}
        </dl>
        <div className="pstage__actions"><MyPassportActions /></div>
      </div>
    </section>
  );
}
