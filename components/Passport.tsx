'use client';

import { ArrowRight, ArrowUpRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PASSPORT_ADDRESS, explorer } from "../lib/config";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useCountUp } from "../lib/hooks/useCountUp";
import { levelFor } from "../lib/levels";
import { TOTAL_XP } from "../lib/quests";
import { visitedApps } from "../lib/visited";

/** Collectible-but-not-NFT passport object (§18). */
export function PassportVisual() {
  const { xp, connection } = useArcwayState();
  const shownXp = useCountUp(xp);
  const level = levelFor(xp);
  return (
    <div className="passport" data-level={level.index} aria-label={`Passport: ${level.name}, ${xp} XP`}>
      <div className="row row--between" style={{ width: "100%" }}>
        <span className="label" style={{ color: "var(--aw-ice)" }}>Arcway</span>
        <span className="mono muted">{connection.address ? shortAddress(connection.address) : "0x····"}</span>
      </div>
      <div className="passport__orb" aria-hidden="true"><i /><i /><i /></div>
      <div className="stack-2">
        <div className="label" style={{ color: "var(--aw-sky)" }}>{level.name}</div>
        <div className="passport__xp mono-lg">{String(shownXp).padStart(3, "0")} XP</div>
      </div>
      <div className="mono muted" style={{ marginTop: 16 }}>
        {PASSPORT_ADDRESS ? `Passport ${shortAddress(PASSPORT_ADDRESS)}` : "Passport · recording opens soon"}
      </div>
    </div>
  );
}

/** Progress identity: level, XP bar, counts (§17). No balances, no rankings. */
export function PassportSummary({ compact = false }: { compact?: boolean }) {
  const { xp, xpSource, quests, txCount, connection, progress } = useArcwayState();
  const [opened, setOpened] = useState(0);
  useEffect(() => setOpened(visitedApps().length), []);
  const level = levelFor(xp);
  const recorded = quests.filter((q) => q.status === "completed").length;
  const connected = connection.status === "connected";

  return (
    <div className="surface surface--lg pad-lg stack-5" style={{ display: "flex", flexDirection: "column" }}>
      <div className="row row--between">
        <span className="label">{connected ? "Your progress" : "Passport"}</span>
        {connected && xpSource === "onchain" && PASSPORT_ADDRESS && (
          <a className="link body-sm" href={explorer.address(PASSPORT_ADDRESS)} target="_blank" rel="noopener noreferrer">
            Read onchain <ArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
      <div>
        <div className="display mono-lg" style={{ fontWeight: 500 }}>{connected && progress.isPending ? "—" : xp.toLocaleString("en-US")} <span className="muted" style={{ fontSize: "0.5em" }}>XP</span></div>
        <div className="body-sm muted" style={{ marginTop: 8 }}>
          {level.next ? `${level.next.min - xp} XP to ${level.next.name}` : "Top level reached"} · {TOTAL_XP} XP on the starter path
        </div>
      </div>
      <div className="xp-bar" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
        <i style={{ width: `${Math.max(2, level.progress * 100)}%` }} />
      </div>
      <div className="stats">
        <div><div className="mono-lg">{recorded}</div><div className="body-sm muted">quests recorded</div></div>
        <div><div className="mono-lg">{txCount.data ?? (connected ? "—" : 0)}</div><div className="body-sm muted">Arc transactions</div></div>
        <div><div className="mono-lg">{opened}</div><div className="body-sm muted">apps opened</div></div>
      </div>
      {!compact ? null : (
        <div style={{ marginTop: "auto" }}>
          <Link href="/passport" className="btn btn--secondary">Open passport <ArrowRight aria-hidden="true" /></Link>
        </div>
      )}
      {!connected && (
        <p className="body-sm muted"><Wallet aria-hidden="true" style={{ display: "inline", width: 14, verticalAlign: -2 }} /> Connect a wallet to load your passport.</p>
      )}
    </div>
  );
}
