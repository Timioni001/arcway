'use client';

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { isAddress } from "viem";
import { useArcwayState } from "../lib/hooks/context";
import { ShareButtons } from "./ShareButtons";

/** Share your passport, or open its public page. Only shown when a wallet is connected. */
export function MyPassportActions() {
  const { connection, xp } = useArcwayState();
  if (connection.status !== "connected" || !connection.address) return null;
  return (
    <div className="row" style={{ gap: 12 }}>
      <ShareButtons address={connection.address} xp={xp} />
      <Link href={`/passport/${connection.address}`} className="link small">Public page <ArrowRight aria-hidden="true" /></Link>
    </div>
  );
}

/** Look up anyone's passport by wallet address. */
export function PassportLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  return (
    <form
      className="lookup"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (!isAddress(v)) {
          setError("That doesn't look like a wallet address (0x followed by 40 characters).");
          return;
        }
        router.push(`/passport/${v}`);
      }}
    >
      <label htmlFor={id} className="h4" style={{ display: "block" }}>Look up a passport</label>
      <p className="small secondary" style={{ marginTop: 4 }}>See anyone&apos;s level and badges. It&apos;s all public on Arc.</p>
      <div className="row" style={{ marginTop: 14, flexWrap: "nowrap" }}>
        <div className="search" style={{ flex: 1, height: 46 }}>
          <Search aria-hidden="true" />
          <input
            id={id}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-err` : undefined}
            className="mono"
          />
        </div>
        <button className="btn btn--primary" type="submit">View</button>
      </div>
      {error && <p id={`${id}-err`} role="alert" className="small" style={{ marginTop: 8, color: "var(--error)" }}>{error}</p>}
    </form>
  );
}
