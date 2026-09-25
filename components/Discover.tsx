'use client';

import { Search, SearchX } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { buildersFrom } from "../lib/builders";
import { useArcwayState } from "../lib/hooks/context";
import { APPS, CATEGORIES, categoryCounts, discoverApps, type Category } from "../lib/registry";
import { AppCard, FeaturedApp } from "./AppCard";
import { BuilderCard } from "./Builders";
import { QuestCard } from "./Quests";
import { StateBlock } from "./Section";

/** Search + filters + results. Search results reuse the same cards as everywhere else. */
export function Discover() {
  const { quests: questViews } = useArcwayState();
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const searchId = useId();
  const term = search.trim().toLowerCase();

  const counts = useMemo(() => categoryCounts(APPS), []);
  const apps = useMemo(() => discoverApps(APPS, { category, search }), [category, search]);
  const quests = term ? questViews.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(term)) : [];
  const builders = term ? buildersFrom().filter((b) => b.name.toLowerCase().includes(term)) : [];
  const categories = CATEGORIES.filter((c) => counts[c] > 0 || c === category);
  const featured = !term && !category ? apps.find((a) => a.featured) : undefined;
  const total = apps.length + quests.length + builders.length;

  return (
    <div>
      <label htmlFor={searchId} className="visually-hidden">Search apps, quests, builders</label>
      <div className="search">
        <Search aria-hidden="true" />
        <input id={searchId} type="search" placeholder="Search apps, quests, builders…" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
      </div>
      <div className="filters" role="group" aria-label="Filter by category" style={{ margin: "16px 0 32px" }}>
        <button className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {categories.map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>{c}</button>
        ))}
      </div>

      <p className="visually-hidden" role="status">{total} results</p>

      {total === 0 ? (
        <StateBlock icon={SearchX} title="No results" actions={<button className="btn btn--secondary btn--sm" onClick={() => { setSearch(""); setCategory(null); }}>Clear search</button>}>
          Try another word or category.
        </StateBlock>
      ) : (
        <>
          {featured && <FeaturedApp app={featured} />}
          {apps.length > 0 && (
            <section className="results" aria-label="Apps">
              {term && <h2 className="label" style={{ marginBottom: 14 }}>Apps</h2>}
              <ul className="cards">
                {apps.filter((a) => a !== featured).map((app) => <li key={app.id}><AppCard app={app} /></li>)}
              </ul>
            </section>
          )}
          {quests.length > 0 && (
            <section className="results" aria-label="Quests">
              <h2 className="label" style={{ marginBottom: 14 }}>Quests</h2>
              <ul className="cards">{quests.map((q) => <li key={q.id}><QuestCard quest={q} /></li>)}</ul>
            </section>
          )}
          {builders.length > 0 && (
            <section className="results" aria-label="Builders">
              <h2 className="label" style={{ marginBottom: 14 }}>Builders</h2>
              <ul className="cards">{builders.map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
