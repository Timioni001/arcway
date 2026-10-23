'use client';

import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { erc20Abi, type Address, type Hash } from "viem";
import { useGasPrice, usePublicClient, useWriteContract } from "wagmi";
import { BRIDGE_URL, IS_MAINNET, NETWORK_NAME, PAY_CONTRACT, USDC_ADDRESS, arcChain, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { FEE_ACTIONS, feeUsd, formatUsd } from "../lib/fees";
import { formatUsdc, shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useToast } from "../lib/hooks/toast";
import { useWallet } from "../lib/hooks/useWallet";
import { noteForContract, parseAmount, payLinkId } from "../lib/pay";
import { payAbi } from "../lib/payAbi";
import { CELEBRATE_EVENT } from "./Celebrate";
import { AddressAvatar } from "./AddressAvatar";

type Phase =
  | { kind: "idle" }
  | { kind: "wallet"; step?: "approve" | "pay" }
  | { kind: "confirming"; hash: Hash }
  | { kind: "done"; hash: Hash; seconds: number }
  | { kind: "error"; message: string; hash?: Hash };

/** Pay a link: connect → right network → enough USDC → confirm → confirmed on Arc. */
export function PayCheckout({ to, amount: fixed, note }: { to: Address; amount?: string; note: string }) {
  const { connection, onArc, balance, refetchAll } = useArcwayState();
  const wallet = useWallet();
  const client = usePublicClient({ chainId: arcChain.id });
  const queryClient = useQueryClient();
  const toast = useToast();
  const { writeContractAsync } = useWriteContract();
  const gasPrice = useGasPrice({ chainId: arcChain.id });
  const [amountText, setAmountText] = useState(fixed ?? "");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const amountId = useId();

  const amt = parseAmount(amountText);
  const connected = connection.status === "connected";
  const isSelf = connection.address?.toLowerCase() === to.toLowerCase();
  const short = balance.data !== undefined && amt.ok && balance.data < amt.value;
  const busy = phase.kind === "wallet" || phase.kind === "confirming";
  const fee = gasPrice.data !== undefined ? feeUsd(FEE_ACTIONS[0].gas, gasPrice.data) : undefined;

  const send = async () => {
    if (!amt.ok || !client) return;
    setPhase({ kind: "wallet" });
    let hash: Hash | undefined;
    try {
      if (PAY_CONTRACT && connection.address) {
        // Through ArcwayPay: approve exactly this amount if needed, then pay with an onchain receipt.
        const allowance = await client.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "allowance", args: [connection.address, PAY_CONTRACT] });
        if (allowance < amt.value) {
          setPhase({ kind: "wallet", step: "approve" });
          const approval = await writeContractAsync({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [PAY_CONTRACT, amt.value], chainId: arcChain.id });
          const ok = await client.waitForTransactionReceipt({ hash: approval, timeout: 60_000 });
          if (ok.status !== "success") throw new Error("The approval didn't go through. No USDC moved.");
        }
        setPhase({ kind: "wallet", step: "pay" });
        const memo = noteForContract(note);
        hash = await writeContractAsync({ address: PAY_CONTRACT, abi: payAbi, functionName: "pay", args: [to, amt.value, payLinkId(to, fixed ? amt.value : undefined, memo), memo], chainId: arcChain.id });
      } else {
        hash = await writeContractAsync({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "transfer", args: [to, amt.value], chainId: arcChain.id });
      }
      const t0 = performance.now();
      setPhase({ kind: "confirming", hash });
      const receipt = await client.waitForTransactionReceipt({ hash, timeout: 60_000 });
      if (receipt.status !== "success") throw new Error("The payment was reverted. No USDC left your wallet.");
      const seconds = (performance.now() - t0) / 1000;
      setPhase({ kind: "done", hash, seconds });
      toast(`Sent ${amt.text} USDC`);
      window.dispatchEvent(new Event(CELEBRATE_EVENT));
      await queryClient.invalidateQueries({ queryKey: ["arcway"] });
      refetchAll();
    } catch (e) {
      setPhase({ kind: "error", message: humanizeError(e), hash });
    }
  };

  let action: React.ReactNode;
  if (phase.kind === "done") {
    action = null;
  } else if (!connected) {
    action = <button className="btn btn--primary btn--block btn--lg" onClick={() => wallet.connect()} disabled={wallet.connecting}>{wallet.connecting ? "Confirm in wallet…" : "Connect wallet to pay"}</button>;
  } else if (!onArc) {
    action = <button className="btn btn--primary btn--block btn--lg" onClick={wallet.switchToArc} disabled={wallet.switching}>{wallet.switching ? "Confirm in wallet…" : `Switch to ${NETWORK_NAME}`}</button>;
  } else if (short) {
    action = <a className="btn btn--secondary btn--block btn--lg" href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">Not enough USDC · Get USDC <ArrowUpRight aria-hidden="true" /></a>;
  } else {
    action = (
      <button className="btn btn--primary btn--block btn--lg" onClick={send} disabled={!amt.ok || busy} aria-busy={busy}>
        {phase.kind === "wallet" ? (phase.step === "approve" ? "Approve USDC in your wallet (1 of 2)…" : phase.step === "pay" ? "Confirm the payment (2 of 2)…" : "Confirm in your wallet…") : phase.kind === "confirming" ? "Sending…" : amt.ok ? `Send ${amt.text} USDC` : "Enter an amount"}
      </button>
    );
  }

  return (
    <div className="checkout card">
      <div className="checkout__head">
        <AddressAvatar address={to} size="lg" />
        <div style={{ minWidth: 0 }}>
          <h1 className="checkout__title"><span className="label">Pay</span><span className="h4 mono">{shortAddress(to)}</span></h1>
          <Link href={`/passport/${to}`} className="link xs">View their passport</Link>
        </div>
      </div>

      <div className="checkout__amount">
        {fixed ? (
          <div className="checkout__big"><span className="mono">{fixed}</span> <span className="secondary">USDC</span></div>
        ) : (
          <>
            <label htmlFor={amountId} className="label">Amount</label>
            <div className="amount-input amount-input--lg">
              <input id={amountId} className="input" inputMode="decimal" value={amountText} onChange={(e) => setAmountText(e.target.value)} placeholder="0.00" autoComplete="off" disabled={busy || phase.kind === "done"} />
              <span className="amount-input__unit">USDC</span>
            </div>
            {amountText && !amt.ok && <p className="field__error" role="alert">{amt.error}</p>}
          </>
        )}
        {note && <p className="checkout__note">“{note}”</p>}
      </div>

      <dl className="facts checkout__facts">
        <div><dt>Network</dt><dd>{NETWORK_NAME}</dd></div>
        <div><dt>Network fee</dt><dd className="mono">{fee !== undefined ? `about ${formatUsd(fee)}` : "—"}</dd></div>
        {connected && <div><dt>Your balance</dt><dd className="mono">{balance.data !== undefined ? formatUsdc(balance.data) : "…"}</dd></div>}
      </dl>

      {isSelf && phase.kind !== "done" && <p className="xs secondary">This is your own address. Share the link with someone else to get paid.</p>}
      {IS_MAINNET && phase.kind === "idle" && <p className="xs secondary">This sends real USDC and can&apos;t be reversed.</p>}

      {action}
      {wallet.error && <p className="field__error" role="alert">{wallet.error}</p>}

      {phase.kind === "confirming" && (
        <div className="tx" role="status"><div className="tx__head"><LoaderCircle className="spin" style={{ color: "var(--primary)" }} aria-hidden="true" />Confirming on Arc…</div>
          <a className="link small" href={explorer.tx(phase.hash)} target="_blank" rel="noopener noreferrer" style={{ marginTop: 8 }}>View transaction <ArrowUpRight aria-hidden="true" /></a></div>
      )}
      {phase.kind === "done" && (
        <div className="tx checkout__done" data-tone="ok" role="status">
          <div className="tx__head"><CircleCheck style={{ color: "var(--success)" }} aria-hidden="true" />Paid {amt.ok ? `${amt.text} USDC` : ""}</div>
          <p className="small secondary" style={{ marginTop: 6 }}><Zap aria-hidden="true" style={{ width: 14, display: "inline", verticalAlign: -2, color: "var(--primary)" }} /> Confirmed on Arc in <b className="mono">{phase.seconds.toFixed(1)}s</b>.</p>
          <div className="row" style={{ marginTop: 10, gap: 16 }}>
            <a className="link small" href={explorer.tx(phase.hash)} target="_blank" rel="noopener noreferrer">{PAY_CONTRACT ? "Onchain receipt" : "Receipt"} <ArrowUpRight aria-hidden="true" /></a>
            <Link className="link small" href="/quests">Claim XP for your first transaction</Link>
          </div>
        </div>
      )}
      {phase.kind === "error" && (
        <div className="tx" data-tone="error" role="alert">
          <div className="tx__head"><CircleAlert style={{ color: "var(--error)" }} aria-hidden="true" />Payment didn&apos;t go through</div>
          <p className="small secondary" style={{ marginTop: 6 }}>{phase.message}</p>
          <button className="btn btn--secondary btn--sm" style={{ marginTop: 10 }} onClick={() => setPhase({ kind: "idle" })}>Try again</button>
        </div>
      )}
    </div>
  );
}
