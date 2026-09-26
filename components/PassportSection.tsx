'use client';

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { LEVELS, levelFor } from "../lib/levels";
import { Medal } from "./Medal";
import { PassCard } from "./PassCard";

/** Level ladder: every level with its XP threshold; the current one lit up. Pass `xp` to show someone else's. */
export function LevelLadder({ xp: xpProp }: { xp?: number } = {}) {
  const { xp, connection } = useArcwayState();
  const connected = connection.status === "connected";
  const level = levelFor(xpProp ?? (connected ? xp : 0));
  return (
    <ol className="ladder" aria-label="Levels">
      {LEVELS.map((l, i) => {
        const state = i < level.index ? "done" : i === level.index ? "current" : "next";
        return (
          <li key={l.name} className="ladder__step" data-state={state}>
            <span className="ladder__dot" aria-hidden="true" />
            <span className="ladder__name">{l.name}</span>
            <span className="mono xs secondary">{l.min} XP</span>
            {state === "current" && <span className="visually-hidden"> (your level)</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function PassportSection() {
  const { quests, connection } = useArcwayState();
  const connected = connection.status === "connected";
  return (
    <div className="showcase">
      <div className="showcase__card"><PassCard /></div>
      <div className="showcase__copy">
        <div className="label" style={{ color: "var(--link)", marginBottom: 10 }}>Passport</div>
        <h2 id="passport-title" className="h2">Your record on Arc.</h2>
        <p className="secondary" style={{ marginTop: 12 }}>Level up with XP and collect a badge for every milestone. It&apos;s tied to your wallet, so it&apos;s yours.</p>
        <div className="label" style={{ marginTop: 32 }}>Levels</div>
        <LevelLadder />
        <div className="label" style={{ marginTop: 28 }}>Badges</div>
        <ul className="medal-shelf">
          {quests.map((q, i) => (
            <li key={q.id} title={q.title}>
              <Medal questId={q.id} index={i} earned={connected && q.status === "completed"} size="sm" />
              <span className="visually-hidden">{q.title}: {connected && q.status === "completed" ? "earned" : "not earned yet"}</span>
            </li>
          ))}
        </ul>
        <Link href="/passport" className="btn btn--secondary" style={{ marginTop: 32 }}>Open passport <ArrowRight aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
