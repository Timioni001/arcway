'use client';

import { Bookmark, Search, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { buildersFrom } from "../lib/builders";
import { useArcwayState } from "../lib/hooks/context";
import { APPS, CATEGORIES, STATUS_FILTER_LABEL, availableStatusFilters, discoverApps, matchesStatus, type Category, type StatusFilter } from "../lib/registry";
import { AppCard, FeaturedApp } from "./AppCard";
import { BuilderCard } from "./Builders";
import { QuestCard } from "./Quests";
import { CategoryTile } from "./CategoryIcon";
import { SaveButton, useSavedApps } from "./SaveButton";
import { StateBlock } from "./Section";

/** Search + filters + results. Search results reuse the same cards as everywhere else. */
export function Discover() {
  const { quests: questViews } = useArcwayState();
  const initial = useSearchParams().get("category");
  const [category, setCategory] = useState<Category | null>(
    CATEGORIES.includes(initial as Category) ? (initial as Category) : null
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recommended" | "newest" | "az">("recommended");
  const [savedOnly, setSavedOnly] = useState(false);
  const [status, setStatus] = useState<StatusFilter | null>(null);
  const statusFilters = useMemo(() => availableStatusFilters(APPS), []);
  const saved = useSavedApps();
  const sortId = useId();
  const searchId = useId();
  const term = search.trim().toLowerCase();

  const apps = useMemo(() => {
    let list = discoverApps(APPS, { category, search });
    if (savedOnly) list = list.filter((a) => saved.includes(a.id));
    if (status) list = list.filter((a) => matchesStatus(a, status));
    if (sort === "newest") list = [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name));
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, search, savedOnly, saved, sort, status]);
  const quests = term ? questViews.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(term)) : [];
  const builders = term ? buildersFrom().filter((b) => b.name.toLowerCase().includes(term)) : [];
  const categories = CATEGORIES;
  const featured = !term && !category && !savedOnly && !status && sort === "recommended" ? apps.find((a) => a.featured) : undefined;
  const total = apps.length + quests.length + builders.length;

  return (
    <div>
      <label htmlFor={searchId} className="visually-hidden">Search apps, quests, builders</label>
      <div className="search">
        <Search aria-hidden="true" />
        <input id={searchId} type="search" placeholder="Search apps, quests, builders…" value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
      </div>
      <div className="discover-bar">
      <div className="filters" role="group" aria-label="Filter by category">
        <button className="chip" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          <Bookmark aria-hidden="true" style={{ width: 14, height: 14 }} />Following{saved.length ? <span className="mono xs">{saved.length}</span> : null}
        </button>
        <button className="chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All</button>
        {categories.map((c) => (
          <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
            <CategoryTile category={c} size="xs" />{c}
          </button>
        ))}
      </div>
      </div>
      <div className="discover-bar discover-bar--status">
        <div className="filters" role="group" aria-label="Filter by status">
          {statusFilters.map((f) => (
            <button key={f} className="chip chip--status" data-status={f} aria-pressed={status === f} onClick={() => setStatus(status === f ? null : f)}>
              <span className="dot" aria-hidden="true" />{STATUS_FILTER_LABEL[f]}
            </button>
          ))}
        </div>
        <label className="sort" htmlFor={sortId}>
          <span className="visually-hidden">Sort apps</span>
          <select id={sortId} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="recommended">Recommended</option>
            <option value="newest">Newest</option>
            <option value="az">A–Z</option>
          </select>
        </label>
      </div>

      <p className="visually-hidden" role="status">{total} results</p>

      {total === 0 ? (
        <StateBlock icon={savedOnly && !saved.length ? Bookmark : SearchX} title={savedOnly && !saved.length ? "Not following any apps yet" : "No results"} actions={<button className="btn btn--secondary btn--sm" onClick={() => { setSearch(""); setCategory(null); setSavedOnly(false); setStatus(null); }}>Show all apps</button>}>
          {savedOnly && !saved.length ? "Tap the bookmark on any app to follow it." : category && !term ? `No ${category.toLowerCase()} apps listed yet. New apps are added regularly.` : "Try another word or category."}
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
