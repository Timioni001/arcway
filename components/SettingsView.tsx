'use client';

import { Check, Database, Monitor, Moon, Network, PanelLeft, Sun, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { NETWORK_NAME, arcChain, explorer, USDC_ADDRESS } from "../lib/config";
import { SOURCE_HELP, SOURCE_LABEL, type Source } from "../lib/intel";
import { clearRecent, getRecent, getRecentServer, subscribeRecent } from "../lib/recentSearches";
import { THEME_EVENT, getThemeMode, setThemeMode, type ThemeMode } from "../lib/theme";
import { clearWatchlist, getWatchlist, getWatchlistServer, subscribeWatchlist } from "../lib/watchlist";
import { AddArcButton } from "./AddArcButton";
import { PanelHead, SourceTag } from "./Intel";

const THEMES: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor }
];

export function SettingsView() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);
  const [rail, setRail] = useState<"expanded" | "collapsed">("expanded");
  const [cleared, setCleared] = useState(false);
  const watch = useSyncExternalStore(subscribeWatchlist, getWatchlist, getWatchlistServer);
  const recent = useSyncExternalStore(subscribeRecent, getRecent, getRecentServer);

  useEffect(() => {
    const sync = () => setTheme(getThemeMode());
    sync();
    setRail(document.documentElement.dataset.rail === "collapsed" ? "collapsed" : "expanded");
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const chooseRail = (next: "expanded" | "collapsed") => {
    document.documentElement.dataset.rail = next;
    try { localStorage.setItem("arcway:rail", next); } catch { /* not persisted */ }
    setRail(next);
  };

  const clearAll = () => {
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith("arcway:")) localStorage.removeItem(k);
    } catch { /* storage blocked */ }
    clearWatchlist();
    clearRecent();
    setCleared(true);
  };

  return (
    <div className="settings">
      <section className="panel" aria-labelledby="appearance">
        <PanelHead icon={Sun} title="Appearance" id="appearance" />
        <div className="setting">
          <div><div className="setting__label">Theme</div><p className="xs secondary">Light, dark, or follow your device.</p></div>
          <div className="seg" role="radiogroup" aria-label="Theme">
            {THEMES.map(({ mode, label, icon: Icon }) => (
              <button key={mode} role="radio" aria-checked={theme === mode} aria-pressed={theme === mode} onClick={() => setThemeMode(mode)}>
                <Icon aria-hidden="true" style={{ width: 14, height: 14 }} />{label}
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <div><div className="setting__label"><PanelLeft aria-hidden="true" />Sidebar on large screens</div><p className="xs secondary">Tablets always start collapsed.</p></div>
          <div className="seg" role="radiogroup" aria-label="Sidebar">
            <button role="radio" aria-checked={rail === "expanded"} aria-pressed={rail === "expanded"} onClick={() => chooseRail("expanded")}>Expanded</button>
            <button role="radio" aria-checked={rail === "collapsed"} aria-pressed={rail === "collapsed"} onClick={() => chooseRail("collapsed")}>Collapsed</button>
          </div>
        </div>
      </section>

      <section className="panel" aria-labelledby="network">
        <PanelHead icon={Network} title="Network" id="network" />
        <dl className="facts">
          <div><dt>Network</dt><dd>{NETWORK_NAME}</dd></div>
          <div><dt>Chain ID</dt><dd className="mono">{arcChain.id}</dd></div>
          <div><dt>RPC</dt><dd className="mono xs" style={{ wordBreak: "break-all" }}>{arcChain.rpcUrls.default.http[0]}</dd></div>
          <div><dt>Explorer</dt><dd><a className="link" href={explorer.home} target="_blank" rel="noopener noreferrer">{explorer.name}</a></dd></div>
          <div><dt>USDC</dt><dd className="mono xs">{USDC_ADDRESS}</dd></div>
        </dl>
        <div style={{ marginTop: 16 }}><AddArcButton /></div>
      </section>

      <section className="panel" id="data" aria-labelledby="data-title">
        <PanelHead icon={Database} title="How we measure" id="data-title" />
        <p className="small secondary">Every number on Arcway carries a source and the period it covers. We never fabricate volume, users, TVL, growth, rewards or security status, and nothing here is investment advice.</p>
        <dl className="defs">
          {(["observed", "derived", "project", "community"] as Source[]).map((s) => (
            <div key={s}><dt><SourceTag source={s} /></dt><dd>{SOURCE_HELP[s]}{s === "community" ? " Not used yet." : ""}</dd></div>
          ))}
        </dl>
        <p className="xs secondary" style={{ marginTop: 14 }}>
          Observed data comes from <a className="link" href={explorer.home} target="_blank" rel="noopener noreferrer">{explorer.name}</a>. Live views refresh every 15–120 seconds and show when they were last updated. {SOURCE_LABEL.derived} values name their method, for example &ldquo;latest day vs prior 7 days&rdquo;.
        </p>
      </section>

      <section className="panel" aria-labelledby="local">
        <PanelHead icon={Trash2} title="Data in this browser" id="local" />
        <p className="small secondary">Your watchlist, recent searches, trail progress and preferences stay in this browser. Nothing is sent to us. <Link className="link" href="/privacy">Privacy Policy</Link></p>
        <div className="setting">
          <div><div className="setting__label">Watchlist</div><p className="xs secondary">{watch.length} followed</p></div>
          <button className="btn btn--secondary btn--sm" onClick={clearWatchlist} disabled={!watch.length}>Clear</button>
        </div>
        <div className="setting">
          <div><div className="setting__label">Recent searches</div><p className="xs secondary">{recent.length} saved</p></div>
          <button className="btn btn--secondary btn--sm" onClick={clearRecent} disabled={!recent.length}>Clear</button>
        </div>
        <div className="setting">
          <div><div className="setting__label">Everything</div><p className="xs secondary">Watchlist, searches, progress and preferences.</p></div>
          <button className="btn btn--secondary btn--sm" onClick={clearAll}>{cleared ? <><Check aria-hidden="true" />Cleared</> : "Clear all"}</button>
        </div>
      </section>
    </div>
  );
}
