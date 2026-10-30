'use client';

import { ArrowUpRight, Check, Copy, LoaderCircle } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { usePublicClient, useDeployContract } from "wagmi";
import { bountiesAbi } from "../lib/bountiesAbi";
import { bountiesBytecode } from "../lib/bountiesBytecode";
import { BOUNTIES_CONTRACT, NETWORK_NAME, PASSPORT_ADDRESS, USDC_ADDRESS, arcChain, explorer } from "../lib/config";
import { humanizeError } from "../lib/errors";
import { useArcwayState } from "../lib/hooks/context";
import { useWallet } from "../lib/hooks/useWallet";
import { PASSKEY_CONNECTOR_ID } from "../lib/passkeyConnector";

type Phase =
  | { k: "idle" }
  | { k: "signing" }
  | { k: "mining"; hash: `0x${string}` }
  | { k: "done"; address: Address; hash: `0x${string}`; checked: boolean }
  | { k: "error"; msg: string };

/** One-time deploy of ArcwayBounties from the connected wallet, wired to the live USDC and passport. */
export function DeployBounties() {
  const { connection, onArc } = useArcwayState();
  const wallet = useWallet();
  const client = usePublicClient({ chainId: arcChain.id });
  const { deployContractAsync } = useDeployContract();
  const [phase, setPhase] = useState<Phase>({ k: "idle" });
  const [copied, setCopied] = useState(false);
  const passkey = connection.connector?.id === PASSKEY_CONNECTOR_ID;

  const deploy = async () => {
    if (!client || !PASSPORT_ADDRESS) return;
    setPhase({ k: "signing" });
    try {
      const hash = await deployContractAsync({ abi: bountiesAbi, bytecode: bountiesBytecode, args: [USDC_ADDRESS, PASSPORT_ADDRESS], chainId: arcChain.id });
      setPhase({ k: "mining", hash });
      const r = await client.waitForTransactionReceipt({ hash, timeout: 120_000 });
      if (r.status !== "success" || !r.contractAddress) throw new Error("The deploy was reverted. Only the network fee was spent.");
      const [usdc, passport] = await Promise.all([
        client.readContract({ address: r.contractAddress, abi: bountiesAbi, functionName: "usdc" }),
        client.readContract({ address: r.contractAddress, abi: bountiesAbi, functionName: "passport" })
      ]);
      const checked = usdc.toLowerCase() === USDC_ADDRESS.toLowerCase() && passport.toLowerCase() === PASSPORT_ADDRESS.toLowerCase();
      setPhase({ k: "done", address: r.contractAddress, hash, checked });
    } catch (e) {
      setPhase({ k: "error", msg: humanizeError(e) });
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* select manually */ }
  };

  if (!PASSPORT_ADDRESS) {
    return <div className="card pad-lg"><b>Unavailable</b><p className="small secondary" style={{ marginTop: 6 }}>No passport contract is configured for {NETWORK_NAME}, so there is nothing to wire bounties to.</p></div>;
  }

  const busy = phase.k === "signing" || phase.k === "mining";

  return (
    <div className="card pad-lg sponsor">
      <dl className="deploy__facts small">
        <dt>Contract</dt><dd>ArcwayBounties ({(bountiesBytecode.length - 2) / 2} bytes, from <span className="mono">contracts/src/ArcwayBounties.sol</span>)</dd>
        <dt>Network</dt><dd>{NETWORK_NAME} (chain {arcChain.id})</dd>
        <dt>USDC</dt><dd className="mono">{USDC_ADDRESS}</dd>
        <dt>Passport</dt><dd className="mono">{PASSPORT_ADDRESS}</dd>
      </dl>

      {BOUNTIES_CONTRACT && phase.k !== "done" && (
        <p className="small">Already live at <a className="link mono" href={explorer.address(BOUNTIES_CONTRACT)} target="_blank" rel="noopener noreferrer">{BOUNTIES_CONTRACT}</a>. You don&apos;t need to deploy again.</p>
      )}

      {phase.k === "done" ? (
        <div className="deploy__done">
          <p className="small"><Check aria-hidden="true" style={{ width: 16, verticalAlign: -3 }} /> Deployed{phase.checked ? " and checked: it points at the right USDC and passport." : "."}</p>
          {!phase.checked && <p className="field__error" role="alert">The new contract doesn&apos;t report the expected USDC and passport. Don&apos;t use it; ask for help.</p>}
          <div className="deploy__addr">
            <code className="mono">{phase.address}</code>
            <button className="btn btn--secondary btn--sm" onClick={() => copy(phase.address)}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy address"}</button>
          </div>
          <p className="small"><a className="link" href={explorer.tx(phase.hash)} target="_blank" rel="noopener noreferrer">View the deploy transaction <ArrowUpRight aria-hidden="true" /></a></p>
          <p className="small secondary">Send this address to whoever maintains Arcway so the Sponsor page can use it.</p>
        </div>
      ) : connection.status !== "connected" ? (
        <button className="btn btn--primary btn--block" onClick={() => wallet.connect()}>Connect wallet</button>
      ) : !onArc ? (
        <button className="btn btn--primary btn--block" onClick={wallet.switchToArc}>Switch to {NETWORK_NAME}</button>
      ) : passkey ? (
        <p className="small secondary">Passkey wallets can&apos;t deploy contracts. Open this page in a wallet app&apos;s browser (MetaMask, Rabby, OKX) instead.</p>
      ) : (
        <button className="btn btn--primary btn--block" onClick={deploy} disabled={busy} aria-busy={busy}>
          {phase.k === "signing" ? "Confirm in your wallet…" : phase.k === "mining" ? "Deploying…" : "Deploy ArcwayBounties"}
        </button>
      )}

      {busy && <p className="xs secondary"><LoaderCircle className="spin" aria-hidden="true" style={{ width: 14, verticalAlign: -2 }} /> {phase.k === "signing" ? "Your wallet will show a contract deployment. The only cost is the network fee, paid in USDC." : "Waiting for Arc to confirm."}</p>}
      {phase.k === "error" && <p className="field__error" role="alert">{phase.msg}</p>}
    </div>
  );
}
