'use client';

import { Activity, ArrowUpRight, BadgeCheck, FileCode2, Minus } from "lucide-react";
import { explorer, NETWORK_NAME, SUBMIT_APP_URL } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useProtocolIntel } from "../lib/hooks/useIntel";
import { Freshness, IntelGate, PanelHead, PulseList, SourceTag, compact } from "./Intel";

/** Observed activity for one protocol: totals, each published contract, and its latest transactions. */
export function ProtocolIntelView({ slug, measurable }: { slug: string; measurable: boolean }) {
  const q = useProtocolIntel(slug, measurable);
  const p = q.data?.data;

  if (!measurable) {
    return (
      <section className="panel" aria-labelledby="activity-title">
        <PanelHead icon={Activity} title="Onchain activity" id="activity-title" />
        <div className="intel-empty" style={{ borderStyle: "solid" }}>
          <FileCode2 aria-hidden="true" style={{ color: "var(--text-muted)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>Activity data coming soon</div>
            <p className="small secondary">Onchain activity appears here once the team publishes its contract addresses for {NETWORK_NAME}. Nothing is estimated in the meantime.</p>
          </div>
          <a className="btn btn--secondary btn--sm" href={SUBMIT_APP_URL} target="_blank" rel="noopener noreferrer">Submit contracts <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel" aria-labelledby="activity-title">
        <PanelHead icon={Activity} title="Onchain activity" id="activity-title">
          <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
        </PanelHead>
        <IntelGate query={q} rows={4}>
          {p && (
            <dl className="pstats">
              <div><dt>Transactions to its contracts</dt><dd className="mono">{p.txCount === null ? "—" : compact(p.txCount)}</dd><SourceTag source="observed" period="All time" /></div>
              <div><dt>Last active</dt><dd className="mono">{p.lastActive ? timeAgo(p.lastActive) : "—"}</dd><SourceTag source="observed" period="Latest transaction" /></div>
              <div><dt>Verified source</dt><dd className="mono">{p.contracts.filter((c) => c.verified).length}/{p.contracts.length}</dd><SourceTag source="observed" period="Explorer" /></div>
            </dl>
          )}
        </IntelGate>
      </section>

      <section className="panel" aria-labelledby="contracts-title">
        <PanelHead icon={FileCode2} title="Contracts" id="contracts-title"><SourceTag source="project" period="Published by the team" /></PanelHead>
        <IntelGate query={q} rows={4}>
          {p && (
            <div className="ctable" role="table" aria-label="Published contracts">
              <div className="ctable__row ctable__row--head" role="row">
                <span role="columnheader">Contract</span><span role="columnheader">Source</span><span role="columnheader">Transactions</span><span role="columnheader">Last active</span>
              </div>
              {p.contracts.map((c) => (
                <div key={c.address} className="ctable__row" role="row">
                  <span role="cell" className="ctable__id">
                    <a href={explorer.address(c.address)} target="_blank" rel="noopener noreferrer">
                      <span className="ctable__name">{c.name ?? "Unnamed"}</span>
                      <span className="mono xs secondary">{c.address}</span>
                      <span className="visually-hidden"> (opens explorer)</span>
                    </a>
                  </span>
                  <span role="cell">{c.verified ? <span className="badge badge--live"><BadgeCheck aria-hidden="true" />Verified</span> : c.verified === false ? <span className="badge"><Minus aria-hidden="true" />Unverified</span> : <span className="xs secondary">—</span>}</span>
                  <span role="cell" className="mono small">{c.txCount === null ? "—" : c.txCount.toLocaleString("en-US")}</span>
                  <span role="cell" className="mono xs secondary">{c.lastActive ? timeAgo(c.lastActive) : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </IntelGate>
      </section>

      <section className="panel" aria-labelledby="timeline-title">
        <PanelHead icon={Activity} title="Activity timeline" id="timeline-title"><SourceTag source="observed" period="Latest transactions" /></PanelHead>
        <IntelGate query={q} rows={5}>{p && <PulseList events={p.recent} />}</IntelGate>
      </section>
    </>
  );
}
