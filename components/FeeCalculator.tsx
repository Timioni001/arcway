'use client';

import { useId, useState } from "react";
import { useGasPrice } from "wagmi";
import { arcChain } from "../lib/config";
import { FEE_ACTIONS, feeUsd, formatUsd, type FeeActionId } from "../lib/fees";

/** "What does it cost on Arc?" Live network price × typical gas for an action. */
export function FeeCalculator() {
  const gasPrice = useGasPrice({ chainId: arcChain.id, query: { refetchInterval: 30_000 } });
  const [action, setAction] = useState<FeeActionId>("send");
  const [times, setTimes] = useState(10);
  const sliderId = useId();
  const a = FEE_ACTIONS.find((x) => x.id === action)!;
  const price = gasPrice.data;
  const one = price !== undefined ? feeUsd(a.gas, price) : undefined;
  const total = price !== undefined ? feeUsd(a.gas, price, times) : undefined;

  return (
    <section className="card pad fee" aria-labelledby="fee-title">
      <div className="row between">
        <h2 id="fee-title" className="h4">What things cost on Arc</h2>
        <span className="xs secondary">Fees are paid in USDC</span>
      </div>
      <div className="filters" role="group" aria-label="Action" style={{ marginTop: 16 }}>
        {FEE_ACTIONS.map((x) => (
          <button key={x.id} className="chip" aria-pressed={x.id === action} onClick={() => setAction(x.id)}>{x.label}</button>
        ))}
      </div>
      <div className="fee__row">
        <div>
          <div className="xs secondary">One time</div>
          <div className="fee__value mono" aria-live="polite">{one === undefined ? (gasPrice.isError ? "—" : "…") : formatUsd(one)}</div>
        </div>
        <div>
          <div className="xs secondary">{times.toLocaleString("en-US")} times</div>
          <div className="fee__value mono fee__value--total" aria-live="polite">{total === undefined ? (gasPrice.isError ? "—" : "…") : formatUsd(total)}</div>
        </div>
      </div>
      <label htmlFor={sliderId} className="visually-hidden">How many times</label>
      <input
        id={sliderId}
        className="range"
        type="range"
        min={1}
        max={1000}
        step={1}
        value={times}
        onChange={(e) => setTimes(Number(e.target.value))}
        style={{ "--fill": `${((times - 1) / 999) * 100}%` } as React.CSSProperties}
      />
      <p className="xs secondary" style={{ marginTop: 10 }}>
        {gasPrice.isError ? "Live price unavailable right now." : "Live network price × typical usage. Estimates; the exact fee shows in your wallet."}
      </p>
    </section>
  );
}
