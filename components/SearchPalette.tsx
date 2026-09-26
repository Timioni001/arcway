'use client';

import { Compass, Copy, CornerDownLeft, IdCard, Link2, Moon, Plus, Route, Search, Target, Users, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { buildersFrom } from "../lib/builders";
import { QUESTS } from "../lib/quests";
import { addArcToWallet } from "../lib/addToWallet";
import { NETWORK_NAME } from "../lib/config";
import { useArcwayState } from "../lib/hooks/context";
import { useToast } from "../lib/hooks/toast";
import { APPS, discoverApps } from "../lib/registry";
import { toggleTheme } from "../lib/theme";
import { TRAILS } from "../lib/trails";
import { AppLogo } from "./AppCard";

type Item = { id: string; group: string; title: string; sub: string; href?: string; run?: () => void; icon: ReactNode; keywords?: string };

const tile = (Icon: LucideIcon, shade: 1 | 2 | 3) => <span className="tile" data-shade={shade}><Icon aria-hidden="true" /></span>;

const PAGES: Item[] = [
  { id: "p-apps", group: "Pages", title: "Discover", sub: "Browse all apps", href: "/apps", icon: tile(Compass, 1) },
  { id: "p-quests", group: "Pages", title: "Quests", sub: "Earn XP", href: "/quests", icon: tile(Target, 2) },
  { id: "p-builders", group: "Pages", title: "Builders", sub: "Teams on Arc", href: "/builders", icon: tile(Users, 3) },
  { id: "p-passport", group: "Pages", title: "Passport", sub: "Your XP and badges", href: "/passport", icon: tile(IdCard, 1) }
];

function results(term: string, actions: Item[]): Item[] {
  const t = term.trim().toLowerCase();
  const apps = discoverApps(APPS, { search: t }).map<Item>((a) => ({
    id: `a-${a.id}`, group: "Apps", title: a.name, sub: `${a.category} · ${a.tagline}`, href: `/apps/${a.slug}`, icon: <AppLogo app={a} />
  }));
  if (!t) return [...actions, ...PAGES, ...apps.slice(0, 3)];
  const quests = QUESTS.filter((q) => `${q.title} ${q.description}`.toLowerCase().includes(t)).map<Item>((q) => ({
    id: `q-${q.id}`, group: "Quests", title: q.title, sub: `+${q.xp} XP · ${q.description}`, href: `/quests/${q.id}`, icon: tile(Target, 2)
  }));
  const builders = buildersFrom().filter((b) => b.name.toLowerCase().includes(t)).map<Item>((b) => ({
    id: `b-${b.id}`, group: "Builders", title: b.name, sub: `${b.apps.length} app${b.apps.length === 1 ? "" : "s"}`, href: "/builders", icon: tile(Users, 3)
  }));
  const pages = PAGES.filter((p) => p.title.toLowerCase().includes(t));
  const trails = TRAILS.filter((tr) => `${tr.title} ${tr.goal}`.toLowerCase().includes(t)).map<Item>((tr) => ({
    id: `t-${tr.id}`, group: "Trails", title: tr.title, sub: tr.goal, href: `/trails/${tr.id}`, icon: tile(Route, 1)
  }));
  const acts = actions.filter((a) => `${a.title} ${a.sub} ${a.keywords ?? ""}`.toLowerCase().includes(t));
  return [...acts, ...apps, ...trails, ...quests, ...builders, ...pages];
}

/** Search everything from anywhere: ⌘K / Ctrl+K or "/". */
export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
  const items = useMemo(() => results(term, actions), [term, actions]);

  const close = useCallback(() => {
    setOpen(false);
    setTerm("");
    setActive(0);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.matches("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      <button ref={triggerRef} className="search-btn" onClick={() => setOpen(true)} aria-label="Search">
        <Search aria-hidden="true" /><span>Search Arcway</span><kbd className="kbd">⌘K</kbd>
      </button>
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
                placeholder="Search or type a command…"
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
