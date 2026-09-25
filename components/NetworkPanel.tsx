'use client';

import { useBlockNumber } from "wagmi";
import { NETWORK_NAME, arcChain } from "../lib/config";
import { NextStep } from "./NextStep";

/** The selective dark panel. Only real network data; unavailable stays unavailable. */
export function NetworkPanel() {
  const block = useBlockNumber({ chainId: arcChain.id, watch: true });
  const live = block.data !== undefined && !block.isError;

  return (
    <section className="panel" aria-labelledby="network-panel">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h2 id="network-panel" className="label">Arc network</h2>
        <span className="panel__live" data-state={live ? "on" : "off"}>
          <i aria-hidden="true" />{live ? "Live" : block.isError ? "Offline" : "Connecting…"}
        </span>
      </div>
      <div className="panel__row"><span>Network</span><span>{NETWORK_NAME}</span></div>
      <div className="panel__row"><span>Chain ID</span><span className="mono">{arcChain.id}</span></div>
      <div className="panel__row">
        <span>Latest block</span>
        {live ? (
          <span className="mono" aria-live="off">#{block.data!.toLocaleString("en-US")}</span>
        ) : block.isError ? (
          <span style={{ color: "#A7B8D0" }}>Unavailable</span>
        ) : (
          <span className="skeleton" style={{ width: 90, height: 14 }} aria-label="Loading" />
        )}
      </div>
      <div className="panel__row"><span>Gas</span><span>USDC</span></div>
      <NextStep variant="panel" />
    </section>
  );
}
