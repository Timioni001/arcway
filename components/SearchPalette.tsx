'use client';

import { ArrowLeftRight, Award, Coins, Copy, RadioTower, CornerDownLeft, FileCode2, History, IdCard, Link2, Moon, Plus, Route, Search, Target, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { builderMark } from "../lib/builders";
import { getRecent, getRecentServer, rememberSearch, subscribeRecent } from "../lib/recentSearches";
import { searchAll, suggestedCategories } from "../lib/search";
import { addArcToWallet } from "../lib/addToWallet";
import { NETWORK_NAME } from "../lib/config";
import { useArcwayState } from "../lib/hooks/context";
import { useIntel } from "../lib/hooks/useIntel";
import type { Asset } from "../lib/assets";
import type { Signal } from "../lib/intel";
import { useToast } from "../lib/hooks/toast";
import { APPS, discoverApps } from "../lib/registry";
import { toggleTheme } from "../lib/theme";
import { QUESTS } from "../lib/quests";
import { ALL_PAGES } from "../lib/nav";
import { explorer } from "../lib/config";
import { AppLogo } from "./AppCard";
import { AppMark, CategoryTile } from "./CategoryIcon";

type Item = { id: string; group: string; title: string; sub: string; href?: string; run?: () => void; icon: ReactNode; keywords?: string; fill?: string };

const tile = (Icon: LucideIcon, shade: 1 | 2 | 3) => <span className="tile" data-shade={shade}><Icon aria-hidden="true" /></span>;

const PAGES: Item[] = ALL_PAGES.filter((n) => n.href !== "/search").map((n, i) => ({
  id: `p-${n.href}`, group: "Pages", title: n.label, sub: n.blurb, href: n.href, icon: tile(n.icon, ((i % 3) + 1) as 1 | 2 | 3)
}));

function results(term: string, actions: Item[], recent: string[], live: { assets: Asset[]; signals: Signal[] }): Item[] {
  const t = term.trim().toLowerCase();
  if (!t) {
    const rec = recent.map<Item>((r) => ({ id: `r-${r}`, group: "Recent searches", title: r, sub: "Search again", icon: tile(History, 1), fill: r }));
    const cats = suggestedCategories().map<Item>((c) => ({
      id: `c-${c}`, group: "Suggested categories", title: c, sub: "Browse apps", href: `/apps?category=${encodeURIComponent(c)}`, icon: <CategoryTile category={c} size="sm" />
    }));
    return [...rec, ...cats, ...actions, ...PAGES];
  }
  const r = searchAll(term);
  const assetHit = r.onchain?.kind === "address" ? live.assets.find((a) => a.address.toLowerCase() === r.onchain!.value.toLowerCase()) : undefined;
  const onchain: Item[] = !r.onchain ? [] : r.onchain.kind === "tx"
    ? [{ id: "o-tx", group: "Onchain", title: "View transaction", sub: r.onchain.value, run: () => { window.open(explorer.tx((r.onchain as { value: string }).value), "_blank", "noopener"); }, icon: tile(ArrowLeftRight, 2) }]
    : [
        ...(assetHit ? [{ id: "o-asset", group: "Onchain", title: `${assetHit.symbol} token`, sub: "Open asset", href: `/assets/${assetHit.address}`, icon: tile(Coins, 1) }] : []),
        ...(r.onchain.app ? [{ id: "o-app", group: "Onchain", title: `${r.onchain.app.name} contract`, sub: "Open protocol", href: `/apps/${r.onchain.app.slug}`, icon: <AppLogo app={r.onchain.app} /> }] : []),
        { id: "o-addr", group: "Onchain", title: "View address on explorer", sub: r.onchain.value, run: () => { window.open(explorer.address((r.onchain as { value: string }).value), "_blank", "noopener"); }, icon: tile(FileCode2, 2) },
        { id: "o-pass", group: "Onchain", title: "Open passport", sub: "XP and activity for this wallet", href: `/passport/${r.onchain.value}`, icon: tile(IdCard, 3) }
      ];
  const apps = r.apps.map<Item>((a) => ({
    id: `a-${a.id}`, group: "Apps", title: a.name, sub: `${a.category} · ${a.tagline}`, href: `/apps/${a.slug}`, icon: <AppLogo app={a} />
  }));
  const cats = r.categories.map<Item>((c) => ({
    id: `c-${c}`, group: "Categories", title: c, sub: "Browse apps", href: `/apps?category=${encodeURIComponent(c)}`, icon: <CategoryTile category={c} size="sm" />
  }));
  const quests = r.quests.map<Item>((q) => ({
    id: `q-${q.id}`, group: "Quests", title: q.title, sub: `+${q.xp} XP · ${q.description}`, href: `/quests/${q.id}`, icon: tile(Target, 2)
  }));
  const builders = r.builders.map<Item>((b) => ({
    id: `b-${b.id}`, group: "Builders", title: b.name, sub: `${b.apps.length} app${b.apps.length === 1 ? "" : "s"}`, href: `/builders/${b.id}`, icon: <AppMark app={builderMark(b)} />
  }));
  const pages = PAGES.filter((p) => p.title.toLowerCase().includes(t));
  const assets = r.onchain ? [] : live.assets.filter((a) => `${a.symbol} ${a.name}`.toLowerCase().includes(t)).slice(0, 5).map<Item>((a) => ({
    id: `as-${a.address}`, group: "Assets", title: a.symbol, sub: `${a.name}${a.holders !== null ? ` · ${a.holders.toLocaleString("en-US")} holders` : ""}`, href: `/assets/${a.address}`, icon: tile(Coins, 1)
  }));
  const badges = r.onchain ? [] : QUESTS.filter((q) => `${q.badge.name} ${q.badge.description}`.toLowerCase().includes(t)).map<Item>((q) => ({
    id: `bd-${q.id}`, group: "Badges", title: q.badge.name, sub: `Earned by the ${q.title} quest`, href: "/passport#rewards", icon: tile(Award, 2)
  }));
  const signals = r.onchain ? [] : live.signals.filter((s) => `${s.title} ${s.detail} ${s.entity?.label ?? ""}`.toLowerCase().includes(t)).slice(0, 4).map<Item>((s) => ({
    id: `sg-${s.id}`, group: "Insights", title: s.title, sub: s.period, href: "/signals", icon: tile(RadioTower, 3)
  }));
  const trails = r.trails.map<Item>((tr) => ({
    id: `t-${tr.id}`, group: "Trails", title: tr.title, sub: tr.goal, href: `/trails/${tr.id}`, icon: tile(Route, 1)
  }));
  const acts = actions.filter((a) => `${a.title} ${a.sub} ${a.keywords ?? ""}`.toLowerCase().includes(t));
  const all: Item = { id: "s-all", group: "Search", title: `See all results for “${term.trim()}”`, sub: "Apps, builders, assets, quests and more", href: `/search?q=${encodeURIComponent(term.trim())}`, icon: tile(Search, 3) };
  return [...onchain, ...acts, ...apps, ...quests, ...builders, ...assets, ...badges, ...signals, ...cats, ...trails, ...pages, all];
}

const OPEN_EVENT = "arcway:search";

/** Open the one search palette from any trigger. */
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** A trigger styled for where it sits; the palette itself is mounted once by the shell. */
export function SearchButton({ variant = "bar" }: { variant?: "bar" | "icon" }) {
  return variant === "icon" ? (
    <button className="icon-btn" onClick={openSearch} aria-label="Search" aria-keyshortcuts="Control+K Meta+K">
      <Search aria-hidden="true" />
    </button>
  ) : (
    <button className="search-btn" onClick={openSearch} aria-label="Search" aria-keyshortcuts="Control+K Meta+K">
      <Search aria-hidden="true" /><span>Search Arc…</span><kbd className="kbd">⌘K</kbd>
    </button>
  );
}

/** Search everything from anywhere: ⌘K / Ctrl+K or "/". */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const listId = useId();
  const { connection } = useArcwayState();
  const toast = useToast();
  const actions = useMemo<Item[]>(() => {
    const list: Item[] = [
      { id: "x-pay", group: "Actions", title: "Create a pay link", sub: "Get paid in USDC with a link or QR", href: "/pay", icon: tile(Link2, 2), keywords: "request money qr" },
      {
        id: "x-add", group: "Actions", title: `Add ${NETWORK_NAME} to wallet`, sub: "One click, no connecting needed", icon: tile(Plus, 3), keywords: "network metamask",
        run: async () => {
          const r = await addArcToWallet();
          toast(r === "added" ? `${NETWORK_NAME} is in your wallet` : r === "no-wallet" ? "No browser wallet found" : "Nothing changed in your wallet");
        }
      },
      { id: "x-theme", group: "Actions", title: "Switch theme", sub: "Light or dark", icon: tile(Moon, 1), keywords: "dark light mode", run: () => { toggleTheme(); } }
    ];
    if (connection.address) {
      const address = connection.address;
      list.push({
        id: "x-copy", group: "Actions", title: "Copy my address", sub: address, icon: tile(Copy, 2), keywords: "wallet",
        run: async () => { try { await navigator.clipboard.writeText(address); toast("Address copied"); } catch { toast("Couldn't copy"); } }
      });
    }
    return list;
  }, [connection.address, toast]);
  const recent = useSyncExternalStore(subscribeRecent, getRecent, getRecentServer);
  const assetsQ = useIntel("assets", open);
  const signalsQ = useIntel("signals", open);
  const live = useMemo(() => ({ assets: assetsQ.data?.data ?? [], signals: signalsQ.data?.data ?? [] }), [assetsQ.data, signalsQ.data]);
  const items = useMemo(() => results(term, actions, recent, live), [term, actions, recent, live]);

  const close = useCallback(() => {
    setOpen(false);
    setTerm("");
    setActive(0);
    returnFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.matches("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        returnFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    };
    const onOpen = () => { returnFocus.current = document.activeElement as HTMLElement | null; setOpen(true); };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(OPEN_EVENT, onOpen); };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => setActive(0), [term]);

  const go = (item?: Item) => {
    if (!item) return;
    if (item.fill) { setTerm(item.fill); inputRef.current?.focus(); return; }
    if (term.trim()) rememberSearch(term);
    close();
    if (item.run) item.run();
    else if (item.href) router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(items[active]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { e.preventDefault(); } // keep focus in the dialog
  };

  let lastGroup = "";
  return (
    <>
      {open && (
        <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="Search Arcway">
            <div className="palette__input">
              <Search aria-hidden="true" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search protocols, builders, addresses, or type a command…"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={items[active] ? `${listId}-${items[active].id}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="kbd">Esc</kbd>
            </div>
            <div className="palette__list" role="listbox" id={listId}>
              {items.length === 0 && <p className="small secondary" style={{ padding: 16 }}>No results for “{term}”.</p>}
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? (lastGroup = item.group) : null;
                return (
                  <div key={item.id}>
                    {header && <div className="palette__group label">{header}</div>}
                    <div
                      id={`${listId}-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      className="palette__item"
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(item)}
                    >
                      {item.icon}
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600 }}>{item.title}</span>
                        <span className="xs secondary" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="palette__foot" aria-hidden="true">
              <span><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> Move</span>
              <span><kbd className="kbd"><CornerDownLeft style={{ width: 12, height: 12 }} /></kbd> Open</span>
              <span><kbd className="kbd">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
