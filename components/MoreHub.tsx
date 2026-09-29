'use client';

import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MORE_NAV, SECTION_VIEWS, YOU_NAV, type NavItem } from "../lib/nav";
import { THEME_EVENT, toggleTheme } from "../lib/theme";
import { openSearch } from "./SearchPalette";

function Tile({ item }: { item: NavItem }) {
  return (
    <li>
      <Link href={item.href} className="hub-tile">
        <span className="hub-tile__text"><span className="hub-tile__name">{item.label}</span><span className="hub-tile__blurb">{item.blurb}</span></span>
        <ChevronRight className="hub-tile__go" aria-hidden="true" />
      </Link>
    </li>
  );
}

const byHref = (href: string) => [...MORE_NAV, ...Object.values(SECTION_VIEWS).flat()].find((n) => n.href === href)!;
const withBlurb = (n: NavItem, blurb: string): NavItem => ({ ...n, blurb: n.blurb || blurb });

/** More: everything beyond the four public jobs, simplest first. */
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "Understand Arc", items: ["/pulse", "/radar", "/signals"].map(byHref) },
  { title: "Explore more", items: [byHref("/ecosystem"), byHref("/assets"), byHref("/builders")] },
  { title: "Earn more", items: [byHref("/campaigns"), byHref("/leaderboard")] },
  { title: "For Builders", items: [withBlurb(byHref("/submit"), "Get your Arc app listed"), byHref("/launch"), byHref("/widgets")] }
];

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
        <Search aria-hidden="true" /><span>Search apps, quests, builders, addresses…</span>
      </button>
      {GROUPS.map((g, i) => (
        <section key={g.title} className="hub-group" aria-labelledby={`hub-${i}`}>
          <h2 id={`hub-${i}`} className="hub-group__title">{g.title}</h2>
          <ul className="hub-grid">{g.items.map((n) => <Tile key={n.href} item={n} />)}</ul>
        </section>
      ))}
      <section className="hub-group" aria-labelledby="hub-you">
        <h2 id="hub-you" className="hub-group__title">You and settings</h2>
        <ul className="hub-grid">
          {[byHref("/watchlist"), ...YOU_NAV, byHref("/settings")].map((n) => <Tile key={n.href} item={n} />)}
          <li>
            <button type="button" className="hub-tile" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
              <span className="hub-tile__text"><span className="hub-tile__name">{dark ? "Light theme" : "Dark theme"}</span><span className="hub-tile__blurb">Switch how Arcway looks</span></span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  );
}
