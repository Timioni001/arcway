'use client';

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { isAddress, type Address } from "viem";
import { NOTE_MAX, buildPayPath, parseAmount } from "../lib/pay";
import { useArcwayState } from "../lib/hooks/context";
import { useWallet } from "../lib/hooks/useWallet";
import { QrCode } from "./QrCode";

const QUICK = ["5", "10", "25", "50"];

/** Make a link (and QR) anyone can use to pay you USDC on Arc. */
export function PayCreate() {
  const { connection } = useArcwayState();
  const wallet = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const ids = { to: useId(), amount: useId(), note: useId() };

  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => {
    if (connection.address && !to) setTo(connection.address);
  }, [connection.address, to]);

  const toOk = isAddress(to.trim());
  const amt = amount.trim() ? parseAmount(amount) : undefined;
  const ready = toOk && (!amt || amt.ok);
  const url = useMemo(
    () => (ready ? `${origin}${buildPayPath(to.trim() as Address, amt?.ok ? amt.text : undefined, note)}` : ""),
    [ready, origin, to, amt, note]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="pay-create">
      <form className="card pad-lg pay-form" onSubmit={(e) => e.preventDefault()}>
        <div className="field">
          <label htmlFor={ids.to}>Pay to</label>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input id={ids.to} className="input mono" value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x… your wallet address" spellCheck={false} autoComplete="off" aria-invalid={Boolean(to) && !toOk} />
            {connection.status !== "connected" && (
              <button type="button" className="btn btn--secondary" onClick={() => wallet.connect()} disabled={wallet.connecting}>Use my wallet</button>
            )}
          </div>
          {to && !toOk && <p className="field__error" role="alert">That doesn&apos;t look like a wallet address.</p>}
        </div>

        <div className="field">
          <label htmlFor={ids.amount}>Amount <span className="secondary">(optional, payer can choose)</span></label>
          <div className="amount-input">
            <input id={ids.amount} className="input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoComplete="off" aria-invalid={Boolean(amt && !amt.ok)} />
            <span className="amount-input__unit">USDC</span>
          </div>
          <div className="row" style={{ gap: 6, marginTop: 8 }}>
            {QUICK.map((q) => <button key={q} type="button" className="chip" aria-pressed={amount === q} onClick={() => setAmount(q)}>{q}</button>)}
          </div>
          {amt && !amt.ok && <p className="field__error" role="alert">{amt.error}</p>}
        </div>

        <div className="field">
          <label htmlFor={ids.note}>Note <span className="secondary">(optional)</span></label>
          <input id={ids.note} className="input" value={note} onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))} placeholder="Dinner, rent, thanks…" maxLength={NOTE_MAX} />
          <p className="xs secondary" style={{ marginTop: 6 }}>{note.length}/{NOTE_MAX}. Anyone with the link can see it.</p>
        </div>
      </form>

      <aside className="card pad-lg pay-preview" aria-live="polite">
        <div className="label">Your pay link</div>
        {url ? (
          <>
            <div className="pay-preview__amount">{amt?.ok ? <><b className="mono">{amt.text}</b> USDC</> : <span className="secondary">Payer chooses the amount</span>}</div>
            {note && <p className="secondary small">“{note.trim()}”</p>}
            <QrCode value={url} label="QR code for your pay link" />
            <div className="pay-preview__url mono xs" title={url}>{url.replace(/^https?:\/\//, "")}</div>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn btn--primary" onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}{copied ? "Copied" : "Copy link"}</button>
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button type="button" className="btn btn--secondary" onClick={() => navigator.share({ title: "Pay me on Arc", url }).catch(() => {})}><Share2 aria-hidden="true" />Share</button>
              )}
            </div>
          </>
        ) : (
          <p className="secondary small" style={{ marginTop: 12 }}>Add your wallet address to create a link.</p>
        )}
      </aside>
    </div>
  );
}
