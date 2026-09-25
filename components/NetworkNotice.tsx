'use client';

import { arcChain, IS_MAINNET } from "../lib/config";
import { useWallet } from "../lib/hooks/useWallet";
import { Status } from "./Status";

/** Explains which network the user is on and offers an explicit, never-silent switch. */
export function NetworkNotice() {
  const wallet = useWallet();
  const { connection } = wallet;
  if (connection.status !== "connected") return null;

  if (connection.chainId !== arcChain.id) {
    return (
      <div className="card" role="region" aria-label="Network" style={{ marginBottom: 24 }}>
        <b>Your wallet is on a different network</b>
        <p className="muted small">
          Arcway works on {arcChain.name} (chain {arcChain.id}). You can still browse and see your progress; switch when
          you're ready to make a transaction.
        </p>
        <button className="button" onClick={wallet.switchToArc} disabled={wallet.switching} aria-busy={wallet.switching}>
          {wallet.switching ? "Approve in your wallet…" : `Switch to ${arcChain.name}`}
        </button>
        <Status tone="error">{wallet.error}</Status>
      </div>
    );
  }

  if (IS_MAINNET) {
    return (
      <p className="muted small" style={{ marginTop: -24, marginBottom: 24 }}>
        You're on {arcChain.name}. Transactions use real USDC and can't be reversed.
      </p>
    );
  }
  return null;
}
