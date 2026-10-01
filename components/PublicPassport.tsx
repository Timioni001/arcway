'use client';

import { tiersDone } from "../lib/quests";
import { ArrowRight, ExternalLink as ExternalIcon } from "lucide-react";
import Link from "next/link";
import type { Address } from "viem";
import { explorer } from "../lib/config";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { usePassportOf } from "../lib/hooks/usePassportOf";
import { levelFor } from "../lib/levels";
import { Medal } from "./Medal";
import { PassCardView } from "./PassCard";
import { LevelLadder } from "./PassportSection";
import { ShareButtons } from "./ShareButtons";

/** Anyone's passport, read straight from Arc. Nothing here needs a wallet. */
export function PublicPassport({ address }: { address: Address }) {
  const { connection } = useArcwayState();
  const { quests, xp, txCount, loading, progress } = usePassportOf(address);
  const isMine = connection.address?.toLowerCase() === address.toLowerCase();
  const done = quests.filter((q) => q.status === "completed").length;

  return (
    <>
      <div className="row between" style={{ alignItems: "flex-end", gap: 16 }}>
        <div>
          <div className="label" style={{ color: "var(--link)" }}>{isMine ? "Your public passport" : "Passport"}</div>
          <h1 className="h1 mono" style={{ marginTop: 10, fontSize: "clamp(30px, 4vw, 48px)" }}>{shortAddress(address)}</h1>
          <p className="lead" style={{ marginTop: 8 }}>{loading ? "Reading from Arc…" : `${levelFor(xp).name} · ${xp} XP · ${done} of ${quests.length} quests`}</p>
        </div>
        <ShareButtons address={address} xp={xp} />
      </div>

      {progress.isError && (
        <p className="small" role="alert" style={{ marginTop: 16, color: "var(--error)" }}>We couldn&apos;t reach Arc to load this passport. Try again in a moment.</p>
      )}

      <div className="showcase" style={{ marginTop: 32, alignItems: "start" }}>
        <div className="showcase__card"><PassCardView address={address} xp={xp} done={tiersDone(quests)} /></div>
        <div className="showcase__copy showcase__copy--wide">
          <section className="card pad-lg" aria-labelledby="pp-levels">
            <h2 id="pp-levels" className="h4">Level</h2>
            <LevelLadder xp={xp} />
          </section>
          <ul className="stats" aria-label="Activity">
            <li className="stat"><b>{loading ? "—" : done}</b><span className="xs secondary">Quests done</span></li>
            <li className="stat"><b>{txCount.data ?? "—"}</b><span className="xs secondary">Transactions</span></li>
            <li className="stat"><b>{loading ? "—" : xp}</b><span className="xs secondary">XP</span></li>
          </ul>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 56 }} aria-labelledby="pp-badges">
        <h2 id="pp-badges" className="h3" style={{ marginBottom: 20 }}>Badges</h2>
        <ul className="badges">
          {quests.map((q, i) => (
            <li key={q.id} className="badge-tile spotlight" data-earned={q.status === "completed"}>
              <Medal questId={q.id} index={i} earned={q.status === "completed"} />
              <span className="small" style={{ fontWeight: 600 }}>{q.title}</span>
              <span className="xs secondary">{q.status === "completed" ? "Earned" : "Not earned yet"}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="row" style={{ marginTop: 40, gap: 16 }}>
        <a className="link" href={explorer.address(address)} target="_blank" rel="noopener noreferrer">
          View on {explorer.name} <ExternalIcon aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        {!isMine && <Link href="/quests" className="link">Start your own passport <ArrowRight aria-hidden="true" /></Link>}
      </div>
    </>
  );
}
