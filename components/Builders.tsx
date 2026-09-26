import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { builderMark, type BuilderView } from "../lib/builders";
import { SUBMIT_APP_URL } from "../lib/config";
import { AppMark } from "./CategoryIcon";
import { ExternalLink } from "./Status";

export function BuilderCard({ builder }: { builder: BuilderView }) {
  return (
    <article className="builder-card card" aria-labelledby={`b-${builder.id}`}>
      <div className="row" style={{ gap: 14 }}>
        <AppMark app={builderMark(builder)} />
        <div>
          <h3 id={`b-${builder.id}`} className="h4"><Link href={`/builders/${builder.id}`}>{builder.name}</Link></h3>
          <p className="xs secondary">{builder.apps.length} {builder.apps.length === 1 ? "app" : "apps"} on Arcway</p>
        </div>
      </div>
      <ul className="row" style={{ gap: 8 }}>
        {builder.apps.map((a) => (
          <li key={a.id}><Link href={`/apps/${a.slug}`} className="tag" style={{ color: "var(--link)" }}>{a.name}</Link></li>
        ))}
      </ul>
      <div className="row" style={{ marginTop: "auto", gap: 16 }}>
        {builder.categories.map((c) => <span key={c} className="xs secondary">{c}</span>)}
        {builder.github && <span style={{ marginLeft: "auto" }}><ExternalLink href={builder.github}>GitHub</ExternalLink></span>}
      </div>
    </article>
  );
}

export function GetListedCard() {
  return (
    <a href={SUBMIT_APP_URL} target="_blank" rel="noopener noreferrer" className="get-listed">
      <span className="state__icon"><Plus aria-hidden="true" /></span>
      <span className="h4" style={{ color: "var(--text)" }}>Building on Arc?</span>
      <span className="small">Submit your app to get listed. <ArrowUpRight aria-hidden="true" style={{ display: "inline", width: 14, verticalAlign: -2 }} /></span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
