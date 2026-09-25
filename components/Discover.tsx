'use client';

import { Search, SearchX, Target } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { QUESTS } from "../lib/quests";
import { APPS, CATEGORIES, categoryCounts, discoverApps, newestApps, type Category } from "../lib/registry";
import { AppCard, AppLogo, FeaturedApp, NewRail } from "./AppCard";
import { StateBlock } from "./Section";

/** Discover (§14 slide 04, §21, §22): featured + new, filters, grouped search. */
export function Discover() {
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const searchId = useId();
  const term = search.trim().toLowerCase();

  const counts = useMemo(() => categoryCounts(APPS), []);
  const apps = useMemo(() => discoverApps(APPS, { category, search }), [category, search]);
  const quests = useMemo(
    () => (term ? QUESTS.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(term)) : []),
    [term]
  );
  const categories = CATEGORIES.filter((c) => counts[c] > 0 || c === category);
  const browsing = !term && !category;
  const featured = browsing ? apps.find((a) => a.featured) : undefined;
  const clear = () => { setSearch(""); setCategory(null); };

  return (
    <div>
      <div className="stack-4" style={{ marginBottom: 32 }}>
        <label htmlFor={searchId} className="visually-hidden">Search Arcway</label>
        <div className="search">
          <Search aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            placeholder="Search apps, quests, builders — try “payments” or “USDC”"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="filters" role="group" aria-label="Filter by category">
          <button className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
          {categories.map((c) => (
            <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
              {c} <span className="count">{counts[c]}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="visually-hidden" role="status">
        {apps.length} apps{term ? ` and ${quests.length} quests` : ""} shown
      </p>

      {apps.length === 0 && quests.length === 0 ? (
        <StateBlock
          icon={SearchX}
          title={`Nothing matches${search ? ` “${search}”` : ""}`}
          actions={<button className="btn btn--secondary" onClick={clear}>Clear search</button>}
        >
          More Arc apps are being reviewed for listing. Try a category instead.
        </StateBlock>
      ) : term ? (
        <div>
          {apps.length > 0 && (
            <section className="results-group" aria-label="Apps">
              <div className="label" style={{ marginBottom: 12 }}>Apps · {apps.length}</div>
              {apps.map((app) => (
                <Link key={app.id} href={`/apps/${app.slug}`} className="result-row">
                  <AppLogo app={app} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.name}</div>
                    <div className="body-sm muted">{app.category} · {app.tagline}</div>
                  </div>
                </Link>
              ))}
            </section>
          )}
          {quests.length > 0 && (
            <section className="results-group" aria-label="Quests">
              <div className="label" style={{ marginBottom: 12 }}>Quests · {quests.length}</div>
              {quests.map((q) => (
                <Link key={q.id} href={`/quests/${q.id}`} className="result-row">
                  <span className="app-logo" aria-hidden="true"><Target style={{ width: 18, height: 18, color: "var(--aw-sky)", strokeWidth: 1.5 }} /></span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{q.title}</div>
                    <div className="body-sm muted"><span className="mono">+{q.xp} XP</span> · {q.description}</div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      ) : (
        <>
          {featured && (
            <div className="discover-top">
              <FeaturedApp app={featured} />
              <NewRail apps={newestApps(APPS.filter((a) => a.id !== featured.id))} />
            </div>
          )}
          <ul className="grid-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {apps.filter((a) => a !== featured).map((app) => (
              <li key={app.id}><AppCard app={app} /></li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
