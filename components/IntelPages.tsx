'use client';

import { ArrowUpRight, BadgeCheck, Pause, Play, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { explorer } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useIntel, useProtocolIntel } from "../lib/hooks/useIntel";
import { ACTIVITY_CHANGE_THRESHOLD, LARGE_TRANSFER_USDC, type PulseKind, type SignalKind } from "../lib/intel";
import { APPS, CATEGORIES, STATUS_LABEL, appContracts, discoverApps, isVerified, type ArcApp, type Category } from "../lib/registry";
import { AppMark, CategoryTile } from "./CategoryIcon";
import { ChangeRows, ContractRow } from "./HomeIntel";
import { Freshness, IntelGate, PULSE_LABEL, PanelHead, PulseList, SIGNAL_LABEL, SignalList, SourceTag, Sparkline, compact } from "./Intel";
import { FollowButton } from "./SaveButton";

// ---------------------------------------------------------------- Pulse

const PULSE_KINDS: PulseKind[] = ["app", "deploy", "usdc", "transfer", "call"];

export function PulseExplorer() {
  const [paused, setPaused] = useState(false);
  const [kind, setKind] = useState<PulseKind | null>(null);
  const q = useIntel("pulse");
  const snap = useIntel("snapshot");
  // Freeze the list while paused so rows don't move under the reader.
  const [frozen, setFrozen] = useState<typeof q.data>(undefined);
  const data = paused ? frozen ?? q.data : q.data;
  const events = data?.data ?? [];
  const counts = useMemo(() => Object.fromEntries(PULSE_KINDS.map((k) => [k, events.filter((e) => e.kind === k).length])), [events]);
  const shown = kind ? events.filter((e) => e.kind === kind) : events;
  const oldest = events.at(-1)?.at;

  return (
    <div className="split split--wide-left">
      <section className="panel" aria-labelledby="feed-title">
        <PanelHead icon={TrendingUp} title="Live feed" id="feed-title">
          <Freshness fetchedAt={data?.fetchedAt} fetching={!paused && q.isFetching && !q.isPending} unavailable={data?.unavailable} />
          <button className="btn btn--secondary btn--sm" aria-pressed={paused} onClick={() => { setFrozen(q.data); setPaused((p) => !p); }}>
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}{paused ? "Resume" : "Pause"}
          </button>
        </PanelHead>
        <div className="filters" role="group" aria-label="Filter activity" style={{ marginBottom: 12 }}>
          <button className="chip" aria-pressed={kind === null} onClick={() => setKind(null)}>All <span className="mono xs">{events.length}</span></button>
          {PULSE_KINDS.map((k) => (
            <button key={k} className="chip" aria-pressed={kind === k} disabled={!counts[k]} onClick={() => setKind(kind === k ? null : k)}>
              {PULSE_LABEL[k]} <span className="mono xs">{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <IntelGate query={q} rows={10}>
          <PulseList events={shown} />
          {oldest && <p className="xs secondary intel-note">Showing the latest {events.length} events from the explorer, back to {timeAgo(oldest)}. Refreshes every 15 seconds.</p>}
        </IntelGate>
      </section>
      <aside className="stack-col">
        <section className="panel" aria-labelledby="daily-title">
          <PanelHead icon={TrendingUp} title="Daily transactions" id="daily-title" />
          <IntelGate query={snap} rows={4}>
            <Sparkline points={snap.data?.data.chart.slice(-30) ?? []} height={140} />
            <SourceTag source="observed" period="Last 30 days (UTC)" />
          </IntelGate>
        </section>
        <section className="panel" aria-labelledby="kinds-title">
          <h2 id="kinds-title" className="panel__title">What the feed shows</h2>
          <dl className="defs">
            <div><dt>App</dt><dd>A transaction to a contract a listed app has published.</dd></div>
            <div><dt>Deployment</dt><dd>A new contract created on Arc.</dd></div>
            <div><dt>USDC</dt><dd>A USDC token transfer, mint or burn.</dd></div>
            <div><dt>Transfer</dt><dd>USDC sent directly between addresses.</dd></div>
            <div><dt>Contract call</dt><dd>A call to a contract not listed on Arcway.</dd></div>
          </dl>
        </section>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- Radar

export function RadarView() {
  const q = useIntel("radar");
  const [period, setPeriod] = useState<"day" | "week">("day");
  const r = q.data?.data;
  return (
    <>
      <section className="panel" aria-labelledby="changed-title">
        <PanelHead icon={Sparkles} title="What changed" id="changed-title">
          <div className="seg" role="group" aria-label="Period">
            <button aria-pressed={period === "day"} onClick={() => setPeriod("day")}>24 hours</button>
            <button aria-pressed={period === "week"} onClick={() => setPeriod("week")}>7 days</button>
          </div>
          <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
        </PanelHead>
        <IntelGate query={q} rows={4}>{r && <ChangeRows changes={period === "day" ? r.changes.day : r.changes.week} />}</IntelGate>
      </section>

      <div className="split">
        <section className="panel" aria-labelledby="verified-title">
          <PanelHead icon={BadgeCheck} title="Newly verified contracts" id="verified-title"><SourceTag source="observed" period="Latest verifications" /></PanelHead>
          <IntelGate query={q} rows={6}>
            {r?.verified.length ? <ul className="crows">{r.verified.map((c) => <ContractRow key={c.address} c={c} show="verified" />)}</ul> : <p className="small secondary intel-note">No verified contracts reported yet.</p>}
          </IntelGate>
        </section>
        <section className="panel" aria-labelledby="hot-title">
          <PanelHead icon={TrendingUp} title="Most used contracts" id="hot-title"><SourceTag source="observed" period="Last 24h" /></PanelHead>
          <IntelGate query={q} rows={6}>
            {r?.hot.length ? (
              <ol className="crows crows--ranked">
                {r.hot.map((c) => (
                  <li key={c.address} className="crow">
                    <span className="crow__main">
                      {c.app ? <Link href={`/apps/${c.app.slug}`} className="crow__name">{c.app.name}</Link> : (
                        <a className="crow__name" href={explorer.address(c.address)} target="_blank" rel="noopener noreferrer">{c.name ?? "Unnamed contract"}<span className="visually-hidden"> (opens explorer)</span></a>
                      )}
                      <span className="mono xs secondary">{c.address.slice(0, 8)}…{c.address.slice(-6)}</span>
                    </span>
                    <span className="crow__side">
                      <span className={`badge${c.app ? " badge--live" : ""}`}>{c.app ? "Listed" : "Not listed"}</span>
                      <span className="mono xs">{c.txCount !== undefined ? `${compact(c.txCount)} tx` : "—"}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : <p className="small secondary intel-note">No contract activity reported for the last day.</p>}
          </IntelGate>
          <p className="xs secondary intel-note">Unlisted contracts with real activity are worth a look. Builders can <Link className="link" href="/builders">get listed</Link>.</p>
        </section>
      </div>

      <section className="panel" aria-labelledby="newapps-title">
        <PanelHead icon={Sparkles} title="New on Arcway" id="newapps-title"><SourceTag source="project" period="Last 14 days" /></PanelHead>
        {r ? (
          r.newApps.length ? (
            <ul className="newapps">
              {r.newApps.map((a) => {
                const app = APPS.find((x) => x.slug === a.slug)!;
                return (
                  <li key={a.slug}>
                    <Link href={`/apps/${a.slug}`} className="newapp">
                      <AppMark app={app} size="sm" />
                      <span><span className="newapp__name">{a.name}</span><span className="xs secondary">{a.category}</span></span>
                      <time className="mono xs secondary" dateTime={a.addedAt}>{new Date(`${a.addedAt}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : <p className="small secondary intel-note">No new listings in the last two weeks.</p>
        ) : <IntelGate query={q} rows={3}>{null}</IntelGate>}
      </section>
    </>
  );
}

// ---------------------------------------------------------------- Signals

const SIGNAL_KINDS: SignalKind[] = ["activity-change", "new-contracts", "contract-verified", "large-transfer", "hot-contract", "new-listing"];

export function SignalsView() {
  const q = useIntel("signals");
  const [kind, setKind] = useState<SignalKind | null>(null);
  const all = q.data?.data ?? [];
  const shown = kind ? all.filter((s) => s.kind === kind) : all;
  return (
    <div className="split split--wide-left">
      <section className="panel" aria-labelledby="sig-title">
        <PanelHead icon={TrendingUp} title="Latest signals" id="sig-title">
          <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
        </PanelHead>
        <div className="filters" role="group" aria-label="Filter signals" style={{ marginBottom: 12 }}>
          <button className="chip" aria-pressed={kind === null} onClick={() => setKind(null)}>All <span className="mono xs">{all.length}</span></button>
          {SIGNAL_KINDS.map((k) => {
            const n = all.filter((s) => s.kind === k).length;
            return <button key={k} className="chip" aria-pressed={kind === k} disabled={!n} onClick={() => setKind(kind === k ? null : k)}>{SIGNAL_LABEL[k]} <span className="mono xs">{n}</span></button>;
          })}
        </div>
        <IntelGate query={q} rows={8}><SignalList signals={shown} /></IntelGate>
      </section>
      <aside className="panel" aria-labelledby="rules-title">
        <h2 id="rules-title" className="panel__title">How signals are made</h2>
        <p className="small secondary" style={{ marginTop: 8 }}>Each signal is a rule applied to Arc data. No predictions, scores or advice.</p>
        <dl className="defs">
          <div><dt>{SIGNAL_LABEL["activity-change"]}</dt><dd>Latest day&apos;s transactions differ from the prior 7-day average by {Math.round(ACTIVITY_CHANGE_THRESHOLD * 100)}% or more.</dd></div>
          <div><dt>{SIGNAL_LABEL["new-contracts"]}</dt><dd>Contracts created on Arc in the last 24 hours.</dd></div>
          <div><dt>{SIGNAL_LABEL["contract-verified"]}</dt><dd>Source code verified on the explorer in the last 7 days.</dd></div>
          <div><dt>{SIGNAL_LABEL["large-transfer"]}</dt><dd>A single USDC transfer of {LARGE_TRANSFER_USDC.toLocaleString("en-US")} or more in the live feed.</dd></div>
          <div><dt>{SIGNAL_LABEL["hot-contract"]}</dt><dd>A listed app&apos;s contract ranks among the most used in the last 24 hours.</dd></div>
          <div><dt>{SIGNAL_LABEL["new-listing"]}</dt><dd>An app added to Arcway in the last 7 days.</dd></div>
        </dl>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------- Ecosystem directory

export function ProtocolActivity({ app }: { app: ArcApp }) {
  const measurable = appContracts(app).length > 0;
  const q = useProtocolIntel(app.slug, measurable);
  if (!measurable) return <span className="xs secondary">Not measurable</span>;
  if (q.isPending) return <span className="skeleton" style={{ display: "inline-block", width: 60, height: 14 }} />;
  if (q.isError || !q.data) return <span className="xs secondary">Unavailable</span>;
  const p = q.data.data;
  return (
    <span className="mono xs" title="Transactions to its published contracts, all time (observed)">
      {p.txCount === null ? "—" : `${compact(p.txCount)} tx`}{p.lastActive ? <span className="secondary"> · {timeAgo(p.lastActive)}</span> : null}
    </span>
  );
}

export function ProtocolDirectory() {
  const initial = useSearchParams().get("category");
  const [category, setCategory] = useState<Category | null>(CATEGORIES.includes(initial as Category) ? (initial as Category) : null);
  const apps = discoverApps(APPS, { category }).filter((a) => !a.sample);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter protocols by category" style={{ marginBottom: 14 }}>
        <button className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}><CategoryTile category={c} size="xs" />{c}</button>
        ))}
      </div>
      {category && <div style={{ margin: "-4px 0 14px" }}><FollowButton kind="category" id={category} name={category} /></div>}
      <div className="ptable" role="table" aria-label="Protocols on Arc">
        <div className="ptable__row ptable__row--head" role="row">
          <span role="columnheader">Protocol</span>
          <span role="columnheader">Category</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Builder</span>
          <span role="columnheader">Contracts</span>
          <span role="columnheader">Observed activity</span>
          <span role="columnheader"><span className="visually-hidden">Follow</span></span>
        </div>
        {apps.map((app) => (
          <div key={app.id} className="ptable__row" role="row">
            <span role="cell" className="ptable__name">
              <Link href={`/apps/${app.slug}`}><AppMark app={app} size="sm" /><span>{app.name}<small>{app.tagline}</small></span></Link>
            </span>
            <span role="cell" className="ptable__cat"><CategoryTile category={app.category} size="xs" />{app.category}</span>
            <span role="cell"><span className={`badge${app.status === "live" ? " badge--live" : ""}`}><span className="dot" />{STATUS_LABEL[app.status]}</span></span>
            <span role="cell" className="small secondary">{app.builder?.name ?? "—"}</span>
            <span role="cell" className="mono xs">{appContracts(app).length || "—"}{isVerified(app) && <BadgeCheck aria-label="Verified" className="ptable__ok" />}</span>
            <span role="cell"><ProtocolActivity app={app} /></span>
            <span role="cell" className="ptable__follow"><FollowButton kind="app" id={app.id} name={app.name} variant="icon" /></span>
          </div>
        ))}
      </div>
      <p className="xs secondary intel-note">
        Activity is measured only for protocols that publish their contracts. <a className="link" href={explorer.home} target="_blank" rel="noopener noreferrer">Source: {explorer.name} <ArrowUpRight aria-hidden="true" style={{ width: 12, display: "inline" }} /></a>
      </p>
    </>
  );
}
