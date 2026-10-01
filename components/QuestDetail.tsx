'use client';

import { ArrowRight, ArrowUpRight, Lock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BRIDGE_URL, NETWORK_NAME } from "../lib/config";
import { useClaims } from "../lib/hooks/claims";
import { useArcwayState } from "../lib/hooks/context";
import { useWallet } from "../lib/hooks/useWallet";
import { getQuest, questProgress, timeLabel, type QuestRequirement } from "../lib/quests";
import { QuestBadge, questNumber } from "./Quests";
import { Status } from "./Status";
import { TransactionStatus } from "./TransactionStatus";

function requirement(req: QuestRequirement): string {
  switch (req.kind) {
    case "hold-usdc": return `At least ${Number(req.minAmount / 1_000_000n)} USDC in your wallet on ${NETWORK_NAME}.`;
    case "first-transaction": return `At least one payment or swap from your wallet on ${NETWORK_NAME}.`;
    case "app-interaction": return "One completed action in a verified app.";
    case "tx-count": return `At least ${req.min} transactions from your wallet on ${NETWORK_NAME}.`;
    case "active-days": return `Successful transactions on ${req.min} different days (UTC). They don't need to be in a row.`;
    case "app-actions": return `${req.min} successful actions in verified apps.`;
    case "complete-quests": return `These quests claimed first: ${req.questIds.map((id) => getQuest(id)?.title ?? id).join(", ")}.`;
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
  const pct = Math.round(questProgress(quest) * 100);

  let action: React.ReactNode;
  if (!connected) {
    action = (
      <>
        <button className="btn btn--primary btn--block" onClick={() => wallet.connect()} disabled={wallet.connecting}>
          {wallet.connecting ? "Confirm in wallet…" : "Connect wallet"}
        </button>
        <Status tone="error">{wallet.error}</Status>
      </>
    );
  } else if (quest.status === "completed") {
    action = <Link href="/passport" className="btn btn--secondary btn--block">View passport <ArrowRight aria-hidden="true" /></Link>;
  } else if (quest.status === "locked") {
    action = <p className="small secondary">Unlocks when you claim the quests above.</p>;
  } else if (quest.status === "claimable") {
    action = recordingEnabled ? (
      state.phase !== "recorded" && (
        <button className="btn btn--primary btn--block" onClick={() => claim(quest.id)} disabled={busy} aria-busy={busy}>
          {busy ? "Claiming…" : `Claim ${quest.xp} XP`}
        </button>
      )
    ) : <p className="small secondary">Done! Claiming XP opens soon.</p>;
  } else {
    action = (
      <>
        {quest.requirement.kind === "hold-usdc" ? (
          <a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--block">Get USDC <ArrowUpRight aria-hidden="true" /></a>
        ) : quest.requirement.kind !== "complete-quests" ? (
          <Link href="/apps" className="btn btn--primary btn--block">Find an app <ArrowRight aria-hidden="true" /></Link>
        ) : null}
        <button className="btn btn--ghost btn--block" onClick={() => progress.refetch()} disabled={progress.isFetching}>
          <RefreshCw aria-hidden="true" className={progress.isFetching ? "spin" : undefined} /> Check again
        </button>
      </>
    );
  }

  return (
    <>
      <header style={{ marginTop: 28, maxWidth: 720 }}>
        <span className="label">Quest {questNumber(quest.id)}</span>
        <h1 className="h1" style={{ marginTop: 10 }}>{quest.title}</h1>
        <div className="row" style={{ marginTop: 16 }}>
          <span className="badge mono">+{quest.xp} XP</span>
          {connected && <QuestBadge quest={quest} />}
          <span className="tag" style={{ textTransform: "capitalize" }}>{quest.difficulty}</span>
          <span className="tag mono">{timeLabel(quest)}</span>
        </div>
      </header>

      <div className="detail">
        <div style={{ display: "grid", gap: 20 }}>
          <section className="card pad-lg" aria-labelledby="objective">
            <h2 id="objective" className="h4">Objective</h2>
            <p className="secondary" style={{ marginTop: 10 }}>{quest.description}</p>
          </section>
          <section className="card pad-lg" aria-labelledby="steps">
            <h2 id="steps" className="h4" style={{ marginBottom: 20 }}>Steps</h2>
            <ol className="steps">{quest.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          </section>
          <section className="card pad-lg" aria-labelledby="req">
            <h2 id="req" className="h4">What counts</h2>
            <p className="secondary" style={{ marginTop: 10 }}>{requirement(quest.requirement)} We check this automatically.</p>
            {quest.lockedBy.length > 0 && (
              <div className="row" style={{ marginTop: 14, gap: 8 }}>
                {quest.lockedBy.map((id) => (
                  <Link key={id} href={`/quests/${id}`} className="tag" style={{ gap: 6 }}><Lock aria-hidden="true" style={{ width: 13 }} />{getQuest(id)?.title}</Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="detail__aside">
          <section className="card pad" aria-labelledby="progress-title" style={{ display: "grid", gap: 14 }}>
            <div className="row between">
              <h2 id="progress-title" className="h4">Progress</h2>
              {connected && <span className="mono xs secondary">{pct}%</span>}
            </div>
            {connected && (
              <div className="progress" role="progressbar" aria-label="Quest progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
            )}
            {connected && quest.status === "todo" && !quest.checking && reasons[quest.id] && (
              <p className="small secondary">{reasons[quest.id]}</p>
            )}
            <div className="row between" style={{ padding: "12px 0", borderTop: "1px solid var(--border)" }}>
              <span className="small secondary">Reward</span>
              <span className="mono" style={{ fontWeight: 600, color: "var(--link)" }}>+{quest.xp} XP</span>
            </div>
            {action}
            <TransactionStatus state={state} onRetry={() => claim(quest.id)} />
          </section>
        </aside>
      </div>
    </>
  );
}
