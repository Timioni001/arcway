'use client';

import { Bookmark, ChevronDown, ChevronRight, LayoutGrid, Moon, PanelLeftClose, PanelLeftOpen, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { NETWORK_NAME } from "../lib/config";
import { BOTTOM_NAV, MORE_NAV, NAV_GROUPS, SECONDARY_NAV, crumbsFor, isBottomActive, isNavActive, viewsFor, type NavItem } from "../lib/nav";
import { THEME_EVENT, toggleTheme } from "../lib/theme";
import { getWatchlist, getWatchlistServer, subscribeWatchlist } from "../lib/watchlist";
import { Logo, LogoMark } from "./Logo";
import { Notifications } from "./Notifications";
import { SearchButton, openSearch } from "./SearchPalette";
import { WalletButton } from "./WalletButton";

const RAIL_KEY = "arcway:rail";
const MORE_KEY = "arcway:rail-more";

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

function RailLink({ item, pathname, onNavigate, exact }: { item: NavItem; pathname: string; onNavigate?: () => void; exact?: boolean }) {
  const active = exact ? pathname === item.href || pathname.startsWith(`${item.href}/`) : isNavActive(pathname, item.href);
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

/** "More" expands in place: deeper areas (Activity, What's New, Insights) and secondary tools. */
function RailMore({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  const inMore = MORE_NAV.some((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let stored = false;
    try { stored = localStorage.getItem(MORE_KEY) === "open"; } catch { /* not persisted */ }
    setOpen(stored || inMore);
  }, [inMore]);
  const toggle = () => setOpen((o) => {
    try { localStorage.setItem(MORE_KEY, o ? "closed" : "open"); } catch { /* not persisted */ }
    return !o;
  });
  return (
    <nav className="rail__nav rail__more" aria-label="More">
      <button type="button" className="rail__link rail__more-toggle" data-label="More" aria-expanded={open} aria-controls="rail-more-list" onClick={toggle}>
        <LayoutGrid aria-hidden="true" /><span className="rail__label">More</span><ChevronDown className="rail__chev rail__label" aria-hidden="true" />
      </button>
      <ul id="rail-more-list" hidden={!open}>
        {MORE_NAV.map((n) => <li key={n.href}><RailLink item={n} pathname={pathname} onNavigate={onNavigate} exact /></li>)}
      </ul>
    </nav>
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
          <div key={g.label || "top"} className="rail__group">
            {g.label && <div className="rail__heading" aria-hidden="true"><span className="rail__label">{g.label}</span></div>}
            <ul aria-label={g.label || "Overview"}>{g.items.map((n) => <li key={n.href}><RailLink item={n} pathname={pathname} onNavigate={close} /></li>)}</ul>
          </div>
        ))}
      </nav>
      <RailMore pathname={pathname} onNavigate={close} />
      <nav className="rail__nav rail__nav--secondary" aria-label="Utilities">
        <ul>
          {SECONDARY_NAV.map((n) => <li key={n.href}><RailLink item={n} pathname={pathname} onNavigate={close} /></li>)}
        </ul>
      </nav>
      <div className="rail__foot">
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

/** Views folded into the current section (Quests → Campaigns, Leaderboard, Passport). All widths, top-level pages only. */
export function SectionViews() {
  const pathname = usePathname();
  const views = viewsFor(pathname);
  if (!views) return null;
  return (
    <div className="container sviews-wrap">
      <nav className="sviews" aria-label="Views in this section">
        {views.map((n) => (
          <Link key={n.href} href={n.href} className="sviews__tab" aria-current={n.href === pathname ? "page" : undefined}>{n.label}</Link>
        ))}
      </nav>
    </div>
  );
}

/** Desktop and tablet: where you are, search, watchlist, notifications, profile. No balances, no swaps. */
export function Topbar() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <Crumbs pathname={pathname} />
      <div className="topbar__tools">
        <SearchButton />
        <WatchlistLink />
        <Notifications />
        <WalletButton />
      </div>
    </header>
  );
}

/** Mobile: logo, search, connect. Navigation lives in the bottom tabs; More lists everything else. */
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
  const index = BOTTOM_NAV.findIndex((n) => isBottomActive(pathname, n.href));
  return (
    <nav className="bottombar" aria-label="Quick" data-compact={compact || undefined} data-lens={index >= 0 || undefined} style={{ "--i": Math.max(index, 0) } as React.CSSProperties}>
      <span className="bottombar__lens" aria-hidden="true" />
      {BOTTOM_NAV.map((n) => {
        const Icon = n.icon;
        const active = isBottomActive(pathname, n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
