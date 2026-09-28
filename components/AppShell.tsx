'use client';

import { ArrowUpRight, Bookmark, ChevronRight, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { NETWORK_NAME } from "../lib/config";
import { BOTTOM_NAV, NAV_GROUPS, SECONDARY_NAV, crumbsFor, isActive, sectionFor, type NavItem } from "../lib/nav";
import { THEME_EVENT, toggleTheme } from "../lib/theme";
import { getWatchlist, getWatchlistServer, subscribeWatchlist } from "../lib/watchlist";
import { Logo, LogoMark } from "./Logo";
import { Notifications } from "./Notifications";
import { SearchButton, openSearch } from "./SearchPalette";
import { WalletButton } from "./WalletButton";

const RAIL_KEY = "arcway:rail";

function useDark() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);
  return dark;
}

export function useWatchCount() {
  return useSyncExternalStore(subscribeWatchlist, getWatchlist, getWatchlistServer).length;
}

function RailLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  if (item.href === "/search") {
    return (
      <button type="button" className="rail__link" data-label={item.label} onClick={() => { onNavigate?.(); openSearch(); }}>
        <Icon aria-hidden="true" /><span className="rail__label">{item.label}</span><kbd className="kbd rail__kbd">⌘K</kbd>
      </button>
    );
  }
  return (
    <Link href={item.href} className="rail__link" data-label={item.label} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      <Icon aria-hidden="true" /><span className="rail__label">{item.label}</span>
    </Link>
  );
}

/** Persistent left navigation: an OS-style rail, quiet so the workspace stays dominant. */
export function Rail() {
  const pathname = usePathname();
  const dark = useDark();
  const [tabletOpen, setTabletOpen] = useState(false);
  const railRef = useRef<HTMLElement>(null);

  useEffect(() => setTabletOpen(false), [pathname]);
  useEffect(() => {
    if (!tabletOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setTabletOpen(false);
    const onDown = (e: PointerEvent) => !railRef.current?.contains(e.target as Node) && setTabletOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [tabletOpen]);

  const toggle = useCallback(() => {
    // Tablet widths overlay the expanded rail; desktop remembers the choice.
    if (window.matchMedia("(max-width: 1199px)").matches) { setTabletOpen((o) => !o); return; }
    const root = document.documentElement;
    const next = root.dataset.rail === "collapsed" ? "expanded" : "collapsed";
    root.dataset.rail = next;
    try { localStorage.setItem(RAIL_KEY, next); } catch { /* not persisted */ }
  }, []);

  const close = () => setTabletOpen(false);
  return (
    <aside ref={railRef} className="rail" data-open={tabletOpen} aria-label="Sidebar">
      <div className="rail__brand">
        <Link href="/" className="logo" aria-label="Arcway overview" onClick={close}>
          <LogoMark id="aw-mark-rail" />
          <span className="logo__word rail__label">arcway</span>
        </Link>
        <button type="button" className="icon-btn rail__toggle" onClick={toggle} aria-label="Toggle sidebar" aria-expanded={tabletOpen || undefined}>
          <PanelLeftClose className="rail__icon-close" aria-hidden="true" />
          <PanelLeftOpen className="rail__icon-open" aria-hidden="true" />
        </button>
      </div>
      <nav className="rail__nav" aria-label="Main">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="rail__group">
            <div className="rail__heading" aria-hidden="true"><span className="rail__label">{g.label}</span></div>
            <ul aria-label={g.label}>{g.items.map((n) => <li key={n.href}><RailLink item={n} pathname={pathname} onNavigate={close} /></li>)}</ul>
          </div>
        ))}
      </nav>
      <nav className="rail__nav rail__nav--secondary" aria-label="More">
        <ul>
          {SECONDARY_NAV.filter((n) => n.href !== "/search").map((n) => <li key={n.href}><RailLink item={n} pathname={pathname} onNavigate={close} /></li>)}
        </ul>
      </nav>
      <div className="rail__foot">
        <Link href="/quests" className="rail-promo" onClick={close}>
          <span className="rail-promo__title">Earn your passport</span>
          <span className="rail-promo__body">Short quests that teach Arc. Each one adds XP and a badge.</span>
          <span className="rail-promo__cta">Start a quest<i aria-hidden="true"><ArrowUpRight /></i></span>
        </Link>
        <button type="button" className="rail__link" data-label={dark ? "Light theme" : "Dark theme"} onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
          {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span className="rail__label">{dark ? "Light theme" : "Dark theme"}</span>
        </button>
        <span className="rail__net" title={NETWORK_NAME}><i aria-hidden="true" /><span className="rail__label">{NETWORK_NAME}</span></span>
      </div>
    </aside>
  );
}

function Crumbs({ pathname }: { pathname: string }) {
  const crumbs = crumbsFor(pathname);
  return (
    <nav className="topbar__crumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <li aria-hidden="true"><ChevronRight /></li>}
            <li>{c.href && i < crumbs.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</span>}</li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

function WatchlistLink() {
  const count = useWatchCount();
  return (
    <Link href="/watchlist" className="icon-btn" aria-label={`Watchlist${count ? `, ${count} followed` : ""}`}>
      <Bookmark aria-hidden="true" />
      {count > 0 && <span className="icon-btn__count mono" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}

/** Pill tabs for the pages in the current section (wide screens, top-level pages only). */
function SectionTabs({ pathname }: { pathname: string }) {
  const group = sectionFor(pathname);
  if (!group) return null;
  return (
    <nav className="stabs" aria-label={`${group.label} pages`}>
      {group.items.map((n) => (
        <Link key={n.href} href={n.href} className="stabs__tab" aria-current={n.href === pathname ? "page" : undefined}>{n.label}</Link>
      ))}
    </nav>
  );
}

/** Desktop and tablet: where you are, search, watchlist, notifications, profile. No balances, no swaps. */
export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <Crumbs pathname={pathname} />
      <SectionTabs pathname={pathname} />
      <div className="topbar__tools">
        <SearchButton />
        <WatchlistLink />
        <Notifications />
        <WalletButton />
      </div>
    </header>
  );
}

/** Mobile: a calm top bar (logo, search, connect). Navigation lives in the bottom tabs and the More page. */
export function MobileTop() {
  return (
    <header className="mtop">
      <div className="mtop__bar">
        <Logo id="aw-mark-m" />
        <div className="mtop__tools">
          <SearchButton variant="icon" />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

const TAB_HREFS = BOTTOM_NAV.filter((n) => n.href !== "/more").map((n) => n.href);

/** iOS-style: the tab bar tucks into a compact pill while you scroll down, and returns on the way up. */
function useCompactOnScroll() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 8) { setCompact(y > last && y > 160); last = y; }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return compact;
}

export function BottomBar() {
  const pathname = usePathname();
  const compact = useCompactOnScroll();
  const inTabs = TAB_HREFS.some((h) => isActive(pathname, h));
  const index = BOTTOM_NAV.findIndex((n) => (n.href === "/more" ? !inTabs : isActive(pathname, n.href)));
  return (
    <nav className="bottombar" aria-label="Quick" data-compact={compact || undefined} style={{ "--i": Math.max(index, 0) } as React.CSSProperties}>
      <span className="bottombar__lens" aria-hidden="true" />
      {BOTTOM_NAV.map((n) => {
        const Icon = n.icon;
        const active = n.href === "/more" ? !inTabs : isActive(pathname, n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
