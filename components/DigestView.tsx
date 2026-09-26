'use client';

import { Check, Link2, Rss, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useIntel } from "../lib/hooks/useIntel";
import { AppMark } from "./CategoryIcon";
import { ChangeRows } from "./HomeIntel";
import { Freshness, IntelGate, PanelHead, SignalList } from "./Intel";
import { APPS } from "../lib/registry";

/** Arc today in one page: what changed, the notable signals, and new listings. Shareable, subscribable. */
export function DigestView() {
  const radar = useIntel("radar");
  const signals = useIntel("signals");
  const [copied, setCopied] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const newApps = radar.data?.data.newApps.slice(0, 6) ?? [];
  return (
    <div className="stack-col" style={{ paddingTop: 24 }}>
      <div className="digest-bar">
        <span className="digest-bar__date">{today} (UTC)</span>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn--secondary btn--sm" onClick={share}>{copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}{copied ? "Link copied" : "Copy link"}</button>
          <a className="btn btn--secondary btn--sm" href="/digest/feed.xml"><Rss aria-hidden="true" />RSS feed</a>
        </div>
      </div>
      <section className="panel" aria-labelledby="dg-changes">
        <PanelHead icon={Sparkles} title="What changed" id="dg-changes"><Freshness fetchedAt={radar.data?.fetchedAt} unavailable={radar.data?.unavailable} /></PanelHead>
        <IntelGate query={radar} rows={4}>{radar.data && <ChangeRows changes={radar.data.data.changes.day} />}</IntelGate>
      </section>
      <section className="panel" aria-labelledby="dg-signals">
        <PanelHead icon={Sparkles} title="Notable signals" id="dg-signals"><Link href="/signals" className="link small">All signals</Link></PanelHead>
        <IntelGate query={signals} rows={5}><SignalList signals={signals.data?.data ?? []} limit={6} /></IntelGate>
      </section>
      {newApps.length > 0 && (
        <section className="panel" aria-labelledby="dg-new">
          <PanelHead icon={Sparkles} title="New on Arcway" id="dg-new" />
          <ul className="newapps">
            {newApps.map((a) => {
              const app = APPS.find((x) => x.slug === a.slug)!;
              return (
                <li key={a.slug}><Link href={`/apps/${a.slug}`} className="newapp"><AppMark app={app} size="sm" /><span><span className="newapp__name">{a.name}</span><span className="xs secondary">{a.category}</span></span></Link></li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
