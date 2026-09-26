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
  const [mounted, setMounted] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

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

  useEffect(() => {
    if (connection.status === "connected") setOpen(false);
  }, [connection.status]);

  if (!mounted || connection.status === "reconnecting") {
    return <span className="skeleton" style={{ width: 132, height: 38, borderRadius: 12 }} aria-label="Loading wallet" />;
  }

  const address = connection.status === "connected" ? connection.address : undefined;
  const onArc = connection.chainId === arcChain.id;
  const multiple = wallet.connectors.length > 1;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the address stays visible */
    }
  };

  return (
    <div className="wallet" ref={rootRef}>
      {address ? (
        <button ref={triggerRef} className="btn btn--secondary btn--sm" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <span className="wallet__dot" data-wrong={!onArc} aria-hidden="true" />
          <span className="mono">{shortAddress(address)}</span>
          <span className="visually-hidden">{onArc ? `, on ${NETWORK_NAME}` : ", wrong network"}</span>
          <ChevronDown aria-hidden="true" />
        </button>
      ) : (
        <button
          ref={triggerRef}
          className="btn btn--primary btn--sm"
          disabled={wallet.connecting}
          aria-busy={wallet.connecting}
          aria-expanded={multiple ? open : undefined}
          aria-controls={multiple ? panelId : undefined}
          onClick={() => (multiple ? setOpen((o) => !o) : wallet.connect())}
        >
          <Wallet aria-hidden="true" />
          {wallet.connecting ? "Confirm…" : <>Connect<span className="hide-sm"> wallet</span></>}
        </button>
      )}

      {open && (
        <div className="wallet__panel" id={panelId} ref={panelRef} role="dialog" aria-label="Wallet">
          {address ? (
            <>
              <div className="wallet__row">
                <div>
                  <div className="label">Wallet</div>
                  <div className="mono" style={{ marginTop: 4 }}>{shortAddress(address)}</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={copy} aria-label="Copy address">
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="wallet__row">
                <div>
                  <div className="label">Network</div>
                  <div className="small" style={{ marginTop: 4 }}>
                    {onArc ? NETWORK_NAME : <>Other network <span className="mono secondary">({connection.chainId})</span></>}
                  </div>
                </div>
                {!onArc && (
                  <button className="btn btn--primary btn--sm" onClick={wallet.switchToArc} disabled={wallet.switching}>
                    {wallet.switching ? "Confirm in wallet…" : "Switch to Arc"}
                  </button>
                )}
              </div>
              <div className="wallet__row">
                <div>
                  <div className="label">USDC</div>
                  <div className="mono" style={{ marginTop: 4, fontSize: 20, fontWeight: 600 }}>
                    {balance.data === undefined ? (balance.isError ? "Unavailable" : "…") : formatUsdc(balance.data, { symbol: false })}
                  </div>
                </div>
                <a className="link small" href={explorer.address(address)} target="_blank" rel="noopener noreferrer">
                  Explorer <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
              {IS_MAINNET && <p className="xs secondary">Mainnet uses real USDC.</p>}
              <Status tone="error">{wallet.error}</Status>
              <button className="btn btn--secondary btn--block" style={{ marginTop: 12 }} onClick={() => { setOpen(false); wallet.disconnect(); }}>
                <LogOut aria-hidden="true" /> Disconnect
              </button>
            </>
          ) : (
            <div className="stack" style={{ ["--gap" as string]: "10px" }}>
              <div className="label">Choose a wallet</div>
              {wallet.connectors.map((c) => (
                <button key={c.uid} className="btn btn--secondary btn--block" style={{ justifyContent: "flex-start" }} disabled={wallet.connecting} onClick={() => wallet.connect(c.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {c.icon ? <img src={c.icon} alt="" width={20} height={20} style={{ borderRadius: 5 }} /> : <Wallet aria-hidden="true" />}
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {!open && !address && wallet.error && (
        <div className="wallet__panel" role="alert">
          <p className="small">{wallet.error}</p>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={wallet.clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
