'use client';

import { ArrowUpRight, Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { IS_MAINNET, NETWORK_NAME, arcChain, explorer } from "../lib/config";
import { formatUsdc, shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useWallet } from "../lib/hooks/useWallet";
import { Status } from "./Status";

export function WalletButton() {
  const wallet = useWallet();
  const { balance } = useArcwayState();
  const { connection } = wallet;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape; return focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the picker once a connection lands.
  useEffect(() => {
    if (connection.status === "connected") setOpen(false);
  }, [connection.status]);

  if (!mounted || connection.status === "reconnecting") {
    return <span className="btn btn--secondary btn--sm shimmer" style={{ width: 140 }} aria-label="Loading wallet" />;
  }

  const connected = connection.status === "connected" && connection.address;
  const onArc = connection.chainId === arcChain.id;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(connection.address!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the address is visible */
    }
  };

  const multiple = wallet.connectors.length > 1;

  return (
    <div className="wallet" ref={rootRef}>
      {connected ? (
        <button
          ref={triggerRef}
          className="btn btn--secondary btn--sm wallet__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="wallet__dot" data-wrong={!onArc} aria-hidden="true" />
          <span className="mono" style={{ fontSize: 13 }}>{shortAddress(connection.address!)}</span>
          <span className="wallet__net muted">{onArc ? "Arc" : "Wrong network"}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      ) : (
        <button
          ref={triggerRef}
          className="btn btn--secondary btn--sm"
          disabled={wallet.connecting}
          aria-busy={wallet.connecting}
          aria-expanded={multiple ? open : undefined}
          aria-controls={multiple ? panelId : undefined}
          onClick={() => (multiple ? setOpen((o) => !o) : wallet.connect())}
        >
          <Wallet aria-hidden="true" />
          {wallet.connecting ? "Check wallet…" : "Connect wallet"}
        </button>
      )}

      {open && (
        <div className="wallet__panel" id={panelId} ref={panelRef} role="dialog" aria-label="Wallet">
          {connected ? (
            <>
              <div className="wallet__row">
                <div className="stack-2">
                  <div className="label">Wallet</div>
                  <div className="mono" style={{ fontSize: 14 }}>{shortAddress(connection.address!)}</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={copy} aria-label="Copy address">
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="wallet__row">
                <div className="stack-2">
                  <div className="label">Network</div>
                  <div className="body-sm">{onArc ? NETWORK_NAME : <>Other network <span className="mono muted">({connection.chainId})</span></>}</div>
                </div>
                {onArc ? (
                  <span className="mono muted">{arcChain.id}</span>
                ) : (
                  <button className="btn btn--blue btn--sm" onClick={wallet.switchToArc} disabled={wallet.switching}>
                    {wallet.switching ? "Approve…" : "Switch to Arc"}
                  </button>
                )}
              </div>
              <div className="wallet__row">
                <div className="stack-2">
                  <div className="label">USDC</div>
                  <div className="mono-lg" style={{ fontSize: 20 }}>
                    {balance.data === undefined ? (balance.isError ? "Unavailable" : "…") : formatUsdc(balance.data, { symbol: false })}
                  </div>
                </div>
                <a className="link body-sm" href={explorer.address(connection.address!)} target="_blank" rel="noopener noreferrer">
                  Explorer <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
              {IS_MAINNET && <p className="body-sm muted" style={{ marginTop: 8 }}>Mainnet uses real USDC. Transactions can't be reversed.</p>}
              <Status tone="error">{wallet.error}</Status>
              <button className="btn btn--secondary btn--block" style={{ marginTop: 16 }} onClick={() => { setOpen(false); wallet.disconnect(); }}>
                <LogOut aria-hidden="true" /> Disconnect
              </button>
            </>
          ) : (
            <div className="stack-3">
              <div className="label">Choose a wallet</div>
              {wallet.connectors.map((c) => (
                <button key={c.uid} className="btn btn--secondary btn--block" style={{ justifyContent: "flex-start" }} disabled={wallet.connecting} onClick={() => wallet.connect(c.id)}>
                  {c.icon ? <img src={c.icon} alt="" width={20} height={20} style={{ borderRadius: 5 }} /> : <Wallet aria-hidden="true" />}
                  {c.name}
                </button>
              ))}
              <p className="body-sm muted">Connecting only shares your address. It never moves funds.</p>
            </div>
          )}
        </div>
      )}
      {!open && !connected && wallet.error && (
        <div className="wallet__panel" role="alert">
          <p className="body-sm">{wallet.error}</p>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={wallet.clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
