'use client';

import { ArrowRight, Bookmark, Flame, LayoutGrid, Target, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useBlockNumber } from "wagmi";
import { NETWORK_NAME, arcChain } from "../lib/config";
import { useArcwayState } from "../lib/hooks/context";
import { useActivity } from "../lib/hooks/useActivity";
import { useCountUp } from "../lib/hooks/useCountUp";
import { useWallet } from "../lib/hooks/useWallet";
import { levelFor } from "../lib/levels";
import { APPS, CATEGORIES, newestApps, type Category } from "../lib/registry";
import { currentStreak, lastDays } from "../lib/streak";
import { AppMark, CATEGORY_META, CategoryTile } from "./CategoryIcon";
import { useSavedApps } from "./SaveButton";
import { useClientDate } from "../lib/hooks/useClientDate";
import { RelativeDate } from "./RelativeDate";

function Stat({ icon, label, value, sub, children }: { icon: ReactNode; label: string; value: ReactNode; sub: ReactNode; children?: ReactNode }) {
  return (
    <div className="stat-tile card spotlight">
      <div className="row between">
        <span className="label">{label}</span>
        <span className="stat-tile__icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="stat-tile__value mono">{value}</div>
      <div className="xs secondary">{sub}</div>
      {children}
    </div>
  );
}

export function OverviewStats() {
  const { xp, quests, connection, progress } = useArcwayState();
  const activity = useActivity();
  const connected = connection.status === "connected";
  const level = levelFor(xp);
  const shownXp = useCountUp(connected ? xp : 0);
  const done = quests.filter((q) => q.status === "completed").length;
  const streak = useMemo(() => currentStreak((activity.data?.items ?? []).map((t) => t.timestamp)), [activity.data]);
  const liveApps = APPS.filter((a) => a.active && !a.sample).length;
  const dash = <span className="secondary">—</span>;

  return (
    <div className="stats-row">
      <Stat icon={<Trophy />} label="Your XP" value={connected && !progress.isPending ? shownXp : dash} sub={connected ? `${level.name}${level.next ? ` · ${level.next.min - xp} XP to ${level.next.name}` : ""}` : "Connect to see your XP"}>
        <div className="progress" aria-hidden="true"><i style={{ width: `${connected ? Math.max(3, level.progress * 100) : 0}%` }} /></div>
      </Stat>
      <Stat icon={<Flame />} label="Day streak" value={connected && activity.isSuccess ? streak : dash} sub={connected ? (streak ? "days in a row with activity" : "Make a transaction to start one") : "Days in a row you use Arc"} />
      <Stat icon={<Target />} label="Quests" value={connected ? `${done}/${quests.length}` : dash} sub="Arc Starter campaign">
        <div className="progress" aria-hidden="true"><i style={{ width: `${connected ? (done / quests.length) * 100 : 0}%` }} /></div>
      </Stat>
      <Stat icon={<LayoutGrid />} label="Apps on Arc" value={liveApps} sub={`Across ${CATEGORIES.length} categories`} />
    </div>
  );
}

