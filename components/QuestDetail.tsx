'use client';

import { ArrowRight, ArrowUpRight, Check, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BRIDGE_URL, NETWORK_NAME } from "../lib/config";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { useWallet } from "../lib/hooks/useWallet";
import { QUESTS, getQuest, type QuestRequirement } from "../lib/quests";
import { QuestStatusPill, questNumber } from "./Quests";
import { Status } from "./Status";
import { TransactionStatus } from "./TransactionStatus";

function howWeVerify(req: QuestRequirement): string {
  switch (req.kind) {
    case "hold-usdc":
      return `We read your USDC balance on ${NETWORK_NAME}. At least 1 USDC counts.`;
    case "first-transaction":
      return `We check that your wallet has sent at least one transaction on ${NETWORK_NAME}.`;
    case "app-interaction":
      return "We look for a successful transaction from your wallet to a contract of a verified app.";
    case "complete-quests":
      return "We read your passport contract to confirm the other starter quests are recorded.";
  }
}

export function QuestDetail({ questId }: { questId: string }) {
  const { quests, connection, recordingEnabled, reasons, progress } = useArcwayState();
  const { claim, stateOf } = useClaims();
  const wallet = useWallet();
  const quest = quests.find((q) => q.id === questId)!;
  const state = stateOf(quest.id);
  const connected = connection.status === "connected";
  const busy = state.phase === "verifying" || state.phase === "confirming";
  const nextQuest = QUESTS[QUESTS.findIndex((q) => q.id === quest.id) + 1];

  const todoCta =
    quest.requirement.kind === "hold-usdc" ? (
      <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--block">
        Get USDC on Arc <ArrowUpRight aria-hidden="true" />
      </a>
    ) : quest.requirement.kind !== "complete-quests" ? (
      <Link href="/apps" className="btn btn--secondary btn--block">Find an app <ArrowRight aria-hidden="true" /></Link>
    ) : null;

  return (
    <>
      <header className="stack-4" style={{ marginTop: 24, maxWidth: 760 }}>
        <div className="mono muted">QUEST {questNumber(quest.id)}</div>
        <h1 className="display">{quest.title}</h1>
        <p className="lede">{quest.description}</p>
        <div className="row">
          <span className="pill mono">+{quest.xp} XP</span>
          <span className="pill" style={{ textTransform: "capitalize" }}>{quest.difficulty}</span>
          <span className="pill mono">{quest.minutes} min</span>
        </div>
      </header>

      <div className="detail" style={{ marginTop: 48 }}>
        <div style={{ display: "grid", gap: 40 }}>
          <section className="stack-4" aria-labelledby="steps">
            <h2 id="steps" className="label">Steps</h2>
            <ol className="steps">
              {quest.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </section>
          <section className="stack-3" aria-labelledby="verify">
            <h2 id="verify" className="label">How it&apos;s verified</h2>
            <p className="muted" style={{ maxWidth: 600 }}>{howWeVerify(quest.requirement)} Arcway&apos;s verifier checks this on the server; your browser can&apos;t mark a quest complete.</p>
          </section>
          {quest.lockedBy.length > 0 && (
            <section className="stack-3" aria-labelledby="requires">
              <h2 id="requires" className="label">Requires</h2>
              <div className="row">
                {quest.lockedBy.map((id) => (
                  <Link key={id} href={`/quests/${id}`} className="pill"><Lock aria-hidden="true" />{getQuest(id)?.title}</Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="detail__aside">
          <section className="glass pad-lg stack-4" aria-labelledby="status" style={{ display: "grid", gap: 16 }}>
            <div className="row row--between">
              <h2 id="status" className="label">Status</h2>
              <QuestStatusPill quest={quest} connected={connected} />
            </div>

            {!connected ? (
              <>
                <p className="body-sm muted">Connect a wallet to check whether you&apos;ve completed this quest.</p>
                <button className="btn btn--blue btn--block" onClick={() => wallet.connect()} disabled={wallet.connecting}>
                  {wallet.connecting ? "Check your wallet…" : "Connect wallet"}
                </button>
                <Status tone="error">{wallet.error}</Status>
              </>
            ) : quest.status === "completed" ? (
              <>
                <p className="check check--ok"><Check aria-hidden="true" /> Recorded on your passport</p>
                <Link href="/passport" className="btn btn--secondary btn--block">View passport <ArrowRight aria-hidden="true" /></Link>
              </>
            ) : quest.status === "locked" ? (
              <p className="body-sm muted">Record the required quests first. This one unlocks automatically.</p>
            ) : quest.status === "claimable" ? (
              recordingEnabled ? (
                <>
                  <p className="body-sm muted">You&apos;ve done it. Record it on Arc — Arcway pays the network fee.</p>
                  {state.phase !== "recorded" && (
                    <button className="btn btn--blue btn--block" onClick={() => claim(quest.id)} disabled={busy} aria-busy={busy}>
                      {busy ? "Recording…" : `Record +${quest.xp} XP`}
                    </button>
                  )}
                </>
              ) : (
                <p className="body-sm muted">Done. Passport recording opens soon; you&apos;ll be able to record this then.</p>
              )
            ) : (
              <>
                <p className="body-sm muted">{quest.checking ? "Checking your activity…" : reasons[quest.id] ?? quest.howTo}</p>
                {todoCta}
                <button className="btn btn--ghost btn--block" onClick={() => progress.refetch()} disabled={progress.isFetching}>
                  <RefreshCw aria-hidden="true" className={progress.isFetching ? "spin" : undefined} /> Check again
                </button>
              </>
            )}

            <TransactionStatus state={state} onRetry={() => claim(quest.id)} />
          </section>

          {nextQuest && (
            <Link href={`/quests/${nextQuest.id}`} className="surface interactive pad row row--between" style={{ marginTop: 20 }}>
              <span>
                <span className="label">Next quest</span>
                <span className="title" style={{ display: "block", marginTop: 6 }}>{nextQuest.title}</span>
              </span>
              <ArrowRight aria-hidden="true" style={{ width: 18, color: "var(--aw-muted)" }} />
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
