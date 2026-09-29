'use client';

import { useEffect, useState } from "react";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useCountUp } from "../lib/hooks/useCountUp";
import { levelFor } from "../lib/levels";
import { visitedApps } from "../lib/visited";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { getItem } from "../lib/passportStyle";
import { Medal } from "./Medal";
import { AddressAvatar } from "./AddressAvatar";

export function ProfileCard() {
  const { xp, connection, progress } = useArcwayState();
  const shown = useCountUp(xp);
  const level = levelFor(xp);
  const address = connection.address;
  const { style } = usePassportStyle();
  const title = style.title !== "none" ? getItem("title", style.title)?.name : undefined;

  return (
    <section className="card pad-lg" aria-labelledby="profile">
      <h2 id="profile" className="label">Profile</h2>
      <div className="profile" style={{ marginTop: 20 }}>
        <span className="avatar-frame" data-frame={style.frame}><AddressAvatar address={address} size="lg" /></span>
        <div>
          <div className={style.name ? "h4" : "mono h4"}>{style.name || (address ? shortAddress(address) : "Not connected")}</div>
          <div className="small secondary" style={{ marginTop: 2 }}>{level.name}{title && <> · {title}</>}{style.name && address && <span className="mono"> · {shortAddress(address)}</span>}</div>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 28, alignItems: "baseline" }}>
        <span className="mono h2" aria-live="polite">{connection.status === "connected" && progress.isPending ? "—" : shown.toLocaleString("en-US")} XP</span>
        <span className="xs secondary">{level.next ? `${level.next.min - xp} XP to ${level.next.name}` : "Top level"}</span>
      </div>
      <div className="progress" style={{ marginTop: 12 }} role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
        <i style={{ width: `${Math.max(2, level.progress * 100)}%` }} />
      </div>
    </section>
  );
}

export function PassportStats() {
  const { quests, txCount, connection } = useArcwayState();
  const [opened, setOpened] = useState(0);
  useEffect(() => setOpened(visitedApps().length), []);
  const connected = connection.status === "connected";
  const stats = [
    { value: opened, label: "Apps explored" },
    { value: quests.filter((q) => q.status === "completed").length, label: "Quests done" },
    { value: connected ? txCount.data ?? "—" : 0, label: "Transactions" }
  ];
  return (
    <ul className="stats" aria-label="Activity">
      {stats.map((s) => (
        <li key={s.label} className="stat"><b>{s.value}</b><span className="xs secondary">{s.label}</span></li>
      ))}
    </ul>
  );
}

/** One badge per starter quest; earned once it's claimed. */
export function Badges() {
  const { quests, connection } = useArcwayState();
  const connected = connection.status === "connected";
  return (
    <ul className="badges">
      {quests.map((q, i) => {
        const earned = connected && q.status === "completed";
        return (
          <li key={q.id} className="badge-tile spotlight" data-earned={earned}>
            <Medal questId={q.id} index={i} earned={earned} />
            <span className="small" style={{ fontWeight: 600 }}>{q.title}</span>
            <span className="xs secondary">{earned ? "Earned" : `+${q.xp} XP · not earned yet`}</span>
          </li>
        );
      })}
    </ul>
  );
}
