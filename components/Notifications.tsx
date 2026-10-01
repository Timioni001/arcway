'use client';

import { Bell, RadioTower } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { timeAgo } from "../lib/format";
import { useIntel } from "../lib/hooks/useIntel";
import { readJson, writeJson } from "../lib/storage";
import { SignalIcon } from "./Intel";

const SEEN_KEY = "arcway:signals-seen";

/** Bell with the latest signals. Unread means newer than the last time the panel was opened. */
export function Notifications() {
  const signals = useIntel("signals");
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => setSeen(readJson<string | null>(SEEN_KEY, null)), []);
  const items = signals.data?.data.slice(0, 6) ?? [];
  const newest = items[0]?.at ?? null;
  const unread = newest && (!seen || newest > seen) ? items.filter((s) => !seen || s.at > seen).length : 0;

  useEffect(() => {
    if (!open) return;
    if (newest) { writeJson(SEEN_KEY, newest); setSeen(newest); }
    const onDown = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, newest]);

  return (
    <div className="notif" ref={rootRef}>
      <button ref={triggerRef} type="button" className="icon-btn" data-tip="Notifications" aria-label={`Notifications${unread ? `, ${unread} new` : ""}`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <Bell aria-hidden="true" />
        {unread > 0 && <span className="icon-btn__dot" aria-hidden="true" />}
      </button>
      {open && (
        <div className="notif__panel" id={panelId} role="dialog" aria-label="Latest insights">
          <div className="notif__head">
            <span className="h4" style={{ fontSize: 15 }}>Latest insights</span>
            <Link href="/signals" className="link small" onClick={() => setOpen(false)}>View all</Link>
          </div>
          {signals.isPending ? (
            <div style={{ padding: 16 }}><div className="skeleton" style={{ height: 14, width: "70%" }} /><div className="skeleton" style={{ height: 14, width: "50%", marginTop: 10 }} /></div>
          ) : signals.isError ? (
            <p className="small secondary" style={{ padding: 16 }}>Insights are unavailable right now.</p>
          ) : items.length === 0 ? (
            <p className="small secondary" style={{ padding: 16 }}><RadioTower aria-hidden="true" style={{ width: 16, verticalAlign: -3, marginRight: 6 }} />Nothing notable yet. Signals appear when Arc data shows a real change.</p>
          ) : (
            <ul className="notif__list">
              {items.map((s) => (
                <li key={s.id}>
                  <Link href={`/signals#${encodeURIComponent(s.id)}`} className="notif__item" onClick={() => setOpen(false)}>
                    <SignalIcon kind={s.kind} />
                    <span style={{ minWidth: 0 }}>
                      <span className="notif__title">{s.title}</span>
                      <span className="xs secondary mono">{timeAgo(s.at)} · {s.period}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
