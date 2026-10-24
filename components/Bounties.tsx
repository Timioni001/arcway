'use client';

import { ArrowUpRight, Coins, Gift, LoaderCircle, Timer, Users } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { erc20Abi, type Hash } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { endsIn, escrowFor, type BountyView } from "../lib/bounties";
import { bountiesAbi } from "../lib/bountiesAbi";
import { BOUNTIES_CONTRACT, IS_MAINNET, NETWORK_NAME, USDC_ADDRESS, arcChain, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { formatUsdc, shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useBounties } from "../lib/hooks/useBounties";
import { useToast } from "../lib/hooks/toast";
import { useWallet } from "../lib/hooks/useWallet";
import { parseAmount } from "../lib/pay";
import { QUESTS, questHash } from "../lib/quests";

const usd = (v: bigint) => formatUsdc(v, { symbol: false });

/** Why a connected wallet can't claim, in plain words (mirrors the contract's checks). */
function blocker(b: BountyView, done: boolean, claimable: boolean): string | null {
  if (claimable) return null;
  if (b.status !== "open") return b.status === "empty" ? "All rewards claimed" : "This bounty has ended";
  if (!done) return `Finish “${b.quest?.title ?? "the quest"}” to claim`;
  return "Already claimed";
}

function useClaim(onDone: () => void) {
  const client = usePublicClient({ chainId: arcChain.id });
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const claim = async (b: BountyView) => {
    if (!BOUNTIES_CONTRACT || !client) return;
    setBusy(b.id); setErr(null);
    try {
      const hash = await writeContractAsync({ address: BOUNTIES_CONTRACT, abi: bountiesAbi, functionName: "claim", args: [BigInt(b.id)], chainId: arcChain.id });
      const r = await client.waitForTransactionReceipt({ hash, timeout: 60_000 });
      if (r.status !== "success") throw new Error("The claim was reverted. Nothing moved.");
      toast(`Claimed ${usd(b.rewardPerClaim)} USDC`);
      onDone();
    } catch (e) { setErr(humanizeError(e)); } finally { setBusy(null); }
  };
  return { claim, busy, err };
}

function BountyRow({ b, done, claimable, onClaim, busy, connected }: { b: BountyView; done: boolean; claimable: boolean; onClaim: () => void; busy: boolean; connected: boolean }) {
  const why = connected ? blocker(b, done, claimable) : null;
  return (
    <li className="bounty" data-status={b.status}>
      <div className="bounty__reward"><Coins aria-hidden="true" /><b className="mono">{usd(b.rewardPerClaim)}</b><small>USDC each</small></div>
      <div className="bounty__body">
        <div className="bounty__title">{b.title || "Sponsored quest"}</div>
        <div className="xs secondary">
          {b.quest ? <Link className="link" href={`/quests/${b.quest.id}`}>{b.quest.title}</Link> : "Quest"} · by <span className="mono">{shortAddress(b.sponsor)}</span>
        </div>
        <div className="bounty__meta xs">
          <span><Users aria-hidden="true" />{b.left} of {b.maxClaims} left</span>
          <span><Timer aria-hidden="true" />{endsIn(b.expiresAt, Math.floor(Date.now() / 1000))}</span>
        </div>
      </div>
      <div className="bounty__act">
        {claimable ? (
          <button className="btn btn--primary btn--sm" onClick={onClaim} disabled={busy} aria-busy={busy}>{busy ? "Claiming…" : `Claim ${usd(b.rewardPerClaim)} USDC`}</button>
        ) : why ? <span className="xs secondary">{why}</span> : null}
      </div>
    </li>
  );
}

/** Live bounties: every open sponsored quest, or one quest's bounties on its page. */
export function SponsoredQuests({ questId, compact = false }: { questId?: string; compact?: boolean }) {
  const { connection, quests } = useArcwayState();
  const user = connection.status === "connected" ? connection.address : undefined;
  const { enabled, bounties, claimable, refetch } = useBounties(user);
  const { claim, busy, err } = useClaim(refetch);
  if (!enabled) return null;
  const list = bounties.filter((b) => b.status === "open" && (!questId || b.questId.toLowerCase() === questHash(questId).toLowerCase()));
  if (!list.length) {
    if (compact) return null;
    return (
      <div className="bounty-empty card">
        <Gift aria-hidden="true" />
        <div><b>No sponsored quests right now</b><p className="small secondary">Put USDC behind a quest and everyone who finishes it can claim a share, straight from the contract.</p></div>
        <Link href="/sponsor" className="btn btn--secondary btn--sm">Sponsor a quest</Link>
      </div>
    );
  }
  const done = new Set(quests.filter((q) => q.status === "completed").map((q) => questHash(q.id).toLowerCase()));
  return (
    <div>
      <ul className="bounties">
        {list.map((b) => <BountyRow key={b.id} b={b} connected={Boolean(user)} done={done.has(b.questId.toLowerCase())} claimable={claimable.has(b.id)} busy={busy === b.id} onClaim={() => claim(b)} />)}
      </ul>
      {err && <p className="field__error" role="alert">{err}</p>}
      {!compact && <p className="xs secondary" style={{ marginTop: 10 }}>Rewards are paid by the ArcwayBounties contract to wallets whose passport has the quest recorded. <Link className="link" href="/sponsor">Sponsor a quest</Link></p>}
    </div>
  );
}

/** Put USDC behind a quest: approve the escrow, then create the bounty. */
export function SponsorForm() {
  const { connection, onArc, balance, refetchAll } = useArcwayState();
  const wallet = useWallet();
  const client = usePublicClient({ chainId: arcChain.id });
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();
  const [questId, setQuestId] = useState(QUESTS[1].id);
  const [reward, setReward] = useState("1");
  const [people, setPeople] = useState("20");
  const [days, setDays] = useState("14");
  const [title, setTitle] = useState("");
  const [phase, setPhase] = useState<{ k: "idle" } | { k: "approve" } | { k: "create" } | { k: "done"; hash: Hash } | { k: "error"; msg: string }>({ k: "idle" });
  const ids = { q: useId(), r: useId(), p: useId(), d: useId(), t: useId() };

  const amt = parseAmount(reward);
  const n = Math.floor(Number(people));
  const d = Math.floor(Number(days));
  const valid = amt.ok && n >= 1 && n <= 10_000 && d >= 1 && d <= 180 && new TextEncoder().encode(title).length <= 80;
  const escrow = amt.ok && n >= 1 ? escrowFor(amt.value, n) : 0n;
  const short = balance.data !== undefined && escrow > balance.data;
  const busy = phase.k === "approve" || phase.k === "create";

  const submit = async () => {
    if (!BOUNTIES_CONTRACT || !client || !connection.address || !amt.ok || !valid) return;
    try {
      const allowance = await client.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "allowance", args: [connection.address, BOUNTIES_CONTRACT] });
      if (allowance < escrow) {
        setPhase({ k: "approve" });
        const a = await writeContractAsync({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [BOUNTIES_CONTRACT, escrow], chainId: arcChain.id });
        if ((await client.waitForTransactionReceipt({ hash: a, timeout: 60_000 })).status !== "success") throw new Error("The approval didn't go through. Nothing moved.");
      }
      setPhase({ k: "create" });
      const expires = BigInt(Math.floor(Date.now() / 1000) + d * 86400);
      const hash = await writeContractAsync({ address: BOUNTIES_CONTRACT, abi: bountiesAbi, functionName: "create", args: [questHash(questId), amt.value, BigInt(n), expires, title.trim()], chainId: arcChain.id });
      if ((await client.waitForTransactionReceipt({ hash, timeout: 60_000 })).status !== "success") throw new Error("Creating the bounty was reverted. Your USDC is still yours.");
      setPhase({ k: "done", hash });
      toast("Bounty live");
      refetchAll();
    } catch (e) { setPhase({ k: "error", msg: humanizeError(e) }); }
  };

  if (!BOUNTIES_CONTRACT) {
    return <div className="card pad-lg"><b>Opening soon</b><p className="small secondary" style={{ marginTop: 6 }}>Sponsored quests go live when the ArcwayBounties contract is deployed on {NETWORK_NAME}.</p></div>;
  }

  return (
    <div className="card pad-lg sponsor">
      <div className="sponsor__grid">
        <label htmlFor={ids.q} className="field"><span className="label">Quest</span>
          <select id={ids.q} className="input" value={questId} onChange={(e) => setQuestId(e.target.value)} disabled={busy}>
            {QUESTS.map((q) => <option key={q.id} value={q.id}>{q.tier} · {q.title}</option>)}
          </select></label>
        <label htmlFor={ids.r} className="field"><span className="label">Reward per person (USDC)</span>
          <input id={ids.r} className="input" inputMode="decimal" value={reward} onChange={(e) => setReward(e.target.value)} disabled={busy} /></label>
        <label htmlFor={ids.p} className="field"><span className="label">How many people</span>
          <input id={ids.p} className="input" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} disabled={busy} /></label>
        <label htmlFor={ids.d} className="field"><span className="label">Runs for (days)</span>
          <input id={ids.d} className="input" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} disabled={busy} /></label>
        <label htmlFor={ids.t} className="field sponsor__wide"><span className="label">Title (optional, shown with the bounty)</span>
          <input id={ids.t} className="input" maxLength={80} placeholder="e.g. Try your first swap on Arc" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} /></label>
      </div>
      <div className="sponsor__sum">
        <span className="secondary small">You escrow</span>
        <b className="mono">{escrow ? usd(escrow) : "0"} USDC</b>
        <span className="xs secondary">Unclaimed USDC comes back to you after it ends. The contract pays finishers directly; nobody else can move it.</span>
      </div>
      {connection.status !== "connected" ? (
        <button className="btn btn--primary btn--block" onClick={() => wallet.connect()}>Connect wallet</button>
      ) : !onArc ? (
        <button className="btn btn--primary btn--block" onClick={wallet.switchToArc}>Switch to {NETWORK_NAME}</button>
      ) : (
        <button className="btn btn--primary btn--block" onClick={submit} disabled={!valid || short || busy || phase.k === "done"} aria-busy={busy}>
          {phase.k === "approve" ? "Approve USDC (1 of 2)…" : phase.k === "create" ? "Create the bounty (2 of 2)…" : short ? "Not enough USDC" : `Sponsor with ${escrow ? usd(escrow) : "0"} USDC`}
        </button>
      )}
      {IS_MAINNET && phase.k === "idle" && <p className="xs secondary">This escrows real USDC on {NETWORK_NAME}.</p>}
      {busy && <p className="xs secondary"><LoaderCircle className="spin" aria-hidden="true" style={{ width: 14, verticalAlign: -2 }} /> Confirm in your wallet.</p>}
      {phase.k === "done" && <p className="small">Your bounty is live. <a className="link" href={explorer.tx(phase.hash)} target="_blank" rel="noopener noreferrer">View transaction <ArrowUpRight aria-hidden="true" /></a> · <Link className="link" href="/quests#sponsored">See it on Quests</Link></p>}
      {phase.k === "error" && <p className="field__error" role="alert">{phase.msg}</p>}
    </div>
  );
}
