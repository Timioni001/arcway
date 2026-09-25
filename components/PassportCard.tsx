'use client';

import { PASSPORT_ADDRESS, explorer } from "../lib/config";
import { formatUsdc } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { SECTIONS } from "../lib/hooks/actions";
import { TOTAL_XP } from "../lib/quests";
import { ExternalLink } from "./Status";

const MARK = { completed: "●", claimable: "◐", todo: "○", locked: "○" } as const;
const LABEL = { completed: "recorded", claimable: "ready to record", todo: "to do", locked: "locked" } as const;

export function PassportCard() {
  const { connection, quests, xp, xpSource, balance, progress } = useArcwayState();
  const connected = connection.status === "connected";

  return (
    <aside className="card" id={SECTIONS.passport} aria-labelledby="passport-title">
      <div className="muted small" id="passport-title">{connected ? "YOUR PASSPORT" : "PASSPORT PREVIEW"}</div>
      <div style={{ marginTop: 28 }}>
        <div className="stat" aria-live="polite">
          {connected && progress.isPending ? "…" : xp} XP
        </div>
        <div className="muted small">
          {connected
            ? `of ${TOTAL_XP} XP on the starter path${xpSource === "derived" && PASSPORT_ADDRESS ? " · syncing" : ""}`
            : "Connect a wallet to see yours"}
        </div>
        {connected && (
          <div className="muted small" style={{ marginTop: 8 }}>
            Balance: {balance.data === undefined ? (balance.isError ? "unavailable" : "…") : formatUsdc(balance.data)}
          </div>
        )}
      </div>
      <ul className="small" style={{ marginTop: 28, padding: 0, listStyle: "none" }}>
        {quests.map((q) => (
          <li key={q.id} style={{ marginTop: 12 }}>
            <span aria-hidden="true">{connected ? MARK[q.status] : "○"} </span>
            {q.title}
            {connected && <span className="visually-hidden"> — {LABEL[q.status]}</span>}
          </li>
        ))}
      </ul>
      {connected && PASSPORT_ADDRESS && (
        <div className="muted small" style={{ marginTop: 20 }}>
          Stored on Arc · <ExternalLink href={explorer.address(PASSPORT_ADDRESS)}>view contract</ExternalLink>
        </div>
      )}
      {progress.isError && connected && (
        <div className="muted small" role="alert" style={{ marginTop: 20 }}>
          Couldn't load progress. <button className="button secondary" onClick={() => progress.refetch()}>Retry</button>
        </div>
      )}
    </aside>
  );
}