/** Last 14 days as cells, one hue light→dark by transaction count. */
export function ActivityStrip() {
  const { connection } = useArcwayState();
  const activity = useActivity();
  // Dates only after hydration (see useClientDate); until then the 14 cells render without labels.
  const now = useClientDate();
  const days = useMemo(
    () => (now ? lastDays((activity.data?.items ?? []).map((t) => t.timestamp), 14, now) : Array.from({ length: 14 }, (_, i) => ({ day: `pending-${i}`, count: 0 }))),
    [activity.data, now]
  );
  const connected = connection.status === "connected";
  const step = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3);
  const active = days.filter((d) => d.count > 0).length;
  const fmt = (k: string) => (k.startsWith("pending") ? "…" : new Date(`${k}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }));

  return (
    <section className="card pad" aria-labelledby="strip-title">
      <div className="row between">
        <h2 id="strip-title" className="h4">Last 14 days</h2>
        <span className="xs secondary">{connected ? `${active} active ${active === 1 ? "day" : "days"}` : "Connect to see yours"}</span>
      </div>
      <ol className="strip" aria-label={connected ? `Active on ${active} of the last 14 days` : "No wallet connected"}>
        {days.map((d) => (
          <li key={d.day} className="strip__cell" data-step={connected ? step(d.count) : 0} title={`${fmt(d.day)}: ${d.count} ${d.count === 1 ? "transaction" : "transactions"}`}>
            <span className="visually-hidden">{fmt(d.day)}: {d.count} transactions</span>
          </li>
        ))}
      </ol>
      <div className="row between xs secondary" style={{ marginTop: 10 }}>
        <span>{fmt(days[0].day)}</span>
        <span className="strip__legend" aria-hidden="true">Less <i data-step="0" /><i data-step="1" /><i data-step="2" /><i data-step="3" /> More</span>
        <span>Today</span>
      </div>
    </section>
  );
}

/** Apps per category: horizontal bars, one hue; the row label and icon carry identity. */
export function CategoryBars() {
  const [hover, setHover] = useState<Category | null>(null);
  const rows = useMemo(() => {
    const live = APPS.filter((a) => a.active && !a.sample);
    return CATEGORIES.map((c) => ({ category: c, apps: live.filter((a) => a.category === c) })).sort((a, b) => b.apps.length - a.apps.length);
  }, []);
  const max = Math.max(1, ...rows.map((r) => r.apps.length));

  return (
    <section className="card pad" aria-labelledby="bars-title">
      <div className="row between">
        <h2 id="bars-title" className="h4">Apps by category</h2>
        <Link href="/apps" className="link small">Browse <ArrowRight aria-hidden="true" /></Link>
      </div>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.category}>
            <Link
              href={`/apps?category=${encodeURIComponent(r.category)}`}
              className="bars__row"
              onMouseEnter={() => setHover(r.category)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(r.category)}
              onBlur={() => setHover(null)}
            >
              <CategoryTile category={r.category} size="xs" />
              <span className="bars__label">{r.category}</span>
              <span className="bars__track" aria-hidden="true">
                <i style={{ width: `${(r.apps.length / max) * 100}%` }} />
              </span>
              <span className="bars__value mono">{r.apps.length}</span>
              {hover === r.category && r.apps.length > 0 && (
                <span className="bars__tip" role="tooltip">{r.apps.map((a) => a.name).join(", ")}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NetworkCard() {
  const block = useBlockNumber({ chainId: arcChain.id, watch: true });
  const live = block.data !== undefined && !block.isError;
  const shown = useCountUp(Number(block.data ?? 0), 400);
  return (
    <section className="card pad network-card" aria-labelledby="net-title">
      <div className="row between">
        <h2 id="net-title" className="h4">Network</h2>
        <span className="row xs" style={{ gap: 6, color: live ? "var(--success)" : "var(--text-secondary)" }}>
          <span className="live-dot" data-off={!live} aria-hidden="true" />{live ? "Live" : block.isError ? "Unreachable" : "Connecting…"}
        </span>
      </div>
      <dl className="facts" style={{ marginTop: 14 }}>
        <div><dt>Network</dt><dd>{NETWORK_NAME}</dd></div>
        <div><dt>Blocks so far</dt><dd className="mono">{live ? shown.toLocaleString("en-US") : "—"}</dd></div>
        <div><dt>Fees paid in</dt><dd>USDC</dd></div>
      </dl>
    </section>
  );
}

export function NewApps() {
  const apps = newestApps(APPS, 5);
  return (
    <section className="card pad" aria-labelledby="new-title">
      <div className="row between">
        <h2 id="new-title" className="h4">New on Arc</h2>
        <Link href="/apps" className="link small">All apps <ArrowRight aria-hidden="true" /></Link>
      </div>
      <ul className="new-list">
        {apps.map((a) => (
          <li key={a.id}>
            <Link href={`/apps/${a.slug}`} className="new-list__row">
              <AppMark app={a} size="sm" />
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600 }}>{a.name}</span>
                <span className="xs secondary">{a.category} · added <RelativeDate iso={a.addedAt} /></span>
              </span>
              <span className="cat-dot" style={{ background: CATEGORY_META[a.category].color }} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ConnectBanner() {
  const { connection } = useArcwayState();
  const wallet = useWallet();
  if (connection.status === "connected") return null;
  return (
    <div className="connect-banner">
      <span className="tile" data-shade="2"><Wallet aria-hidden="true" /></span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 600 }}>Connect your wallet to fill this in</div>
        <div className="small secondary">Your XP, streak and activity appear here. Connecting never moves money.</div>
      </div>
      <button className="btn btn--primary" onClick={() => wallet.connect()} disabled={wallet.connecting}>
        {wallet.connecting ? "Confirm in wallet…" : "Connect wallet"}
      </button>
    </div>
  );
}

export function SavedApps() {
  const saved = useSavedApps();
  const apps = saved.map((id) => APPS.find((a) => a.id === id)).filter((a): a is (typeof APPS)[number] => Boolean(a));
  return (
    <section className="card pad" aria-labelledby="saved-title">
      <div className="row between">
        <h2 id="saved-title" className="h4">Followed apps</h2>
        {apps.length > 0 && <span className="mono xs secondary">{apps.length}</span>}
      </div>
      {apps.length === 0 ? (
        <div className="saved-empty">
          <span className="state__icon"><Bookmark aria-hidden="true" /></span>
          <p className="small secondary">Follow any app to keep it here.</p>
          <Link href="/apps" className="link small">Browse apps <ArrowRight aria-hidden="true" /></Link>
        </div>
      ) : (
        <ul className="new-list">
          {apps.map((a) => (
            <li key={a.id}>
              <Link href={`/apps/${a.slug}`} className="new-list__row">
                <AppMark app={a} size="sm" />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600 }}>{a.name}</span>
                  <span className="xs secondary">{a.tagline}</span>
                </span>
                <ArrowRight aria-hidden="true" style={{ width: 16, color: "var(--text-muted)" }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
