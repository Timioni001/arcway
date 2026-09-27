'use client';

import { ArrowUpRight, History, IdCard, Search, SearchX, Target, X } from "lucide-react";
import { explorer } from "../lib/config";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { clearRecent, getRecent, getRecentServer, rememberSearch, subscribeRecent } from "../lib/recentSearches";
import { resultCount, searchAll, suggestedCategories } from "../lib/search";
import { AppCard } from "./AppCard";
import { BuilderCard } from "./Builders";
import { CATEGORY_META, CategoryTile } from "./CategoryIcon";
import { StateBlock } from "./Section";

/** Full search: grouped results, recent searches and suggested categories. The query lives in the URL. */
export function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState(params.get("q") ?? "");
  const recent = useSyncExternalStore(subscribeRecent, getRecent, getRecentServer);
  const inputId = useId();
  const results = useMemo(() => searchAll(term), [term]);
  const total = resultCount(results);
  const trimmed = term.trim();

  // Keep the URL shareable without adding a history entry per keystroke; remember settled searches.
  useEffect(() => {
    const id = setTimeout(() => {
      router.replace(trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname, { scroll: false });
      if (trimmed && total > 0) rememberSearch(trimmed);
    }, 600);
    return () => clearTimeout(id);
  }, [trimmed, total, pathname, router]);

  return (
    <div>
      <label htmlFor={inputId} className="visually-hidden">Search apps, categories, quests and builders</label>
      <div className="search">
        <Search aria-hidden="true" />
        <input id={inputId} type="search" autoFocus placeholder="Try “swap”, “Circle”, or paste an address or tx hash…" value={term} onChange={(e) => setTerm(e.target.value)} autoComplete="off" />
      </div>

      {!trimmed ? (
        <div className="search-start">
          {recent.length > 0 && (
            <section aria-labelledby="recent-title">
              <div className="row between">
                <h2 id="recent-title" className="label">Recent searches</h2>
                <button className="btn btn--ghost btn--sm" onClick={clearRecent}><X aria-hidden="true" />Clear</button>
              </div>
              <ul className="row" style={{ gap: 8, marginTop: 12 }}>
                {recent.map((r) => (
                  <li key={r}><button className="chip" onClick={() => setTerm(r)}><History aria-hidden="true" style={{ width: 14, height: 14 }} />{r}</button></li>
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="suggested-title">
            <h2 id="suggested-title" className="label">Suggested categories</h2>
            <ul className="cats cats--compact" style={{ marginTop: 12 }}>
              {suggestedCategories().map((c) => (
                <li key={c}>
                  <Link href={`/apps?category=${encodeURIComponent(c)}`} className="cat" style={{ "--cat": CATEGORY_META[c].color } as React.CSSProperties}>
                    <CategoryTile category={c} />
                    <span className="cat__name">{c}</span>
                    <span className="cat__blurb">{CATEGORY_META[c].blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : total === 0 ? (
        <div style={{ marginTop: 28 }}>
          <StateBlock icon={SearchX} title={`No results for “${trimmed}”`} actions={<Link href="/apps" className="btn btn--secondary btn--sm">Browse all apps</Link>}>
            Try a shorter word, an app name or a category like “Payments”.
          </StateBlock>
        </div>
      ) : (
        <div className="search-results">
          <p className="small secondary" role="status">{total} result{total === 1 ? "" : "s"} for “{trimmed}”</p>
          {results.onchain && (
            <Group title="Onchain" count={1}>
              <ul className="list-rows">
                {results.onchain.kind === "tx" ? (
                  <li><a className="row-card" href={explorer.tx(results.onchain.value)} target="_blank" rel="noopener noreferrer"><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600 }}>Transaction</span><span className="mono xs secondary" style={{ wordBreak: "break-all" }}>{results.onchain.value}</span></span><ArrowUpRight aria-hidden="true" /></a></li>
                ) : (
                  <>
                    {results.onchain.app && <li><Link className="row-card" href={`/apps/${results.onchain.app.slug}`}><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600 }}>{results.onchain.app.name} contract</span><span className="xs secondary">Published by the team · open protocol</span></span></Link></li>}
                    <li><a className="row-card" href={explorer.address(results.onchain.value)} target="_blank" rel="noopener noreferrer"><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600 }}>Address on {explorer.name}</span><span className="mono xs secondary" style={{ wordBreak: "break-all" }}>{results.onchain.value}</span></span><ArrowUpRight aria-hidden="true" /></a></li>
                    <li><Link className="row-card" href={`/passport/${results.onchain.value}`}><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600 }}><IdCard aria-hidden="true" style={{ width: 15, verticalAlign: -2, marginRight: 6 }} />Passport</span><span className="xs secondary">XP, badges and activity for this wallet</span></span></Link></li>
                  </>
                )}
              </ul>
            </Group>
          )}
          {results.categories.length > 0 && (
            <Group title="Categories" count={results.categories.length}>
              <ul className="row" style={{ gap: 8 }}>
                {results.categories.map((c) => (
                  <li key={c}><Link href={`/apps?category=${encodeURIComponent(c)}`} className="chip">{c}</Link></li>
                ))}
              </ul>
            </Group>
          )}
          {results.apps.length > 0 && (
            <Group title="Apps" count={results.apps.length}>
              <ul className="cards">{results.apps.map((a) => <li key={a.id}><AppCard app={a} /></li>)}</ul>
            </Group>
          )}
          {results.quests.length > 0 && (
            <Group title="Quests" count={results.quests.length}>
              <ul className="list-rows">
                {results.quests.map((q) => (
                  <li key={q.id}>
                    <Link href={`/quests/${q.id}`} className="row-card">
                      <span className="tile tile--sm" data-shade={2} aria-hidden="true"><Target /></span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600 }}>{q.title}</span>
                        <span className="xs secondary">{q.description}</span>
                      </span>
                      <span className="badge">+{q.xp} XP</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Group>
          )}
          {results.builders.length > 0 && (
            <Group title="Builders" count={results.builders.length}>
              <ul className="cards">{results.builders.map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}</ul>
            </Group>
          )}
          {results.trails.length > 0 && (
            <Group title="Trails" count={results.trails.length}>
              <ul className="list-rows">
                {results.trails.map((t) => (
                  <li key={t.id}><Link href={`/trails/${t.id}`} className="row-card"><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600 }}>{t.title}</span><span className="xs secondary">{t.goal}</span></span></Link></li>
                ))}
              </ul>
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="search-group" aria-label={title}>
      <h2 className="label">{title} <span className="mono">{count}</span></h2>
      {children}
    </section>
  );
}
