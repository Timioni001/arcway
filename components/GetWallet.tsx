'use client';

import { ArrowUpRight, Check, Copy, KeyRound, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useConnect, useConnectors } from "wagmi";
import { BRIDGE_URL, IS_MAINNET, NETWORK_NAME, PASSKEY_WALLETS, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { shortAddress } from "../lib/format";
import { passkeySignIn, passkeySupported, savedPasskey, type SavedPasskey } from "../lib/passkey";
import { PASSKEY_CONNECTOR_ID, forgetPasskeyWallet } from "../lib/passkeyConnector";
import { AddArcButton } from "./AddArcButton";
import { Status } from "./Status";

const APPS = [
  { name: "MetaMask", href: "https://metamask.io/download/", blurb: "The most widely used wallet app, for browser and phone." },
  { name: "Rabby", href: "https://rabby.io/", blurb: "A browser wallet that previews every transaction before you sign." },
  { name: "OKX Wallet", href: "https://web3.okx.com/download", blurb: "Browser and phone wallet with many networks built in." },
  { name: "Rainbow", href: "https://rainbow.me/download", blurb: "A friendly phone wallet with a browser extension." }
];

type Step = { state: "idle" } | { state: "working"; mode: "register" | "login" } | { state: "done"; wallet: SavedPasskey } | { state: "error"; message: string };

/** Passkey wallet (Circle Modular Wallets): create or sign in, then connect it to Arcway. */
function PasskeyCard() {
  const nameId = useId();
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>({ state: "idle" });
  const [supported, setSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  const connectors = useConnectors();
  const { connectAsync } = useConnect();

  useEffect(() => {
    setSupported(passkeySupported());
    const saved = savedPasskey();
    if (saved?.address) setStep({ state: "done", wallet: saved });
  }, []);

  const run = async (mode: "register" | "login") => {
    setStep({ state: "working", mode });
    try {
      const wallet = await passkeySignIn(mode, mode === "register" ? name.trim() || "Arcway wallet" : undefined);
      const connector = connectors.find((c) => c.id === PASSKEY_CONNECTOR_ID);
      if (connector) await connectAsync({ connector }).catch(() => undefined);
      setStep({ state: "done", wallet });
    } catch (e) {
      const cancelled = e instanceof Error && /NotAllowed|cancel|abort/i.test(`${e.name} ${e.message}`);
      setStep({ state: "error", message: cancelled ? "The passkey prompt was closed. Try again when you're ready." : humanizeError(e) });
    }
  };

  const disabled = !PASSKEY_WALLETS || !supported;
  const working = step.state === "working";

  return (
    <section className="gw-card gw-card--main" aria-labelledby="gw-passkey">
      <div className="gw-card__top">
        <span className="gw-card__icon" aria-hidden="true"><KeyRound /></span>
        <span className="badge">{PASSKEY_WALLETS ? "Easiest" : "Coming soon"}</span>
      </div>
      <h2 id="gw-passkey" className="gw-card__title">Create one here with a passkey</h2>
      <ul className="gw-points">
        <li><Check aria-hidden="true" />Unlock it with Face ID, your fingerprint or your device PIN</li>
        <li><Check aria-hidden="true" />No app to install and no 12-word phrase to write down</li>
        <li><Check aria-hidden="true" />Network fees are sponsored, so you can start with an empty wallet</li>
      </ul>

      {step.state === "done" ? (
        <div className="gw-done" role="status">
          <div className="label">Your wallet on {NETWORK_NAME}</div>
          <div className="gw-done__addr">
            <a className="mono" href={explorer.address(step.wallet.address!)} target="_blank" rel="noopener noreferrer">
              {shortAddress(step.wallet.address!)}<ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens explorer)</span>
            </a>
            <button type="button" className="btn btn--ghost btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(step.wallet.address!); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* address stays visible */ } }}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <Link href="/passport" className="btn btn--primary">Open your passport</Link>
            <Link href="/quests" className="btn btn--secondary">Start a quest</Link>
          </div>
          <button type="button" className="gw-forget" onClick={() => { forgetPasskeyWallet(); setStep({ state: "idle" }); }}>
            Use a different passkey on this device
          </button>
        </div>
      ) : (
        <form className="gw-form" onSubmit={(e) => { e.preventDefault(); if (!disabled) run("register"); }}>
          <label htmlFor={nameId} className="sfield__label">Name your wallet</label>
          <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ada's wallet" maxLength={40} autoComplete="off" disabled={disabled || working} />
          <span className="sfield__hint">Only you see this. It labels the passkey on your device.</span>
          <div className="row" style={{ marginTop: 6 }}>
            <button type="submit" className="btn btn--primary" disabled={disabled || working} aria-busy={working}>
              {working && step.mode === "register" ? <><LoaderCircle className="spin" aria-hidden="true" />Confirm with your passkey…</> : "Create my wallet"}
            </button>
            <button type="button" className="btn btn--secondary" disabled={disabled || working} onClick={() => run("login")}>
              {working && step.mode === "login" ? <><LoaderCircle className="spin" aria-hidden="true" />Confirm…</> : "I already have one"}
            </button>
          </div>
          {!PASSKEY_WALLETS && <p className="gw-note">Passkey wallets are being switched on for Arcway. In the meantime, a wallet app below takes about two minutes.</p>}
          {PASSKEY_WALLETS && !supported && <p className="gw-note">This browser can&apos;t create passkeys. Try Safari, Chrome or Edge on a recent phone or computer.</p>}
          {step.state === "error" && <Status tone="error">{step.message}</Status>}
        </form>
      )}
      <p className="gw-credit">Passkey wallets are smart accounts from Circle&apos;s Modular Wallets, the team behind USDC and Arc.</p>
    </section>
  );
}

export function GetWallet() {
  return (
    <div className="gw">
      <PasskeyCard />

      <section className="gw-card" aria-labelledby="gw-apps">
        <div className="gw-card__top">
          <span className="gw-card__icon gw-card__icon--soft" aria-hidden="true"><Smartphone /></span>
        </div>
        <h2 id="gw-apps" className="gw-card__title">Or use a wallet app</h2>
        <p className="small secondary">Any wallet that supports EVM networks works on Arc. Install one, then add Arc with one tap.</p>
        <ul className="gw-apps">
          {APPS.map((a) => (
            <li key={a.name}>
              <a href={a.href} target="_blank" rel="noopener noreferrer" className="gw-app">
                <span><span className="gw-app__name">{a.name}</span><span className="gw-app__blurb">{a.blurb}</span></span>
                <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="row" style={{ marginTop: 14 }}>
          <AddArcButton />
          <a className="btn btn--ghost" href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">{IS_MAINNET ? "Bring USDC to Arc" : "Get test USDC"}<ArrowUpRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="gw-card gw-card--quiet" aria-labelledby="gw-safe">
        <div className="gw-card__top">
          <span className="gw-card__icon gw-card__icon--soft" aria-hidden="true"><ShieldCheck /></span>
        </div>
        <h2 id="gw-safe" className="gw-card__title">Keep it safe</h2>
        <ul className="gw-points gw-points--plain">
          <li>Your passkey stays on your device and syncs through iCloud Keychain or Google Password Manager. Arcway never sees it.</li>
          <li>With a wallet app, write your recovery phrase on paper and keep it offline.</li>
          <li>Nobody from Arcway will ever ask for your passkey, phrase or private key.</li>
        </ul>
      </section>
    </div>
  );
}
