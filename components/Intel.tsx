'use client';

import {
  ArrowLeftRight, ArrowUpRight, BadgeCheck, CircleAlert, FileCode2, Layers3, RefreshCw, Rocket, Send, Sparkles, TrendingDown, TrendingUp,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { explorer } from "../lib/config";
import { timeAgo } from "../lib/format";
import {
  type ChartPoint, type EntityRef, type Metric, type PulseEvent, type PulseKind, type Signal, type SignalKind
} from "../lib/intel";
import { getApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { SourceTag } from "./IntelBits";

export { PanelHead, SourceTag } from "./IntelBits";

// ---------------------------------------------------------------- trust + freshness

function useNow(intervalMs = 5_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** "Live · updated 12s ago", with the explorer named as the source. */
export function Freshness({ fetchedAt, fetching, unavailable }: { fetchedAt?: string; fetching?: boolean; unavailable?: string[] }) {
  const now = useNow();
  if (!fetchedAt) return null;
  const seconds = Math.max(0, Math.round((now - Date.parse(fetchedAt)) / 1000));
  return (
    <span className="fresh" role="status">
      <span className="live-dot" data-off={Boolean(unavailable?.length)} aria-hidden="true" />
      <span>{fetching ? "Updating…" : `Updated ${seconds < 5 ? "just now" : seconds < 60 ? `${seconds}s ago` : timeAgo(fetchedAt, now)}`}</span>
      <span className="fresh__src">· {explorer.name}</span>
      {unavailable && unavailable.length > 0 && <span className="fresh__warn">· some sources unavailable</span>}
    </span>
  );
}

/** Loading, error and retry for any intel query. */
export function IntelGate({ query, children, rows = 4, empty }: {
  query: { isPending: boolean; isError: boolean; refetch: () => unknown; isFetching?: boolean };
  children: React.ReactNode;
  rows?: number;
  empty?: boolean;
}) {
  if (query.isPending) {
    return (
      <div className="intel-skel" aria-busy="true" aria-label="Loading Arc data">
        {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton" style={{ height: 16, width: `${88 - (i % 3) * 18}%` }} />)}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="intel-empty" role="alert">
        <CircleAlert aria-hidden="true" />
        <div>
          <div style={{ fontWeight: 600 }}>Arc data is unavailable right now</div>
          <p className="small secondary">We couldn&apos;t reach the explorer. Nothing is shown rather than a guess.</p>
        </div>
        <button className="btn btn--secondary btn--sm" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw aria-hidden="true" />Try again
        </button>
      </div>
    );
  }
  if (empty) return null;
  return <>{children}</>;
}

// ---------------------------------------------------------------- numbers

export function formatMetric(m: Pick<Metric, "value" | "format">): string {
  if (m.value === null) return "—";
  if (m.format === "seconds") return `${m.value < 10 ? m.value.toFixed(2) : Math.round(m.value)}s`;
  if (m.format === "percent") return `${Math.round(m.value * 100)}%`;
  return compact(m.value);
}

export function compact(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return Math.round(n).toLocaleString("en-US");
}

export function usdc(n: number): string {
  if (n >= 1e4) return `${compact(n)} USDC`;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 4 : 2 })} USDC`;
}

export function Delta({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const pct = Math.round(value * 100);
  const Icon = pct >= 0 ? TrendingUp : TrendingDown;
  return (
    <span className="delta" data-dir={pct > 0 ? "up" : pct < 0 ? "down" : "flat"}>
      <Icon aria-hidden="true" />{pct > 0 ? "+" : ""}{pct}%
    </span>
  );
}

export function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="metric">
      <div className="metric__label">{metric.label}</div>
      <div className="metric__value mono">{formatMetric(metric)}</div>
      {metric.hint && <div className="metric__hint">{metric.hint}</div>}
      <SourceTag source={metric.source} period={metric.period} />
    </div>
  );
}

// ---------------------------------------------------------------- charts

/** Daily transactions as an area line. SVG, no library; described for screen readers. */
export function Sparkline({ points, height = 120, label = "Daily transactions" }: { points: ChartPoint[]; height?: number; label?: string }) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const w = 600;
    const max = Math.max(...points.map((p) => p.count), 1);
    const xs = points.map((_, i) => (i / (points.length - 1)) * w);
    const ys = points.map((p) => height - 8 - (p.count / max) * (height - 20));
    const line = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    return { w, xs, ys, line, area: `${line} L${w},${height} L0,${height} Z`, max };
  }, [points, height]);
  if (!geo) return <div className="spark spark--empty small secondary">Not enough history yet.</div>;
  const last = points[points.length - 1];
  const min = Math.min(...points.map((p) => p.count));
  const h = hover ?? points.length - 1;
  return (
    <figure className="spark">
      <svg
        viewBox={`0 0 ${geo.w} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}, ${points[0].date} to ${last.date}. Latest ${last.count.toLocaleString("en-US")}, low ${min.toLocaleString("en-US")}, high ${geo.max.toLocaleString("en-US")}.`}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`sg${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--blue)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--blue)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={geo.area} fill={`url(#sg${gid})`} />
        <path d={geo.line} fill="none" stroke="var(--blue)" strokeWidth="2" vectorEffect="non-scaling-stroke" className="spark__line" />
        <line x1={geo.xs[h]} x2={geo.xs[h]} y1="0" y2={height} stroke="var(--border-strong)" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="spark__dot" style={{ left: `${(geo.xs[h] / geo.w) * 100}%`, top: `${(geo.ys[h] / height) * 100}%` }} aria-hidden="true" />
      <figcaption className="spark__cap mono" aria-hidden="true">
        <span>{new Date(`${points[h].date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</span>
        <strong>{points[h].count.toLocaleString("en-US")} tx</strong>
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------- entities + events

export function Entity({ entity }: { entity: EntityRef }) {
  const app = entity.appSlug ? getApp(entity.appSlug) : undefined;
  if (app) {
    return (
      <Link href={`/apps/${app.slug}`} className="entity">
        <AppMark app={app} size="sm" /><span>{app.name}</span>
      </Link>
    );
  }
  if (entity.address) {
    return (
      <a href={explorer.address(entity.address)} target="_blank" rel="noopener noreferrer" className="entity entity--addr">
        <span className="entity__glyph" aria-hidden="true"><Layers3 /></span>
        <span className={entity.label.startsWith("0x") ? "mono" : undefined}>{entity.label}</span>
        <span className="visually-hidden"> (opens explorer)</span>
      </a>
    );
  }
  return <span className="entity">{entity.label}</span>;
}

const PULSE_ICON: Record<PulseKind, LucideIcon> = { app: Sparkles, deploy: Rocket, usdc: ArrowLeftRight, call: FileCode2, transfer: Send };
export const PULSE_LABEL: Record<PulseKind, string> = { app: "App", deploy: "Deployment", usdc: "USDC", call: "Contract call", transfer: "Transfer" };

export function PulseRow({ e, now }: { e: PulseEvent; now: number }) {
  const Icon = PULSE_ICON[e.kind];
  return (
    <li className="pulse-row" data-kind={e.kind} data-failed={e.failed || undefined}>
      <span className="pulse-row__icon" aria-hidden="true"><Icon /></span>
      <div className="pulse-row__main">
        <div className="pulse-row__title">
          <span className="pulse-row__type">{PULSE_LABEL[e.kind]}</span>
          <span>{e.title}</span>
          {e.failed && <span className="badge badge--warn">Failed</span>}
        </div>
        <div className="pulse-row__meta">
          <Entity entity={e.entity} />
          {e.detail && <span className="mono xs secondary">{e.detail}</span>}
        </div>
      </div>
      <div className="pulse-row__side">
        {e.amountUsdc ? <span className="mono pulse-row__amt">{usdc(e.amountUsdc)}</span> : null}
        <a className="pulse-row__time mono" href={explorer.tx(e.txHash)} target="_blank" rel="noopener noreferrer">
          <time dateTime={e.at}>{timeAgo(e.at, now)}</time><ArrowUpRight aria-hidden="true" />
          <span className="visually-hidden"> view transaction on the explorer</span>
        </a>
      </div>
    </li>
  );
}

export function PulseList({ events, limit }: { events: PulseEvent[]; limit?: number }) {
  const now = useNow(10_000);
  const list = limit ? events.slice(0, limit) : events;
  if (!list.length) return <p className="small secondary intel-note">No recent activity in the latest explorer window.</p>;
  return <ul className="pulse-list">{list.map((e) => <PulseRow key={e.id} e={e} now={now} />)}</ul>;
}

const SIGNAL_ICON: Record<SignalKind, LucideIcon> = {
  "activity-change": TrendingUp,
  "new-contracts": FileCode2,
  "contract-verified": BadgeCheck,
  "large-transfer": ArrowLeftRight,
  "hot-contract": TrendingUp,
  "new-listing": Sparkles
};
export const SIGNAL_LABEL: Record<SignalKind, string> = {
  "activity-change": "Activity change",
  "new-contracts": "New contracts",
  "contract-verified": "Verified contract",
  "large-transfer": "Large transfer",
  "hot-contract": "Most used",
  "new-listing": "New listing"
};

export function SignalIcon({ kind }: { kind: SignalKind }) {
  const Icon = kind === "activity-change" ? TrendingUp : SIGNAL_ICON[kind];
  return <span className="sig-icon" data-kind={kind} aria-hidden="true"><Icon /></span>;
}

export function SignalCard({ s, now }: { s: Signal; now: number }) {
  return (
    <li className="signal" id={s.id}>
      <SignalIcon kind={s.kind} />
      <div className="signal__main">
        <div className="signal__top">
          <span className="signal__type">{SIGNAL_LABEL[s.kind]}</span>
          <time className="mono xs secondary" dateTime={s.at}>{timeAgo(s.at, now)}</time>
        </div>
        <h3 className="signal__title">{s.title}</h3>
        <p className="small secondary">{s.detail}</p>
        <div className="signal__foot">
          <SourceTag source={s.source} period={s.period} />
          {s.entity && <Entity entity={s.entity} />}
          {s.evidence && (
            <a className="link small" href={s.evidence.href} target="_blank" rel="noopener noreferrer">
              {s.evidence.label}<ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens explorer)</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function SignalList({ signals, limit }: { signals: Signal[]; limit?: number }) {
  const now = useNow(30_000);
  const list = limit ? signals.slice(0, limit) : signals;
  if (!list.length) return <p className="small secondary intel-note">Nothing notable right now. Insights appear only when Arc data shows a real change.</p>;
  return <ul className="signal-list">{list.map((s) => <SignalCard key={s.id} s={s} now={now} />)}</ul>;
}
