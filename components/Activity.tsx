'use client';

import { ArrowLeftRight, ArrowUpRight, CircleAlert, Clock, Wallet } from "lucide-react";
import Link from "next/link";
import type { ActivityItem } from "../lib/api";
import { explorer } from "../lib/config";
import { dayLabel, shortAddress, timeAgo } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useActivity } from "../lib/hooks/useActivity";
import { USDC_ADDRESS } from "../lib/config";
import { appForContract } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { StateBlock } from "./Section";

/** Clean timeline grouped by day, not an explorer table. */
export function Activity({ limit = 20 }: { limit?: number }) {
  const { connection } = useArcwayState();
  const activity = useActivity();

  if (connection.status !== "connected") {
    return <StateBlock icon={Wallet} title="No wallet connected">Connect a wallet to see your activity on Arc.</StateBlock>;
  }
  if (activity.isPending) {
    return (
      <div className="card pad" aria-busy="true" aria-label="Syncing activity">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 18, marginTop: i ? 18 : 0, width: `${80 - i * 15}%` }} />)}
      </div>
    );
  }
  if (activity.isError) {
    return (
      <StateBlock icon={CircleAlert} tone="error" title="Something went wrong" actions={<button className="btn btn--secondary btn--sm" onClick={() => activity.refetch()}>Try again</button>}>
        We couldn&apos;t load your activity.
      </StateBlock>
    );
  }
  const items = activity.data.items.slice(0, limit);
  if (items.length === 0) {
    return <StateBlock icon={Clock} title="No activity yet">Your Arc transactions will appear here.</StateBlock>;
  }

  const groups = new Map<string, ActivityItem[]>();
  for (const tx of items) {
    const key = dayLabel(tx.timestamp);
    groups.set(key, [...(groups.get(key) ?? []), tx]);
  }

  return (
    <div className="card pad">
      {[...groups].map(([day, txs]) => (
        <section key={day} className="timeline__day" aria-label={day}>
          <h3 className="label">{day}</h3>
          <ul>
            {txs.map((tx) => {
              const app = appForContract(tx.to);
              const isUsdc = tx.to?.toLowerCase() === USDC_ADDRESS.toLowerCase();
              return (
              <li key={tx.hash} className="timeline__item timeline__item--rich" data-failed={!tx.success}>
                {app ? <AppMark app={app} size="sm" /> : <span className="tile tile--sm" aria-hidden="true">{isUsdc ? <span className="usdc-mark">$</span> : <ArrowLeftRight />}</span>}
                <div style={{ minWidth: 0 }}>
                  <div className="small" style={{ fontWeight: 500 }}>
                    {app ? <Link href={`/apps/${app.slug}`} className="link-quiet">{app.name}</Link> : isUsdc ? "USDC" : tx.method ?? "Transfer"}
                    {app && tx.method && <span className="secondary"> · {tx.method}</span>}
                    {isUsdc && tx.method && <span className="secondary"> · {tx.method}</span>}
                    {!tx.success && <span style={{ color: "var(--error)" }}> · Failed</span>}
                  </div>
                  <div className="xs secondary">
                    <span className="mono">{tx.to ? shortAddress(tx.to) : "New contract"}</span> · {timeAgo(tx.timestamp)}
                  </div>
                </div>
                <a className="link" href={explorer.tx(tx.hash)} target="_blank" rel="noopener noreferrer" aria-label={`View transaction ${shortAddress(tx.hash)}`}>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
