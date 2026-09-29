'use client';

import { Activity, ArrowRight, ArrowUpRight, BadgeCheck, Gauge, Radar, RadioTower, TrendingUp } from "lucide-react";
import Link from "next/link";
import { explorer } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useIntel, useProtocolIntel } from "../lib/hooks/useIntel";
import type { Change, RadarContract } from "../lib/intel";
import { STATUS_LABEL, type ArcApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { Delta, Entity, Freshness, IntelGate, MetricTile, PanelHead, PulseList, SignalList, SourceTag, compact } from "./Intel";

export function SnapshotGrid() {
  const q = useIntel("snapshot");
  return (
    <>
      <PanelHead icon={Gauge} title="Network snapshot" id="snapshot-title">
        <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
      </PanelHead>
      <IntelGate query={q} rows={3}>
        <div className="metrics">{q.data?.data.metrics.map((m) => <MetricTile key={m.id} metric={m} />)}</div>
      </IntelGate>
    </>
  );
}

export function PulsePanel({ limit = 7 }: { limit?: number }) {
  const q = useIntel("pulse");
  return (
    <>
      <PanelHead icon={Activity} title="Activity" id="pulse-title">
        <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
      </PanelHead>
      <IntelGate query={q} rows={6}>
        <PulseList events={q.data?.data ?? []} limit={limit} />
      </IntelGate>
      <Link href="/pulse" className="link small panel__more">Open live activity <ArrowRight aria-hidden="true" /></Link>
    </>
  );
}

export function ChangeRows({ changes }: { changes: Change[] }) {
  return (
    <ul className="changes">
      {changes.map((c) => (
        <li key={c.id}>
          <span className="changes__label">{c.label}</span>
          <span className="changes__value mono">{c.value === null ? "—" : compact(c.value)}</span>
          <Delta value={c.delta} />
          <SourceTag source={c.source} period={c.period} />
        </li>
      ))}
    </ul>
  );
}

export function ContractRow({ c, show }: { c: RadarContract; show: "verified" | "tx" }) {
  return (
    <li className="crow">
      <span className="crow__main">
        {c.app ? <Entity entity={{ label: c.app.name, appSlug: c.app.slug, address: c.address }} /> : (
          <a className="crow__name" href={explorer.address(c.address)} target="_blank" rel="noopener noreferrer">
            {c.name ?? "Unnamed contract"}<span className="visually-hidden"> (opens explorer)</span>
          </a>
        )}
        <span className="mono xs secondary">{c.address.slice(0, 8)}…{c.address.slice(-6)}</span>
      </span>
      <span className="crow__side mono xs">
        {show === "verified" ? (c.verifiedAt ? <><BadgeCheck aria-hidden="true" />{timeAgo(c.verifiedAt)}</> : "—") : c.txCount !== undefined ? `${compact(c.txCount)} tx` : "—"}
      </span>
    </li>
  );
}

export function RadarPanel() {
  const q = useIntel("radar");
  const r = q.data?.data;
  return (
    <>
      <PanelHead icon={Radar} title="What's New" id="radar-title">
        <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
      </PanelHead>
      <IntelGate query={q} rows={6}>
        {r && (
          <div className="radar-mini">
            <div>
              <h3 className="label">What changed today</h3>
              <ChangeRows changes={r.changes.day} />
            </div>
            <div>
              <h3 className="label">Newly verified</h3>
              {r.verified.length ? <ul className="crows">{r.verified.slice(0, 4).map((c) => <ContractRow key={c.address} c={c} show="verified" />)}</ul> : <p className="small secondary intel-note">No recent verifications.</p>}
            </div>
          </div>
        )}
      </IntelGate>
      <Link href="/radar" className="link small panel__more">See what's new <ArrowRight aria-hidden="true" /></Link>
    </>
  );
}

export function SignalsPanel({ limit = 4 }: { limit?: number }) {
  const q = useIntel("signals");
  return (
    <>
      <PanelHead icon={RadioTower} title="Insights" id="signals-title">
        <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
      </PanelHead>
      <IntelGate query={q} rows={4}>
        <SignalList signals={q.data?.data ?? []} limit={limit} />
      </IntelGate>
      <Link href="/signals" className="link small panel__more">All signals <ArrowRight aria-hidden="true" /></Link>
    </>
  );
}

/** A protocol with its observed activity next to its listing. */
export function FeaturedProtocol({ app }: { app: ArcApp }) {
  const q = useProtocolIntel(app.slug);
  const p = q.data?.data;
  return (
    <article className="fprotocol" aria-labelledby="fp-title">
      <div className="fprotocol__id">
        <AppMark app={app} size="lg" />
        <div style={{ minWidth: 0 }}>
          <div className="label">Featured protocol</div>
          <h3 id="fp-title" className="h3">{app.name}</h3>
          <p className="secondary small">{app.tagline}</p>
          <div className="fprotocol__tags">
            <span className="tag">{app.category}</span>
            <span className="tag">{STATUS_LABEL[app.status]}</span>
            <SourceTag source="project" period="Listing" />
          </div>
        </div>
      </div>
      <div className="fprotocol__data">
        <IntelGate query={q} rows={3}>
          {p && (p.measurable ? (
            <dl className="fprotocol__stats">
              <div><dt>Transactions to its contracts</dt><dd className="mono">{p.txCount === null ? "—" : compact(p.txCount)}</dd><SourceTag source="observed" period="All time" /></div>
              <div><dt>Last active</dt><dd className="mono">{p.lastActive ? timeAgo(p.lastActive) : "—"}</dd><SourceTag source="observed" period="Latest transaction" /></div>
              <div><dt>Verified contracts</dt><dd className="mono">{p.contracts.filter((c) => c.verified).length}/{p.contracts.length}</dd><SourceTag source="observed" period="Explorer" /></div>
            </dl>
          ) : <p className="small secondary">Activity data coming soon.</p>)}
        </IntelGate>
        <div className="row" style={{ gap: 10, marginTop: 16 }}>
          <Link href={`/apps/${app.slug}`} className="btn btn--primary btn--sm">Open protocol <ArrowRight aria-hidden="true" /></Link>
          {p?.contracts[0] && (
            <a className="btn btn--secondary btn--sm" href={explorer.address(p.contracts[0].address)} target="_blank" rel="noopener noreferrer">View contract <ArrowUpRight aria-hidden="true" /></a>
          )}
        </div>
      </div>
    </article>
  );
}

export function TrendingPanel() {
  const q = useIntel("radar");
  return (
    <>
      <PanelHead icon={TrendingUp} title="Most used contracts" id="hot-title">
        <SourceTag source="observed" period="Last 24h" />
      </PanelHead>
      <IntelGate query={q} rows={5}>
        {q.data?.data.hot.length ? <ol className="crows crows--ranked">{q.data.data.hot.slice(0, 8).map((c) => <ContractRow key={c.address} c={c} show="tx" />)}</ol> : <p className="small secondary intel-note">No contract activity reported for the last day.</p>}
      </IntelGate>
    </>
  );
}
