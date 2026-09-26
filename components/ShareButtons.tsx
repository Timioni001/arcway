'use client';

import { Check, Link2, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { levelFor } from "../lib/levels";

/** Copy link, native share sheet where available, and a ready-made post for X. */
export function ShareButtons({ address, xp }: { address: string; xp: number }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setUrl(`${window.location.origin}/passport/${address}`);
    setCanShare(typeof navigator.share === "function");
  }, [address]);

  const text = `My Arcway passport: ${levelFor(xp).name}, ${xp} XP on Arc.`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked; the link is still shareable via the other buttons */
    }
  };

  return (
    <div className="row" style={{ gap: 8 }}>
      <button className="btn btn--secondary btn--sm" onClick={copy} aria-live="polite">
        {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}{copied ? "Link copied" : "Copy link"}
      </button>
      {canShare && (
        <button className="btn btn--secondary btn--sm" onClick={() => navigator.share({ title: "Arcway passport", text, url }).catch(() => {})}>
          <Share2 aria-hidden="true" />Share
        </button>
      )}
      <a
        className="btn btn--secondary btn--sm"
        href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
        Post on X<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
