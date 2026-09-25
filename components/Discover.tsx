'use client';

import { useEffect, useId, useMemo, useState } from "react";
import { readJson, writeJson } from "../lib/storage";
import { APPS, CATEGORIES, appLink, categoryCounts, discoverApps, type ArcApp, type Category } from "../lib/registry";

const VISITED_KEY = "arcway:visited-apps";

export function Discover() {
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [visited, setVisited] = useState<string[]>([]);
  const searchId = useId();

  useEffect(() => setVisited(readJson<string[]>(VISITED_KEY, [])), []);

  const counts = useMemo(() => categoryCounts(APPS), []);
  const results = useMemo(() => discoverApps(APPS, { category, search }), [category, search]);
  // Only offer categories that have something in them, plus the active one.
  const categories = CATEGORIES.filter((c) => counts[c] > 0 || c === category);

  const markVisited = (app: ArcApp) => {
    const next = [...new Set([app.id, ...visited])];
    setVisited(next);
    writeJson(VISITED_KEY, next);
  };

  return (
    <div>
      <label htmlFor={searchId} className="muted small">What do you want to do on Arc?</label>
      <input
        id={searchId}
        type="search"
        className="pill"
        placeholder="Try “pay”, “swap” or “yield”"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ display: "block", width: "100%", marginTop: 8, color: "inherit", font: "inherit" }}
      />
      <div role="group" aria-label="Filter by category" style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button className="button secondary" aria-pressed={category === null} onClick={() => setCategory(null)}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} className="button secondary" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {c} <span className="muted">{counts[c]}</span>
          </button>
        ))}
      </div>

      <p className="visually-hidden" role="status">{results.length} apps shown</p>

      {results.length === 0 ? (
        <div className="card" style={{ marginTop: 14 }}>
          <b>No apps match{search ? ` “${search}”` : ""}</b>
          <p className="muted small">More Arc apps are being reviewed for listing.</p>
          <button className="button secondary" onClick={() => { setSearch(""); setCategory(null); }}>Clear filters</button>
        </div>
      ) : (
        <ul className="grid" style={{ listStyle: "none", padding: 0, marginTop: 14 }}>
          {results.map((app) => (
            <li key={app.id}>
              <AppCard app={app} visited={visited.includes(app.id)} onOpen={() => markVisited(app)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AppCard({ app, visited, onOpen }: { app: ArcApp; visited: boolean; onOpen: () => void }) {
  const href = appLink(app);
  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="muted small">
        {app.category.toUpperCase()} · {app.sample ? "SAMPLE LISTING" : app.verified ? "VERIFIED" : "UNVERIFIED"}
      </div>
      <b style={{ display: "block", marginTop: 8 }}>{app.name}</b>
      <p className="muted small">{app.description}</p>
      <p className="small">First thing to do: {app.firstAction}</p>
      {href ? (
        <a className="button secondary" href={href} target="_blank" rel="noopener noreferrer" onClick={onOpen} style={{ display: "inline-block" }}>
          {visited ? "Open again" : "Open app"}<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      ) : (
        <span className="muted small">{app.sample ? "Placeholder until real listings are added." : "Link coming soon."}</span>
      )}
      {!app.verified && !app.sample && (
        <p className="muted small">Not reviewed by Arcway. Interactions don't count toward quests.</p>
      )}
      {visited && app.verified && (
        <p className="muted small" role="status">Done something there? Your progress updates when you come back.</p>
      )}
    </div>
  );
}
