'use client';

import { ArrowUpRight, Clock, CircleAlert, Send, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ActivityItem } from "../lib/api";
import { explorer } from "../lib/config";
import { shortAddress, timeAgo } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { StateBlock } from "./Section";

export function Activity({ limit = 20 }: { limit?: number }) {
  const { address, connection } = useArcwayState();
  const activity = useQuery({
    queryKey: ["arcway", "activity", address],
    queryFn: () => apiFetch<{ items: ActivityItem[] }>(`/api/activity?address=${address}`),
    enabled: Boolean(address),
    refetchInterval: 30_000
  });

  if (connection.status !== "connected") {
    return <StateBlock icon={Wallet} title="No wallet connected">Connect a wallet to see your Arc activity.</StateBlock>;
  }
  if (activity.isPending) {
    return (
      <div className="surface surface--lg pad" aria-busy="true">
        <div className="label">Syncing activity…</div>
        {[0, 1, 2].map((i) => <div key={i} className="shimmer" style={{ height: 20, marginTop: 16 }} />)}
      </div>
    );
  }
  if (activity.isError) {
    return (
      <StateBlock icon={CircleAlert} tone="error" title="Activity is unavailable" actions={<button className="btn btn--secondary btn--sm" onClick={() => activity.refetch()}>Try again</button>}>
        The explorer didn&apos;t respond. Your onchain record is unaffected.
      </StateBlock>
    );
  }
  const items = activity.data.items.slice(0, limit);
  if (items.length === 0) {
    return (
      <StateBlock icon={Clock} title="No transactions yet">
        Your first Arc transaction will appear here a few seconds after it confirms.
      </StateBlock>
    );
  }
  return (
    <div className="surface surface--lg pad">
      <ul className="activity">
        {items.map((tx) => (
          <li key={tx.hash}>
            <span className="activity__icon" data-failed={!tx.success} aria-hidden="true">
              {tx.success ? <Send /> : <CircleAlert />}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="body-sm" style={{ fontWeight: 500 }}>
                {tx.method ?? "Transfer"}{!tx.success && <span style={{ color: "var(--aw-danger)" }}> · failed</span>}
              </div>
              <div className="mono muted">{tx.to ? `to ${shortAddress(tx.to)}` : "contract creation"} · {timeAgo(tx.timestamp)}</div>
            </div>
            <a className="link body-sm" href={explorer.tx(tx.hash)} target="_blank" rel="noopener noreferrer" aria-label={`View transaction ${shortAddress(tx.hash)} on explorer`}>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
