'use client';

import { ChevronRight, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_GROUPS, SECONDARY_NAV, YOU_NAV, type NavItem } from "../lib/nav";
import { THEME_EVENT, toggleTheme } from "../lib/theme";
import { IconOrb, type OrbHue } from "./IconOrb";
import { openSearch } from "./SearchPalette";

const HUES: OrbHue[] = ["blue", "teal", "violet", "amber"];

function Tile({ item, hue }: { item: NavItem; hue: OrbHue }) {
  return (
    <li>
      <Link href={item.href} className="hub-tile">
        <IconOrb icon={item.icon} hue={hue} size="sm" />
        <span className="hub-tile__text"><span className="hub-tile__name">{item.label}</span><span className="hub-tile__blurb">{item.blurb}</span></span>
        <ChevronRight className="hub-tile__go" aria-hidden="true" />
      </Link>
    </li>
  );
}

/** Everything on Arcway, grouped from simplest to most technical. Replaces the old dropdown menu. */
export function MoreHub() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);
  return (
    <div className="hub">
      <button type="button" className="hub-search" onClick={openSearch}>
        <Search aria-hidden="true" /><span>Search apps, builders, addresses…</span>
      </button>
      {NAV_GROUPS.map((g, i) => (
        <section key={g.label} className="hub-group" aria-labelledby={`hub-${i}`}>
          <h2 id={`hub-${i}`} className="hub-group__title">{g.label}</h2>
          <ul className="hub-grid">{g.items.map((n) => <Tile key={n.href} item={n} hue={HUES[i % HUES.length]} />)}</ul>
        </section>
      ))}
      <section className="hub-group" aria-labelledby="hub-you">
        <h2 id="hub-you" className="hub-group__title">You</h2>
        <ul className="hub-grid">
          {[...YOU_NAV, ...SECONDARY_NAV.filter((n) => n.href !== "/search")].map((n) => <Tile key={n.href} item={n} hue="sky" />)}
          <li>
            <button type="button" className="hub-tile" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
              <IconOrb icon={dark ? Sun : Moon} hue="pink" size="sm" />
              <span className="hub-tile__text"><span className="hub-tile__name">{dark ? "Light theme" : "Dark theme"}</span><span className="hub-tile__blurb">Switch how Arcway looks</span></span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
