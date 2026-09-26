'use client';

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { addArcToWallet, type AddResult } from "../lib/addToWallet";
import { NETWORK_NAME } from "../lib/config";

const MESSAGE: Record<Exclude<AddResult, "added">, string> = {
  "no-wallet": "No browser wallet found. Install one (MetaMask, Phantom…) and reload.",
  rejected: "You cancelled in your wallet. Nothing changed.",
  error: "Your wallet couldn't add Arc. Add it manually in your wallet's network settings."
};

/** One click to add Arc to the browser wallet. */
export function AddArcButton({ className = "btn btn--secondary", onAdded }: { className?: string; onAdded?: () => void }) {
  const [state, setState] = useState<"idle" | "busy" | AddResult>("idle");
  return (
    <span style={{ display: "inline-grid", gap: 6 }}>
      <button
        type="button"
        className={className}
        disabled={state === "busy"}
        aria-busy={state === "busy"}
        onClick={async () => {
          setState("busy");
          const r = await addArcToWallet();
          setState(r);
          if (r === "added") onAdded?.();
        }}
      >
        {state === "added" ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
        {state === "busy" ? "Confirm in wallet…" : state === "added" ? `${NETWORK_NAME} added` : `Add ${NETWORK_NAME} to wallet`}
      </button>
      {state !== "idle" && state !== "busy" && state !== "added" && (
        <span role="alert" className="xs" style={{ color: "var(--error)", maxWidth: 320 }}>{MESSAGE[state]}</span>
      )}
    </span>
  );
}
