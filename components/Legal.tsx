import type { ReactNode } from "react";
import { LEGAL_UPDATED } from "../lib/config";

/** Readable legal page: summary box up top, numbered sections with an in-page index. */
export function LegalPage({ title, summary, sections }: { title: string; summary: ReactNode; sections: { id: string; title: string; body: ReactNode }[] }) {
  return (
    <div className="container page">
      <div className="legal">
        <aside className="legal__toc" aria-label="On this page">
          <div className="label">On this page</div>
          <ol>
            {sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`}>{i + 1}. {s.title}</a></li>)}
          </ol>
        </aside>
        <article className="legal__body">
          <div className="label" style={{ color: "var(--link)" }}>Legal</div>
          <h1 className="h1" style={{ marginTop: 10 }}>{title}</h1>
          <p className="small secondary" style={{ marginTop: 10 }}>Last updated {LEGAL_UPDATED}</p>
          <div className="legal__summary">{summary}</div>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
              <h2 id={`${s.id}-h`} className="h4">{i + 1}. {s.title}</h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
