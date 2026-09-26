'use client';

import { Bookmark, ChevronDown, ChevronRight, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { NETWORK_NAME } from "../lib/config";
import { BOTTOM_NAV, NAV_GROUPS, PRIMARY_NAV, SECONDARY_NAV, YOU_NAV, crumbsFor, isActive, type NavItem } from "../lib/nav";
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

/** Mobile: compact top bar with one dropdown holding the full feature set. */
export function MobileTop() {
  const pathname = usePathname();
  const dark = useDark();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const current = crumbsFor(pathname)[0].label;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); lastTrigger.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => { lastTrigger.current = e.currentTarget; setOpen((o) => !o); };
  const group = (title: string, items: NavItem[]) => (
    <div className="mmenu__group">
      <div className="label">{title}</div>
      <ul>
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <li key={n.href}>
              {n.href === "/search" ? (
                <button type="button" className="mmenu__link" onClick={() => { setOpen(false); openSearch(); }}><Icon aria-hidden="true" /><span>{n.label}<small>{n.blurb}</small></span></button>
              ) : (
                <Link href={n.href} className="mmenu__link" aria-current={isActive(pathname, n.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                  <Icon aria-hidden="true" /><span>{n.label}<small>{n.blurb}</small></span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <header className="mtop">
      <div className="mtop__bar">
        <Logo id="aw-mark-m" />
        <div className="mtop__tools">
          <SearchButton variant="icon" />
          <WalletButton />
          <button type="button" className="icon-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls={panelId} onClick={toggle}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      <button type="button" className="mtop__switch" aria-expanded={open} aria-controls={panelId} onClick={toggle}>
        <span className="visually-hidden">Current section: </span>{current}<ChevronDown aria-hidden="true" />
      </button>
      <div ref={panelRef} id={panelId} className="mmenu" data-open={open} hidden={!open}>
        <nav aria-label="Main menu">
          {NAV_GROUPS.map((g) => <div key={g.label}>{group(g.label, g.items)}</div>)}
          {group("Tools", SECONDARY_NAV)}
          {group("You", YOU_NAV)}
        </nav>
        <button type="button" className="mmenu__link mmenu__theme" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
          {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}<span>{dark ? "Light theme" : "Dark theme"}</span>
        </button>
      </div>
      {open && <div className="mmenu__scrim" aria-hidden="true" onClick={() => setOpen(false)} />}
    </header>
  );
}

export function BottomBar() {
  const pathname = usePathname();
  const icons = Object.fromEntries([...PRIMARY_NAV, ...SECONDARY_NAV].map((n) => [n.href, n.icon]));
  return (
    <nav className="bottombar" aria-label="Quick">
      {BOTTOM_NAV.map((n) => {
        const Icon = icons[n.href];
        return (
          <Link key={n.href} href={n.href} aria-current={isActive(pathname, n.href) ? "page" : undefined}>
            <Icon aria-hidden="true" />{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
