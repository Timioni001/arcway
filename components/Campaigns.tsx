'use client';

import { ArrowUpRight, Check, CircleAlert, Gift, LoaderCircle, Scale, Timer, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import { usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { apiFetch } from "../lib/api";
import { campaignsAbi } from "../lib/campaignsAbi";
import {
  CAMPAIGNS, MODE_HELP, MODE_LABEL, PHASE_LABEL, type CampaignMeta, type CampaignPhase, type CampaignState, modeOf, phaseOf, rewardSentence, timeLeft
} from "../lib/campaigns";
import { CAMPAIGNS_ADDRESS, NETWORK_NAME, arcChain, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { formatUsdc } from "../lib/format";
import { useClientDate } from "../lib/hooks/useClientDate";
import { useWallet } from "../lib/hooks/useWallet";
import { Status } from "./Status";

type RawCampaign = {
  creator: `0x${string}`; mode: number; start: bigint; end: bigint; claimUntil: bigint; maxWinners: number; entries: number;
  refunded: boolean; pool: bigint; paid: bigint; allocated: bigint; resultsRoot: Hex; metadataHash: Hex;
};

function toState(c: RawCampaign): CampaignState {
  return {
    creator: c.creator, mode: modeOf(c.mode), start: Number(c.start), end: Number(c.end), claimUntil: Number(c.claimUntil),
    maxWinners: Number(c.maxWinners), entries: Number(c.entries), refunded: c.refunded, pool: c.pool, paid: c.paid,
    allocated: c.allocated, resultsRoot: c.resultsRoot, metadataHash: c.metadataHash
  };
}

function useNowSec(): number | null {
  const date = useClientDate();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!date) return;
    setNow(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => clearInterval(id);
  }, [date]);
  return now;
}

function PhaseBadge({ phase }: { phase: CampaignPhase }) {
  return <span className="badge cpg-phase" data-phase={phase}>{phase === "live" && <span className="dot" aria-hidden="true" />}{PHASE_LABEL[phase]}</span>;
}

function When({ state, phase, now }: { state: CampaignState; phase: CampaignPhase; now: number }) {
  if (phase === "upcoming") return <>Starts in {timeLeft(state.start, now)}</>;
  if (phase === "live") return <>Ends in {timeLeft(state.end, now)}</>;
  if (phase === "claiming") return <>Claim within {timeLeft(state.claimUntil, now)}</>;
  if (phase === "drawing") return <>Ended, results next</>;
  return <>Ended</>;
}

// ---------------------------------------------------------------- list

export function CampaignList() {
  const now = useNowSec();
  const reads = useReadContracts({
    contracts: CAMPAIGNS.map((c) => ({ address: CAMPAIGNS_ADDRESS!, abi: campaignsAbi, functionName: "getCampaign" as const, args: [BigInt(c.id)] as const, chainId: arcChain.id })),
    query: { enabled: Boolean(CAMPAIGNS_ADDRESS) && CAMPAIGNS.length > 0, refetchInterval: 30_000 }
  });

  if (!CAMPAIGNS.length) {
    return (
      <div className="cpg-empty">
        <span className="cpg-empty__icon" aria-hidden="true"><Gift /></span>
        <h2 className="h3">No live campaigns yet</h2>
        <p className="secondary">When a project on Arc launches a campaign, it appears here with its prize pool, the tasks, and how rewards are shared. Joining is always free.</p>
        <Link href="/launch" className="btn btn--primary">Launch a campaign</Link>
      </div>
    );
  }

  return (
    <ul className="cpg-grid">
      {CAMPAIGNS.map((meta, i) => {
        const raw = reads.data?.[i]?.result as RawCampaign | undefined;
        const state = raw ? toState(raw) : null;
        const phase = state && now ? phaseOf(state, now) : null;
        return (
          <li key={meta.slug}>
            <Link href={`/campaigns/${meta.slug}`} className="cpg-card">
              <div className="cpg-card__top">
                <span className="xs secondary">{meta.project}</span>
                {phase && <PhaseBadge phase={phase} />}
              </div>
              <h3 className="cpg-card__title">{meta.title}</h3>
              {state ? (
                <>
                  <div className="cpg-card__pool mono">{formatUsdc(state.pool)}</div>
                  <p className="small secondary">{rewardSentence(state.mode, state.pool, state.maxWinners)}</p>
                  <div className="cpg-card__meta xs secondary">
                    <span><Users aria-hidden="true" />{state.entries.toLocaleString("en-US")} joined</span>
                    {phase && now && <span><Timer aria-hidden="true" /><When state={state} phase={phase} now={now} /></span>}
                  </div>
                </>
              ) : (
                <div className="skeleton" style={{ height: 56, marginTop: 8 }} />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- detail

type CheckResponse = { tasks: { label: string; done: boolean; note?: string }[]; eligible: boolean; entered: boolean; phase: CampaignPhase; deadline?: number; signature?: Hex };
type ProofResponse = { status: "pending" | "won" | "not-won"; amount?: string; proof?: Hex[]; seed?: { block: string; hash: Hex }; winners?: number };

export function CampaignDetail({ meta }: { meta: CampaignMeta }) {
  const now = useNowSec();
  const wallet = useWallet();
  const address = wallet.connection.status === "connected" ? wallet.connection.address : undefined;
  const client = usePublicClient({ chainId: arcChain.id });
  const { writeContractAsync } = useWriteContract();
  const read = useReadContract({
    address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "getCampaign", args: [BigInt(meta.id)], chainId: arcChain.id,
    query: { enabled: Boolean(CAMPAIGNS_ADDRESS), refetchInterval: 15_000 }
  });
  const claimedRead = useReadContract({
    address: CAMPAIGNS_ADDRESS, abi: campaignsAbi, functionName: "claimed", args: address ? [BigInt(meta.id), address] : undefined, chainId: arcChain.id,
    query: { enabled: Boolean(CAMPAIGNS_ADDRESS && address) }
  });
  const state = read.data ? toState(read.data as RawCampaign) : null;
  const phase = state && now ? phaseOf(state, now) : null;

  const [check, setCheck] = useState<CheckResponse | null>(null);
  const [proof, setProof] = useState<ProofResponse | null>(null);
  const [busy, setBusy] = useState<"check" | "join" | "claim" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ text: string; tx?: string } | null>(null);

  const runCheck = useCallback(async () => {
    if (!address) return;
    setBusy("check"); setError(null);
    try {
      setCheck(await apiFetch<CheckResponse>(`/api/campaigns/${meta.id}/check`, { method: "POST", body: JSON.stringify({ address }) }));
    } catch (e) { setError(humanizeError(e)); } finally { setBusy(null); }
  }, [address, meta.id]);

  // After the end: make sure results get published, then fetch this wallet's result.
  useEffect(() => {
    if (!phase || !address || (phase !== "drawing" && phase !== "claiming")) return;
    let cancelled = false;
    (async () => {
      if (phase === "drawing") await apiFetch(`/api/campaigns/${meta.id}/finalize`, { method: "POST" }).catch(() => undefined);
      const p = await apiFetch<ProofResponse>(`/api/campaigns/${meta.id}/proof?address=${address}`).catch(() => null);
      if (!cancelled) setProof(p);
    })();
    return () => { cancelled = true; };
  }, [phase, address, meta.id]);

  const send = async (fn: () => Promise<Hex>, text: string) => {
    setError(null);
    try {
      const hash = await fn();
      await client!.waitForTransactionReceipt({ hash, timeout: 60_000 });
      setDone({ text, tx: hash });
      await Promise.all([read.refetch(), claimedRead.refetch()]);
    } catch (e) { setError(humanizeError(e)); }
  };

  const join = async () => {
    if (!check?.signature || !check.deadline) return;
    setBusy("join");
    await send(() => writeContractAsync({ address: CAMPAIGNS_ADDRESS!, abi: campaignsAbi, functionName: "enter", args: [BigInt(meta.id), BigInt(check.deadline!), check.signature!], chainId: arcChain.id }),
      state?.mode === "first-come" ? "You're in, and your reward is in your wallet." : "You're in. Results come after the campaign ends.");
    setBusy(null);
  };

  const claim = async () => {
    if (!proof?.amount || !proof.proof) return;
    setBusy("claim");
    await send(() => writeContractAsync({ address: CAMPAIGNS_ADDRESS!, abi: campaignsAbi, functionName: "claim", args: [BigInt(meta.id), BigInt(proof.amount!), proof.proof!], chainId: arcChain.id }),
      `${formatUsdc(BigInt(proof.amount))} is in your wallet.`);
    setBusy(null);
  };

  if (!CAMPAIGNS_ADDRESS) return <Status tone="info">Campaigns aren&apos;t live on {NETWORK_NAME} yet.</Status>;
  if (!state || !phase || !now) return <div className="skeleton" style={{ height: 320, borderRadius: 24 }} />;

  const left = state.pool - state.paid;
  const alreadyClaimed = Boolean(claimedRead.data);

  return (
    <div className="cpg-detail">
      <section className="cpg-hero" aria-labelledby="cpg-title">
        <div className="row between">
          <span className="small secondary">{meta.project}</span>
          <PhaseBadge phase={phase} />
        </div>
        <h1 id="cpg-title" className="cpg-hero__title">{meta.title}</h1>
        <p className="cpg-hero__summary">{meta.summary}</p>
        <div className="cpg-hero__stats">
          <div><span className="label">Prize pool</span><b className="mono">{formatUsdc(state.pool)}</b></div>
          <div><span className="label">How it&apos;s shared</span><b>{MODE_LABEL[state.mode]}</b><span className="xs secondary">{rewardSentence(state.mode, state.pool, state.maxWinners)}</span></div>
          <div><span className="label">Joined</span><b className="mono">{state.entries.toLocaleString("en-US")}</b>{state.mode !== "raffle" && <span className="xs secondary">of {state.maxWinners.toLocaleString("en-US")} places</span>}</div>
          <div><span className="label">Time</span><b><When state={state} phase={phase} now={now} /></b></div>
        </div>
        {state.mode === "first-come" && phase === "live" && <p className="xs secondary">{formatUsdc(left)} left in the pool.</p>}
      </section>

      <div className="cpg-cols">
        <section className="cpg-panel" aria-labelledby="cpg-tasks">
          <h2 id="cpg-tasks" className="h4">What to do</h2>
          <ol className="cpg-tasks">
            {meta.tasks.map((t, i) => {
              const c = check?.tasks[i];
              return (
                <li key={i} data-done={c?.done || undefined}>
                  <span className="cpg-tasks__mark" aria-hidden="true">{c?.done ? <Check /> : i + 1}</span>
                  <span><span className="cpg-tasks__label">{t.label}</span>{c && !c.done && c.note && <span className="xs secondary">{c.note}</span>}</span>
                  <span className="visually-hidden">{c ? (c.done ? "done" : "not done yet") : ""}</span>
                </li>
              );
            })}
          </ol>

          <div className="cpg-action">
            {phase === "upcoming" && <p className="small secondary">Joining opens when the campaign starts.</p>}
            {phase === "live" && !address && <button className="btn btn--primary" onClick={() => wallet.connect()}>Connect a wallet to join</button>}
            {phase === "live" && address && (check?.entered ? (
              <p className="cpg-ok"><Check aria-hidden="true" />You&apos;ve joined this campaign.</p>
            ) : check?.eligible && check.signature ? (
              <button className="btn btn--primary" onClick={join} disabled={busy === "join"} aria-busy={busy === "join"}>
                {busy === "join" ? <><LoaderCircle className="spin" aria-hidden="true" />Confirm in your wallet…</> : state.mode === "first-come" ? `Join and get ${formatUsdc(state.pool / BigInt(state.maxWinners))}` : "Join the campaign"}
              </button>
            ) : (
              <button className="btn btn--primary" onClick={runCheck} disabled={busy === "check"} aria-busy={busy === "check"}>
                {busy === "check" ? <><LoaderCircle className="spin" aria-hidden="true" />Checking on Arc…</> : check ? "Check again" : "Check my tasks"}
              </button>
            ))}
            {phase === "drawing" && <p className="small secondary"><LoaderCircle className="spin" aria-hidden="true" /> The campaign has ended. Results are being published on Arc.</p>}
            {phase === "claiming" && address && (alreadyClaimed ? (
              <p className="cpg-ok"><Check aria-hidden="true" />Reward claimed.</p>
            ) : proof?.status === "won" ? (
              <button className="btn btn--primary" onClick={claim} disabled={busy === "claim"} aria-busy={busy === "claim"}>
                {busy === "claim" ? <><LoaderCircle className="spin" aria-hidden="true" />Confirm in your wallet…</> : `Claim ${formatUsdc(BigInt(proof.amount!))}`}
              </button>
            ) : proof?.status === "not-won" ? (
              <p className="small secondary">Not drawn this time. {proof.winners} {proof.winners === 1 ? "winner was" : "winners were"} picked from everyone who joined.</p>
            ) : <p className="small secondary"><LoaderCircle className="spin" aria-hidden="true" /> Checking your result…</p>)}
            {phase === "claiming" && !address && <button className="btn btn--primary" onClick={() => wallet.connect()}>Connect to see your result</button>}
            {phase === "closed" && <p className="small secondary">This campaign has ended.</p>}
            {done && <p className="cpg-ok" role="status"><Check aria-hidden="true" />{done.text} {done.tx && <a className="link" href={explorer.tx(done.tx)} target="_blank" rel="noopener noreferrer">View transaction<ArrowUpRight aria-hidden="true" /></a>}</p>}
            {error && <p className="sfield__error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
          </div>
        </section>

        <section className="cpg-panel cpg-panel--quiet" aria-labelledby="cpg-fair">
          <h2 id="cpg-fair" className="h4"><Scale aria-hidden="true" /> Fair and free</h2>
          <ul className="cpg-rules">
            <li><b>Free to join.</b> No purchase or payment is needed to take part or to win.</li>
            <li><b>The pool is locked.</b> {formatUsdc(state.pool)} sits in the campaign contract on Arc and can only go to participants, or back to the project after the claim window. <a className="link" href={explorer.address(CAMPAIGNS_ADDRESS)} target="_blank" rel="noopener noreferrer">See the contract<ArrowUpRight aria-hidden="true" /></a></li>
            <li><b>{MODE_LABEL[state.mode]}.</b> {MODE_HELP[state.mode]}</li>
            {state.mode !== "first-come" && (
              <li><b>Checkable draw.</b> Results use the hash of the first Arc block after the end time, which nobody can know in advance, and the list of entries on chain.
                {proof?.seed && <> Seed: <a className="link mono" href={explorer.block(proof.seed.block)} target="_blank" rel="noopener noreferrer">block {proof.seed.block}<ArrowUpRight aria-hidden="true" /></a></>}
              </li>
            )}
            <li><b>One entry per wallet.</b> Tasks are checked on Arc, not by screenshots.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
