'use client';

import { Check, Copy } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { APPS } from "../lib/registry";

function CopyBox({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codebox">
      <div className="codebox__head">
        <span className="label">{label}</span>
        <button className="btn btn--ghost btn--sm" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* select manually */ } }}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mono"><code>{code}</code></pre>
    </div>
  );
}

/** Pick an app and theme; get a live badge and the snippet to paste into a README or website. */
export function WidgetBuilder() {
  const apps = APPS.filter((a) => a.active && !a.sample);
  const [slug, setSlug] = useState(apps[0]?.slug ?? "");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [origin, setOrigin] = useState("https://your-arcway-site");
  const sel = useId();
  useEffect(() => setOrigin(window.location.origin), []);
  const src = `${origin}/api/badge/${slug}${theme === "dark" ? "?theme=dark" : ""}`;
  const href = `${origin}/apps/${slug}`;
  const name = apps.find((a) => a.slug === slug)?.name ?? "App";
  return (
    <div className="widget">
      <div className="panel widget__controls">
        <label htmlFor={sel} className="sfield__label">App</label>
        <select id={sel} value={slug} onChange={(e) => setSlug(e.target.value)}>
          {apps.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
        </select>
        <div className="sfield__label" style={{ marginTop: 14 }}>Theme</div>
        <div className="seg" role="group" aria-label="Badge theme">
          <button aria-pressed={theme === "light"} onClick={() => setTheme("light")}>Light</button>
          <button aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>Dark</button>
        </div>
        <div className="widget__preview" data-theme={theme}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/badge/${slug}${theme === "dark" ? "?theme=dark" : ""}`} alt={`Arcway badge for ${name}`} height={24} />
        </div>
        <p className="xs secondary">Shows live transactions on Arc when the app&apos;s contracts are published, otherwise &ldquo;Listed on Arc&rdquo;. Refreshes every few minutes.</p>
      </div>
      <div className="stack-col">
        <CopyBox label="Markdown (README)" code={`[![${name} on Arcway](${src})](${href})`} />
        <CopyBox label="HTML (website)" code={`<a href="${href}"><img src="${src}" alt="${name} on Arcway" height="24"></a>`} />
      </div>
    </div>
  );
}
