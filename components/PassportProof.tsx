'use client';

import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NETWORK_NAME, explorer } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useIntel } from "../lib/hooks/useIntel";
import { levelFor } from "../lib/levels";
import { AddressAvatar } from "./AddressAvatar";
import { Freshness, SourceTag, compact } from "./Intel";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** "Onchain on Arc": Arcway's own contract and what has been recorded on it. Checkable in seconds. */
export function PassportProof() {
  const q = useIntel("passport");
  const p = q.data?.data;
  if (q.isPending) return <div className="proof"><div className="skeleton" style={{ height: 120 }} /></div>;
  if (!p?.deployed || !p.address) {
    return (
      <div className="proof proof--pending">
        <div>
          <div className="proof__title">Passport contract</div>
          <p className="small secondary">The Arcway Passport contract isn&apos;t configured for {NETWORK_NAME} on this deployment yet.</p>
        </div>
      </div>
    );
  }
  const stat = (value: string, label: string) => (
    <div className="proof__stat">
      <span><b className="mono">{value}</b><span>{label}</span></span>
    </div>
  );
  return (
    <div className="proof">
      <div className="proof__contract">
        <div style={{ minWidth: 0 }}>
          <div className="proof__title">Arcway Passport on {NETWORK_NAME}</div>
          <a className="mono proof__addr" href={explorer.address(p.address)} target="_blank" rel="noopener noreferrer">
            {p.address}<ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens explorer)</span>
          </a>
          <div className="proof__tags">
            {p.verified ? <span className="badge badge--live"><BadgeCheck aria-hidden="true" />Source verified</span> : p.verified === false ? <span className="badge">Source not verified yet</span> : null}
            <SourceTag source="observed" period={p.source === "indexer" ? "Arcway indexer" : "Contract events"} />
            <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
          </div>
        </div>
      </div>
      <div className="proof__stats">
        {stat(compact(p.passports), "passports issued")}
        {stat(compact(p.xp), "XP recorded")}
        {stat(compact(p.completions), "quests completed")}
        {stat(p.transactions === null ? "—" : compact(p.transactions), "transactions")}
      </div>
      {p.truncated && <p className="xs secondary">Counts include the most recent 1,000 events.</p>}
    </div>
  );
}

/** One quiet line for the footer. */
export function FooterProof() {
  const q = useIntel("passport");
  const p = q.data?.data;
  if (!p?.deployed || !p.address) return null;
  return (
    <p className="footer__proof">
      <span className="live-dot" aria-hidden="true" /> Onchain on {NETWORK_NAME}:{" "}
      <a className="mono" href={explorer.address(p.address)} target="_blank" rel="noopener noreferrer">{short(p.address)}</a>
      {" · "}{compact(p.passports)} passports · {compact(p.xp)} XP recorded
    </p>
  );
}

export function LeaderboardView() {
  const q = useIntel("passport");
  const [tab, setTab] = useState<"season" | "all">("season");
  const p = q.data?.data;
  const rows = p ? (tab === "season" ? p.season.leaderboard : p.leaderboard) : [];
  return (
    <section className="panel" aria-labelledby="lb-title">
      <div className="panel__head">
        <h2 id="lb-title" className="panel__title">{tab === "season" ? p?.season.label ?? "This season" : "All time"}</h2>
        <div className="panel__meta">
          <div className="seg" role="group" aria-label="Period">
            <button aria-pressed={tab === "season"} onClick={() => setTab("season")}>This season</button>
            <button aria-pressed={tab === "all"} onClick={() => setTab("all")}>All time</button>
          </div>
          <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
        </div>
      </div>
      {q.isPending ? (
        <div className="intel-skel">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 40 }} />)}</div>
      ) : q.isError ? (
        <p className="small secondary">The leaderboard is unavailable right now.</p>
      ) : !p?.deployed ? (
        <p className="small secondary">The leaderboard starts once the Passport contract is live on {NETWORK_NAME}.</p>
      ) : !rows.length ? (
        <div className="lb-empty">
          <p className="small secondary">No XP recorded {tab === "season" ? "this season" : "yet"}. Be the first explorer on the board.</p>
          <Link href="/quests" className="btn btn--primary btn--sm">Start a quest <ArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <ol className="lb">
          {rows.map((r, i) => (
            <li key={r.address} className="lb__row" data-top={i < 3 || undefined}>
              <span className="lb__rank mono">{i + 1}</span>
              <AddressAvatar address={r.address} />
              <Link href={`/passport/${r.address}`} className="lb__who">
                <span className="mono">{short(r.address)}</span>
                <span className="xs secondary">{levelFor(r.xp).name}{r.lastAt ? ` · active ${timeAgo(r.lastAt)}` : ""}</span>
              </Link>
              <span className="lb__quests xs secondary">{r.quests} quest{r.quests === 1 ? "" : "s"}</span>
              <span className="lb__xp mono">{r.xp} XP</span>
            </li>
          ))}
        </ol>
      )}
      <p className="xs secondary intel-note">Ranked by XP from verified quests, never by wallet balance. Seasons reset on the 1st of each month (UTC); all-time XP stays on your passport.</p>
    </section>
  );
}
