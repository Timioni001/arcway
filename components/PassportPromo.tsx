'use client';

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useArcwayState } from "../lib/hooks/context";
import { LEVELS } from "../lib/levels";
import { QUESTS, TOTAL_XP } from "../lib/quests";
import { FloatingDots } from "./FloatingDots";
import { Medal } from "./Medal";
import { PassCard } from "./PassCard";
import { Ticker } from "./Ticker";
import { LevelLadder } from "./PassportSection";

/** Front-page invitation to the Arc Passport: the card, what XP is for, and the badges to collect. */
export function PassportPromo() {
  const { quests, connection, xp } = useArcwayState();
  const connected = connection.status === "connected";
  return (
    <div className="ppromo">
      <div className="ppromo__card">
        <FloatingDots count={14} seed={29} />
        <PassCard />
      </div>
      <div className="ppromo__copy">
        <div className="ohead__kicker">Arc Passport</div>
        <h2 id="passport-title" className="ohead__title">Your record on Arc, in one card.</h2>
        <p className="ohead__lede">Every quest you complete adds XP and a badge. Your level travels with your wallet, and anyone can view it.</p>
        <ul className="ppromo__stats">
          <li><span><b className="mono"><Ticker value={QUESTS.length} /></b> starter quests</span></li>
          <li><span><b className="mono"><Ticker value={TOTAL_XP} /></b> XP to earn</span></li>
          <li><span><b className="mono"><Ticker value={LEVELS.length} /></b> levels</span></li>
        </ul>
        <LevelLadder />
        <ul className="medal-shelf ppromo__badges" aria-label="Badges">
          {quests.map((q, i) => (
            <li key={q.id} title={q.title}>
              <Medal questId={q.id} index={i} earned={connected && q.status === "completed"} size="sm" />
              <span className="visually-hidden">{q.title}: {connected && q.status === "completed" ? "earned" : "not earned yet"}</span>
            </li>
          ))}
        </ul>
        <div className="row" style={{ gap: 10, marginTop: 22 }}>
          <Link href="/passport" className="btn btn--primary">{connected && xp > 0 ? "Open your passport" : "See your passport"} <ArrowRight aria-hidden="true" /></Link>
          <Link href="/quests" className="btn btn--secondary">Start a quest</Link>
        </div>
      </div>
    </div>
  );
}
