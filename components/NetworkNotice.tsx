'use client';

import { TriangleAlert } from "lucide-react";
import { NETWORK_NAME, arcChain } from "../lib/config";
import { useWallet } from "../lib/hooks/useWallet";
import { Status } from "./Status";

/** Explains the wrong-network state and offers an explicit, never-silent switch. */
export function NetworkNotice() {
  const wallet = useWallet();
  const { connection } = wallet;
  if (connection.status !== "connected" || connection.chainId === arcChain.id) return null;

  return (
    <div className="container">
      <div className="notice" role="region" aria-label="Network">
        <TriangleAlert aria-hidden="true" />
        <div className="notice__body">
          <div style={{ fontWeight: 600 }}>Your wallet is on another network</div>
          <div className="body-sm muted">
            You can browse and see progress. Switch to {NETWORK_NAME} (<span className="mono">{arcChain.id}</span>) when you&apos;re ready to transact.
          </div>
          <Status tone="error">{wallet.error}</Status>
        </div>
        <button className="btn btn--blue btn--sm" onClick={wallet.switchToArc} disabled={wallet.switching} aria-busy={wallet.switching}>
          {wallet.switching ? "Approve in wallet…" : "Switch to Arc"}
        </button>
      </div>
    </div>
  );
}
