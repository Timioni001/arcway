'use client';

import { Bell, Blocks, Bookmark, Code2, Coins, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { builderMark, buildersFrom, getBuilder } from "../lib/builders";
import { useIntel } from "../lib/hooks/useIntel";
import { APPS, CATEGORIES, categoryCounts, getApp, type Category } from "../lib/registry";
import { parseWatchId } from "../lib/watchlist";
import { AppMark, CATEGORY_META, CategoryTile } from "./CategoryIcon";
import { IntelGate, PanelHead, SignalList, SourceTag } from "./Intel";
import { WatchedAssets } from "./Assets";
import { ProtocolActivity } from "./IntelPages";
import { FollowButton, useWatchlist } from "./SaveButton";

/** What you follow, with live context. Stored in this browser; alerts can build on it later. */
export function WatchlistView() {
  const list = useWatchlist();
  const parsed = list.map(parseWatchId).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const apps = parsed.filter((p) => p.kind === "app").map((p) => getApp(p.key)).filter((a) => a && !a.sample) as NonNullable<ReturnType<typeof getApp>>[];
  const builders = parsed.filter((p) => p.kind === "builder").map((p) => getBuilder(p.key)).filter(Boolean) as NonNullable<ReturnType<typeof getBuilder>>[];
  const categories = parsed.filter((p) => p.kind === "category" && CATEGORIES.includes(p.key as Category)).map((p) => p.key as Category);
  const assets = parsed.filter((p) => p.kind === "asset").map((p) => p.key);
  const counts = categoryCounts(APPS.filter((a) => !a.sample));

  // Signals touching anything followed: its apps, its builders' apps, or apps in its categories.
  const followedSlugs = useMemo(() => new Set([
    ...apps.map((a) => a.slug),
    ...builders.flatMap((b) => b.apps.map((a) => a.slug)),
    ...APPS.filter((a) => categories.includes(a.category)).map((a) => a.slug)
  ]), [apps, builders, categories]);
  const signals = useIntel("signals");
  const relevant = (signals.data?.data ?? []).filter((s) => s.entity?.appSlug && followedSlugs.has(s.entity.appSlug));

  if (!parsed.length) {
    const featured = APPS.find((a) => a.featured)!;
    return (
      <div className="stack-col">
        <div className="intel-empty" style={{ borderStyle: "solid" }}>
          <Bookmark aria-hidden="true" style={{ color: "var(--blue)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>Nothing followed yet</div>
            <p className="small secondary">Follow apps, builders, assets or categories to keep them here, with their activity and signals in one place.</p>
          </div>
        </div>
        <section className="panel" aria-labelledby="suggest-title">
          <PanelHead icon={Bookmark} title="Suggestions" id="suggest-title" />
          <ul className="wrows">
            <li className="wrow"><AppMark app={featured} size="sm" /><span className="wrow__main"><Link href={`/apps/${featured.slug}`}>{featured.name}</Link><span className="xs secondary">Protocol · {featured.category}</span></span><FollowButton kind="app" id={featured.id} name={featured.name} /></li>
            {(["Payments", "Trading", "Lend & Earn"] as Category[]).map((c) => (
              <li key={c} className="wrow"><CategoryTile category={c} size="sm" /><span className="wrow__main"><Link href={`/ecosystem?category=${encodeURIComponent(c)}#protocols`}>{c}</Link><span className="xs secondary">Category · {counts[c]} apps</span></span><FollowButton kind="category" id={c} name={c} /></li>
            ))}
            {buildersFrom().slice(0, 1).map((b) => (
              <li key={b.id} className="wrow"><AppMark app={builderMark(b)} size="sm" /><span className="wrow__main"><Link href={`/builders/${b.id}`}>{b.name}</Link><span className="xs secondary">Builder · {b.apps.length} apps</span></span><FollowButton kind="builder" id={b.id} name={b.name} /></li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="split split--wide-left" style={{ paddingTop: 28 }}>
      <div className="stack-col">
        {apps.length > 0 && (
          <section className="panel" aria-labelledby="w-apps">
            <PanelHead icon={Blocks} title="Protocols" id="w-apps"><span className="mono xs secondary">{apps.length}</span></PanelHead>
            <ul className="wrows">
              {apps.map((a) => (
                <li key={a.id} className="wrow">
                  <AppMark app={a} size="sm" />
                  <span className="wrow__main"><Link href={`/apps/${a.slug}`}>{a.name}</Link><span className="xs secondary">{a.category}</span></span>
                  <span className="wrow__data"><ProtocolActivity app={a} /></span>
                  <FollowButton kind="app" id={a.id} name={a.name} variant="icon" />
                </li>
              ))}
            </ul>
          </section>
        )}
        {builders.length > 0 && (
          <section className="panel" aria-labelledby="w-builders">
            <PanelHead icon={Code2} title="Builders" id="w-builders"><span className="mono xs secondary">{builders.length}</span></PanelHead>
            <ul className="wrows">
              {builders.map((b) => (
                <li key={b.id} className="wrow">
                  <AppMark app={builderMark(b)} size="sm" />
                  <span className="wrow__main"><Link href={`/builders/${b.id}`}>{b.name}</Link><span className="xs secondary">{b.apps.map((a) => a.name).join(", ")}</span></span>
                  <FollowButton kind="builder" id={b.id} name={b.name} variant="icon" />
                </li>
              ))}
            </ul>
          </section>
        )}
        {assets.length > 0 && (
          <section className="panel" aria-labelledby="w-assets">
            <PanelHead icon={Coins} title="Assets" id="w-assets"><span className="mono xs secondary">{assets.length}</span></PanelHead>
            <WatchedAssets addresses={assets} />
          </section>
        )}
        {categories.length > 0 && (
          <section className="panel" aria-labelledby="w-cats">
            <PanelHead icon={LayoutGrid} title="Categories" id="w-cats"><span className="mono xs secondary">{categories.length}</span></PanelHead>
            <ul className="wrows">
              {categories.map((c) => (
                <li key={c} className="wrow">
                  <CategoryTile category={c} size="sm" />
                  <span className="wrow__main"><Link href={`/ecosystem?category=${encodeURIComponent(c)}#protocols`}>{c}</Link><span className="xs secondary">{CATEGORY_META[c].blurb} · {counts[c]} apps</span></span>
                  <FollowButton kind="category" id={c} name={c} variant="icon" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <section className="panel" aria-labelledby="w-signals">
        <PanelHead icon={Bell} title="Signals for what you follow" id="w-signals"><SourceTag source="observed" period="Live" /></PanelHead>
        <IntelGate query={signals} rows={4}>
          {relevant.length ? <SignalList signals={relevant} /> : <p className="small secondary intel-note">No signals for what you follow right now. They appear here when Arc data shows a change.</p>}
        </IntelGate>
      </section>
    </div>
  );
}
