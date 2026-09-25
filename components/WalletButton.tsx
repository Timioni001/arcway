'use client';

import { useEffect, useState } from "react";
import { arcChain } from "../lib/config";
import { shortAddress } from "../lib/format";
import { useWallet } from "../lib/hooks/useWallet";
import { Status } from "./Status";

export function WalletButton() {
  const wallet = useWallet();
  const { connection } = wallet;
  const [picking, setPicking] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();

  // Avoid a flash of "Connect" while wagmi restores a previous session.
  if (!mounted || connection.status === "reconnecting") {
    return <div className="pill small" aria-busy="true">Loading wallet…</div>;
  }

  if (connection.status === "connected" && connection.address) {
    const onArc = connection.chainId === arcChain.id;
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(connection.address!);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* clipboard blocked: address is still visible in the title */
      }
    };
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <span className="pill small">{onArc ? arcChain.name : "Wrong network"}</span>
        <button className="button secondary" onClick={copy} title={connection.address} aria-label={`Copy address ${connection.address}`}>
          {copied ? "Copied" : shortAddress(connection.address)}
        </button>
        <button className="button secondary" onClick={wallet.disconnect}>Disconnect</button>
      </div>
    );
  }

  const multiple = wallet.connectors.length > 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {picking && multiple ? (
          <>
            {wallet.connectors.map((c) => (
              <button key={c.uid} className="button secondary" disabled={wallet.connecting} onClick={() => wallet.connect(c.id)}>
                {c.name}
              </button>
            ))}
            <button className="button secondary" onClick={() => setPicking(false)}>Cancel</button>
          </>
        ) : (
          <button
            className="button"
            disabled={wallet.connecting}
            aria-busy={wallet.connecting}
            onClick={() => (multiple ? setPicking(true) : wallet.connect())}
          >
            {wallet.connecting ? "Check your wallet…" : "Connect wallet"}
          </button>
        )}
      </div>
      <Status tone="error">{wallet.error}</Status>
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
