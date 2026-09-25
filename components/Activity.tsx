'use client';

import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ActivityItem } from "../lib/api";
import { arcChain, explorer } from "../lib/config";
import { shortAddress, timeAgo } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { ExternalLink } from "./Status";

export function Activity() {
  const { address, connection } = useArcwayState();
  const activity = useQuery({
    queryKey: ["arcway", "activity", address],
    queryFn: () => apiFetch<{ items: ActivityItem[] }>(`/api/activity?address=${address}`),
    enabled: Boolean(address),
    refetchInterval: 30_000
  });

  if (connection.status !== "connected") {
    return <div className="card muted">Connect a wallet to see your {arcChain.name} activity.</div>;
  }
  if (activity.isPending) return <div className="card muted" aria-busy="true">Loading activity…</div>;
  if (activity.isError) {
    return (
      <div className="card" role="alert">
        <span className="muted">Activity is temporarily unavailable. </span>
        <button className="button secondary" onClick={() => activity.refetch()}>Retry</button>
      </div>
    );
  }
  if (activity.data.items.length === 0) {
    return (
      <div className="card muted">
        No transactions yet. Your first Arc transaction will show up here within a few seconds.
      </div>
    );
  }
  return (
    <div className="card">
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {activity.data.items.map((tx, i) => (
          <li key={tx.hash} className="quest small" style={{ marginTop: i ? 14 : 0 }}>
            <div>
              <b>{tx.method ?? "Transfer"}</b>
              <span className="muted"> {tx.to ? `to ${shortAddress(tx.to)}` : "contract creation"}</span>
              {!tx.success && <span className="muted"> · failed</span>}
            </div>
            <div className="muted">
              {timeAgo(tx.timestamp)} · <ExternalLink href={explorer.tx(tx.hash)}>details</ExternalLink>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
