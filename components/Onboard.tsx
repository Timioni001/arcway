'use client';

import { useState } from "react";
import { BRIDGE_URL, IS_MAINNET, arcChain } from "../lib/config";
import { formatUsdc } from "../lib/format";
import { SECTIONS, goToSection } from "../lib/hooks/actions";
import { useArcwayState } from "../lib/hooks/context";
import { ExternalLink, Status } from "./Status";

/** The three-step path: bring USDC → explore → build your record, with live state per step. */
export function Onboard() {
  const { connection, balance, txCount, journey } = useArcwayState();
  const [copied, setCopied] = useState(false);
  const connected = connection.status === "connected";
  const funded = (balance.data ?? 0n) > 0n;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(connection.address!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="grid">
      <div className="card" id={SECTIONS.onboard} aria-labelledby="step-usdc">
        <b id="step-usdc">01 · Bring USDC {connected && funded && <span aria-label="done">✓</span>}</b>
        <p className="muted">
          {connected && balance.data !== undefined
            ? `You have ${formatUsdc(balance.data)} on ${arcChain.name}.`
            : "Arc uses USDC for gas. Move USDC in with Circle's cross-chain infrastructure."}
        </p>
        <ExternalLink href={BRIDGE_URL}>{IS_MAINNET ? "Bring USDC with Circle CCTP" : "Get test USDC from Circle's faucet"}</ExternalLink>
        {connected && (
          <div style={{ marginTop: 12 }}>
            <button className="button secondary" onClick={copyAddress}>
              {copied ? "Address copied" : "Copy my address"}
            </button>
            <Status>{copied ? `Paste it as the ${arcChain.name} destination.` : null}</Status>
          </div>
        )}
      </div>
      <div className="card" aria-labelledby="step-explore">
        <b id="step-explore">02 · Explore {connected && (txCount.data ?? 0) > 0 && <span aria-label="done">✓</span>}</b>
        <p className="muted">Find useful apps by what you want to do, not by scrolling a directory.</p>
        <button className="button secondary" onClick={() => goToSection(SECTIONS.discover, "input")}>Browse apps</button>
      </div>
      <div className="card" aria-labelledby="step-record">
        <b id="step-record">03 · Build your record</b>
        <p className="muted">
          {connected
            ? `${journey.done} of ${journey.total} starter quests recorded on your passport.`
            : "Complete verified quests and accumulate reputation."}
        </p>
        <button className="button secondary" onClick={() => goToSection(SECTIONS.quests)}>See quests</button>
      </div>
    </div>
  );
}
