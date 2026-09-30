'use client';

import { ArrowLeftRight, ArrowRight, ArrowUpRight, Bot, Check, PiggyBank, Rocket, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { BRIDGE_URL, IS_MAINNET } from "../lib/config";
import { APPS } from "../lib/registry";
import { trailProgress, type Trail } from "../lib/trails";
import { trailStore } from "../lib/trailStore";
import { AddArcButton } from "./AddArcButton";
import { CELEBRATE_EVENT } from "./Celebrate";
import { AppMark } from "./CategoryIcon";

const ICONS: Record<Trail["icon"], LucideIcon> = { rocket: Rocket, piggy: PiggyBank, swap: ArrowLeftRight, bot: Bot };

export function useTrailSteps() {
  return useSyncExternalStore(trailStore.subscribe, trailStore.get, trailStore.getServer);
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <svg className="mini-ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r={r} className="mini-ring__track" />
      <circle cx="20" cy="20" r={r} className="mini-ring__value" strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} />
    </svg>
  );
}

const TRAIL_HUE: Record<Trail["icon"], number> = { rocket: 214, piggy: 152, swap: 262, bot: 28 };

export function TrailCards({ trails }: { trails: Trail[] }) {
  const done = useTrailSteps();
  return (
    <ul className="trail-cards">
      {trails.map((t, i) => {
        const p = trailProgress(t, done);
        const Icon = ICONS[t.icon];
        return (
          <li key={t.id}>
            <Link href={`/trails/${t.id}`} className="trail-card trail-card--poster" style={{ "--th": TRAIL_HUE[t.icon] } as React.CSSProperties}>
              <span className="trail-card__art" aria-hidden="true">
                <Icon className="trail-card__ghost" />
                <span className="trail-card__badge"><Icon /></span>
                <span className="trail-card__ring">
                  <Ring done={p.done} total={p.total} />
                  <span className="mono xs">{p.complete ? <Check style={{ width: 14 }} /> : `${p.done}/${p.total}`}</span>
                </span>
              </span>
              <span className="trail-card__body">
                <span className="trail-card__eyebrow">Goal · {t.steps.length} steps · {t.minutes} min</span>
                <span className="h4">{t.title}</span>
                <span className="small secondary">{t.goal}</span>
                <span className="trail-card__cta">{p.complete ? "Review" : p.done ? "Continue" : "Start"} <ArrowRight aria-hidden="true" /></span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TrailDetail({ trail }: { trail: Trail }) {
  const done = useTrailSteps();
  const p = trailProgress(trail, done);
  const wasComplete = useRef(p.complete);
  useEffect(() => {
    if (p.complete && !wasComplete.current) window.dispatchEvent(new Event(CELEBRATE_EVENT));
    wasComplete.current = p.complete;
  }, [p.complete]);
  const Icon = ICONS[trail.icon];

  return (
    <>
      <header className="trail-head">
        <span className="tile tile--lg" data-shade="2"><Icon aria-hidden="true" /></span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="label" style={{ color: "var(--link)" }}>Trail · {trail.minutes} min</div>
          <h1 className="h1" style={{ marginTop: 8 }}>{trail.title}</h1>
          <p className="lead" style={{ marginTop: 8 }}>{trail.goal}</p>
        </div>
        <div className="trail-head__progress" aria-live="polite">
          <div className="mono h3">{p.done}/{p.total}</div>
          <div className="xs secondary">{p.complete ? "Trail complete" : "steps done"}</div>
        </div>
      </header>
      <div className="progress progress--lg" style={{ marginTop: 20 }} role="progressbar" aria-label="Trail progress" aria-valuemin={0} aria-valuemax={p.total} aria-valuenow={p.done}>
        <i style={{ width: `${Math.max(2, (p.done / p.total) * 100)}%` }} />
      </div>

      <ol className="trail-steps">
        {trail.steps.map((s, i) => {
          const key = `${trail.id}:${s.id}`;
          const isDone = done.includes(key);
          const app = s.appSlug ? APPS.find((a) => a.slug === s.appSlug) : undefined;
          return (
            <li key={s.id} className="trail-step card" data-done={isDone}>
              <span className="trail-step__num" aria-hidden="true">{isDone ? <Check /> : i + 1}</span>
              <div className="trail-step__body">
                <h2 className="h4">{s.title}</h2>
                <p className="small secondary">{s.body}</p>
                <div className="row" style={{ marginTop: 14, gap: 10 }}>
                  {s.action === "add-arc" && <AddArcButton className="btn btn--primary btn--sm" onAdded={() => trailStore.add(key)} />}
                  {s.action === "get-usdc" && (
                    <a className="btn btn--primary btn--sm" href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">{IS_MAINNET ? "Bring USDC" : "Get free test USDC"} <ArrowUpRight aria-hidden="true" /></a>
                  )}
                  {app && (
                    <Link className="btn btn--primary btn--sm" href={`/apps/${app.slug}`}><AppMark app={app} size="sm" />Open {app.name}</Link>
                  )}
                  {s.href && <Link className="btn btn--primary btn--sm" href={s.href}>Go <ArrowRight aria-hidden="true" /></Link>}
                  <button type="button" className="btn btn--ghost btn--sm" aria-pressed={isDone} onClick={() => trailStore.toggle(key)}>
                    <Check aria-hidden="true" />{isDone ? "Done" : "Mark as done"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="xs secondary" style={{ marginTop: 16 }}>Trail progress is saved in this browser. Quests are checked on Arc and earn XP.</p>
    </>
  );
}
