'use client';

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { timeAgo } from "../lib/format";
import { useIntel, useProtocolIntel } from "../lib/hooks/useIntel";
import type { PulseEvent } from "../lib/intel";
import { appContracts, type ArcApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { Ticker } from "./Ticker";
import { Freshness, PulseList, SourceTag, compact } from "./Intel";

/** "Arc right now": plain-language context. Live activity only when the explorer answers. */
export function ArcRightNow({ apps, builders, categories }: { apps: number; builders: number; categories: number }) {
  const q = useIntel("snapshot");
  const tx = q.data?.data.metrics.find((m) => m.id === "tx-day");
  const live = tx && tx.value !== null ? tx : null;
  return (
    <div className="now">
      <div className="now__item">
        <span className="now__value mono"><Ticker value={apps} /></span>
        <span className="now__label">Applications</span>
        <span className="now__hint">Listed on Arcway</span>
      </div>
      <div className="now__item">
        <span className="now__value mono"><Ticker value={builders} /></span>
        <span className="now__label">Builders</span>
        <span className="now__hint">Teams behind them</span>
      </div>
      <div className="now__item">
        <span className="now__value mono"><Ticker value={categories} /></span>
        <span className="now__label">Categories</span>
        <span className="now__hint">From payments to agents</span>
      </div>
      <div className="now__item now__item--live">
        {q.isPending ? (
          <span className="skeleton" style={{ height: 36, width: 110 }} />
        ) : live ? (
          <span className="now__value mono"><Ticker value={live.value!} compact /></span>
        ) : (
          <span className="now__value now__value--soon">Coming soon</span>
        )}
        <span className="now__label"><span className="live-dot" data-off={!live} aria-hidden="true" />Live activity</span>
        <span className="now__hint">{live ? <>Transactions on {live.period.replace(" (UTC day)", "")} <SourceTag source="observed" /></> : "Activity data coming soon"}</span>
      </div>
    </div>
  );
}

/** A friendly activity line for a protocol: measured numbers when published, otherwise "coming soon". */
function AppActivity({ app }: { app: ArcApp }) {
  const measurable = appContracts(app).length > 0;
  const q = useProtocolIntel(app.slug, measurable);
  if (!measurable || q.isError) return <span className="dapp__activity">Activity data coming soon</span>;
  if (q.isPending) return <span className="skeleton" style={{ display: "inline-block", width: 120, height: 12 }} />;
  const p = q.data.data;
  if (p.txCount === null) return <span className="dapp__activity">Activity data coming soon</span>;
  return (
    <span className="dapp__activity dapp__activity--live" title="Transactions to its published contracts, all time. Observed on the Arc explorer.">
      <span className="live-dot" aria-hidden="true" />{compact(p.txCount)} transactions{p.lastActive ? ` · active ${timeAgo(p.lastActive)}` : ""}
    </span>
  );
}

export function DiscoverApps({ apps }: { apps: ArcApp[] }) {
  return (
    <ul className="dapps">
      {apps.map((app) => (
        <li key={app.id}>
          <Link href={`/apps/${app.slug}`} className="dapp">
            <span className="dapp__top">
              <AppMark app={app} />
              <span className="dapp__cat">{app.category}</span>
            </span>
            <span className="dapp__name">{app.name}</span>
            <span className="dapp__desc">{app.tagline}</span>
            <AppActivity app={app} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** What's new, simplified: three changes with a plain definition each, and the latest verified names. */
export function WhatsNew() {
  const q = useIntel("radar");
  const r = q.data?.data;
  const defs: Record<string, string> = {
    tx: "Transactions on Arc in the latest full day, compared with the day before.",
    contracts: "New smart contracts created on Arc.",
    verified: "Contracts whose source code was published and matched on the explorer."
  };
  const rows = r?.changes.day.filter((c) => c.id in defs && c.value !== null) ?? [];
  return (
    <div className="whatsnew">
      <div className="whatsnew__meta"><Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} /></div>
      {q.isPending ? (
        <div className="intel-skel">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 18, width: `${80 - i * 12}%` }} />)}</div>
      ) : !rows.length ? (
        <p className="small secondary">Activity data coming soon. When the explorer reports new contracts and verifications, they appear here.</p>
      ) : (
        <ul className="whatsnew__list">
          {rows.map((c) => (
            <li key={c.id}>
              <span className="whatsnew__value mono">{compact(c.value!)}</span>
              <span className="whatsnew__text">
                <span className="whatsnew__label">{c.label}{c.delta !== undefined && c.delta !== null && <span className="secondary"> · {c.delta > 0 ? "+" : ""}{Math.round(c.delta * 100)}% vs day before</span>}</span>
                <span className="xs secondary">{defs[c.id]}</span>
              </span>
              <SourceTag source={c.source} period={c.period} />
            </li>
          ))}
        </ul>
      )}
      {r && r.verified.length > 0 && (
        <p className="xs secondary whatsnew__verified">
          Recently verified: {r.verified.slice(0, 3).map((c, i) => <span key={c.address}>{i ? ", " : ""}<span className="mono">{c.name ?? `${c.address.slice(0, 8)}…`}</span></span>)}
        </p>
      )}
    </div>
  );
}

const READABLE: Partial<Record<PulseEvent["kind"], true>> = { app: true, deploy: true, usdc: true, transfer: true };

/** Human-readable pulse: successful app use, deployments and USDC movement. Raw calls stay on Pulse. */
export function PulsePreview() {
  const q = useIntel("pulse");
  const events = (q.data?.data ?? []).filter((e) => READABLE[e.kind] && !e.failed);
  return (
    <div className="pulse-preview">
      <div className="whatsnew__meta"><Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} /></div>
      {q.isPending ? (
        <div className="intel-skel">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 18, width: `${86 - i * 10}%` }} />)}</div>
      ) : q.isError || !events.length ? (
        <p className="small secondary">Live activity data coming soon. <Link className="link" href="/pulse">Open Activity</Link></p>
      ) : (
        <PulseList events={events} limit={5} />
      )}
    </div>
  );
}

export function LearnArcLink({ href }: { href: string }) {
  return (
    <a className="btn btn--on-blue" href={href} target="_blank" rel="noopener noreferrer">
      Learn how Arc works <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens Arc docs)</span>
    </a>
  );
}

export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="more-link">{children}<span className="more-link__arrow" aria-hidden="true"><ArrowUpRight /></span></Link>;
}
