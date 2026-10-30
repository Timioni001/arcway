'use client';

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Coins } from "lucide-react";
import { apiFetch } from "../lib/api";
import { bountiesForQuest } from "../lib/bounties";
import { BOUNTIES_CONTRACT, explorer } from "../lib/config";
import { formatUsdc, shortAddress, timeAgo } from "../lib/format";
import { useBounties } from "../lib/hooks/useBounties";
import { useClientDate } from "../lib/hooks/useClientDate";
import type { BountyEvent } from "../lib/server/bountyActivity";

const usd = (v: bigint) => formatUsdc(v, { symbol: false });
const REPO = "https://github.com/Timioni001/arcway";

/** Totals across every bounty, read from the contract itself. */
export function BountyStats() {
  const { enabled, bounties, loading } = useBounties();
  if (!enabled) return null;
  const escrowed = bounties.reduce((s, b) => s + b.rewardPerClaim * BigInt(b.maxClaims), 0n);
  const paid = bounties.reduce((s, b) => s + b.rewardPerClaim * BigInt(b.claims), 0n);
  const claims = bounties.reduce((s, b) => s + b.claims, 0);
  const open = bounties.filter((b) => b.status === "open").length;
  const show = (v: string) => (loading ? "…" : v);
  return (
    <div className="bounty-stats" aria-label="ArcwayBounties totals">
      <div className="stat"><b>{show(usd(paid))}</b><span className="xs secondary">USDC paid out</span></div>
      <div className="stat"><b>{show(String(claims))}</b><span className="xs secondary">rewards claimed</span></div>
      <div className="stat"><b>{show(usd(escrowed))}</b><span className="xs secondary">USDC put up</span></div>
      <div className="stat"><b>{show(String(open))}</b><span className="xs secondary">open now</span></div>
    </div>
  );
}

function describe(e: BountyEvent): string {
  switch (e.kind) {
    case "created": return `${shortAddress(e.who ?? "")} put up ${usd(BigInt(e.amount))} USDC`;
    case "claimed": return `${shortAddress(e.who ?? "")} claimed ${usd(BigInt(e.amount))} USDC`;
    case "funded": return `Topped up with ${e.amount} more reward${e.amount === "1" ? "" : "s"}`;
    case "closed": return `Closed, ${usd(BigInt(e.amount))} USDC back to the sponsor`;
  }
}

/** The latest creates, claims and closes on ArcwayBounties, each linked to its transaction. */
export function BountyActivity({ limit = 8 }: { limit?: number }) {
  const now = useClientDate();
  const q = useQuery({
    queryKey: ["arcway", "bounties", "activity"],
    queryFn: () => apiFetch<{ events: BountyEvent[] }>("/api/bounties"),
    enabled: Boolean(BOUNTIES_CONTRACT),
    refetchInterval: 30_000,
    staleTime: 15_000
  });
  if (!BOUNTIES_CONTRACT) return null;
  const events = q.data?.events.slice(0, limit) ?? [];
  return (
    <div className="card pad-lg">
      <h3 className="h4">Latest payouts</h3>
      {q.isLoading ? <p className="small secondary" style={{ marginTop: 8 }}>Reading Arc…</p>
        : q.isError ? <p className="small secondary" style={{ marginTop: 8 }}>Activity is unavailable right now. Totals above come straight from the contract.</p>
        : !events.length ? <p className="small secondary" style={{ marginTop: 8 }}>Nothing yet.</p>
        : (
          <ul className="bounty-feed">
            {events.map((e) => (
              <li key={`${e.tx}-${e.kind}`} data-kind={e.kind}>
                <Coins aria-hidden="true" />
                <span className="small">{describe(e)} <span className="xs secondary">· bounty #{e.id}{e.at && now ? ` · ${timeAgo(e.at, now.getTime())}` : ""}</span></span>
                {e.tx && <a className="link xs" href={explorer.tx(e.tx)} target="_blank" rel="noopener noreferrer" aria-label="View transaction">tx <ArrowUpRight aria-hidden="true" /></a>}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

/** What Arc Studio did for ArcwayBounties, with links that prove each step. */
export function StudioCredit() {
  return (
    <aside className="card pad-lg studio-credit" aria-labelledby="studio-credit">
      <span className="studio-badge"><StudioMark /> Built with Arc Studio</span>
      <h3 id="studio-credit" className="h4">This contract was written in Arc Studio</h3>
      <ol className="small secondary">
        <li><b>Written</b>: Arc Studio wrote ArcwayBounties and its deploy script against our interface, inside this repo.</li>
        <li><b>Tested and audited</b>: it ran the full Foundry suite and a first security pass over all three contracts, then deployed the stack to Arc testnet.</li>
        <li><b>Checked</b>: every finding was verified by hand and the test suite extended to 46 tests, including a 128,000-call escrow invariant.</li>
        <li><b>Live</b>: deployed unchanged on Arc mainnet{BOUNTIES_CONTRACT ? <> at <a className="link mono" href={explorer.address(BOUNTIES_CONTRACT)} target="_blank" rel="noopener noreferrer">{shortAddress(BOUNTIES_CONTRACT)}</a></> : null}.</li>
      </ol>
      <p className="xs">
        <a className="link" href={`${REPO}/blob/main/contracts/src/ArcwayBounties.sol`} target="_blank" rel="noopener noreferrer">Contract</a> ·{" "}
        <a className="link" href={`${REPO}/blob/main/contracts/AUDIT.md`} target="_blank" rel="noopener noreferrer">Audit report</a> ·{" "}
        <a className="link" href={`${REPO}/commits/arc-studio/bounties`} target="_blank" rel="noopener noreferrer">Studio&apos;s commits</a>
      </p>
    </aside>
  );
}

/** Small inline mark for "Built with Arc Studio". */
export function StudioBadge() {
  return <span className="studio-badge studio-badge--sm"><StudioMark /> Built with Arc Studio</span>;
}

function StudioMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3.5 20h4.2L12 11.2 16.3 20h4.2L12 3Z" fill="currentColor" /></svg>
  );
}

/** "Pays X USDC" on a quest card while an open bounty backs it. */
export function PaidTag({ questId }: { questId: string }) {
  const { enabled, bounties } = useBounties();
  if (!enabled) return null;
  const top = bountiesForQuest(bounties, questId)[0];
  if (!top) return null;
  return <span className="badge paid-tag" title={`${top.left} of ${top.maxClaims} rewards left`}><Coins aria-hidden="true" />Pays {usd(top.rewardPerClaim)} USDC</span>;
}
