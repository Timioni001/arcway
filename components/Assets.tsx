'use client';

import { ArrowUpRight, Coins } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Asset } from "../lib/assets";
import { explorer } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useAssetIntel, useIntel } from "../lib/hooks/useIntel";
import { getApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { Entity, Freshness, IntelGate, PanelHead, SourceTag, compact } from "./Intel";
import { FollowButton } from "./SaveButton";

const amount = (n: number | null) => (n === null ? "—" : n >= 1_000_000 ? compact(n) : n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? 6 : 2 }));

export function AssetMark({ asset }: { asset: Pick<Asset, "symbol" | "iconUrl"> }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (asset.iconUrl) return <img className="asset-mark" src={asset.iconUrl} alt="" width={32} height={32} loading="lazy" />;
  return <span className="asset-mark asset-mark--text" aria-hidden="true">{asset.symbol.slice(0, 4)}</span>;
}

/** Every ERC-20 token the explorer knows on Arc, ranked by holders. */
export function AssetsList() {
  const q = useIntel("assets");
  const [term, setTerm] = useState("");
  const assets = q.data?.data ?? [];
  const shown = useMemo(() => {
    const t = term.trim().toLowerCase();
    return t ? assets.filter((a) => `${a.name} ${a.symbol} ${a.address}`.toLowerCase().includes(t)) : assets;
  }, [assets, term]);
  return (
    <section className="panel" aria-labelledby="assets-title">
      <PanelHead title="Tokens on Arc" id="assets-title">
        <Freshness fetchedAt={q.data?.fetchedAt} fetching={q.isFetching && !q.isPending} unavailable={q.data?.unavailable} />
      </PanelHead>
      <label className="visually-hidden" htmlFor="asset-filter">Filter assets</label>
      <input id="asset-filter" className="input" style={{ marginBottom: 14 }} placeholder="Filter by name, symbol or address" value={term} onChange={(e) => setTerm(e.target.value)} />
      <IntelGate query={q} rows={8}>
        {shown.length === 0 ? (
          <p className="small secondary intel-note">{assets.length ? "No asset matches that filter." : "The explorer reports no tokens on this network yet."}</p>
        ) : (
          <div className="atable" role="table" aria-label="Assets on Arc">
            <div className="atable__row atable__row--head" role="row">
              <span role="columnheader">Asset</span>
              <span role="columnheader">Holders</span>
              <span role="columnheader">Supply</span>
              <span role="columnheader"><span className="visually-hidden">Follow</span></span>
            </div>
            {shown.slice(0, 100).map((a) => (
              <div key={a.address} className="atable__row" role="row">
                <span role="cell" className="atable__name">
                  <Link href={`/assets/${a.address}`}><AssetMark asset={a} /><span>{a.symbol}<small>{a.name}</small></span></Link>
                </span>
                <span role="cell" className="mono small">{a.holders === null ? "—" : a.holders.toLocaleString("en-US")}</span>
                <span role="cell" className="mono small">{amount(a.supply)}</span>
                <span role="cell"><FollowButton kind="asset" id={a.address} name={a.symbol} variant="icon" /></span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12 }}><SourceTag source="observed" period="Current" /></div>
      </IntelGate>
    </section>
  );
}

/** Asset entity page: Overview, Activity, Markets, Related apps. */
export function AssetView({ address }: { address: string }) {
  const q = useAssetIntel(address);
  const d = q.data?.data;
  const a = d?.asset;
  return (
    <>
      <header className="protocol-head">
        {a ? <AssetMark asset={a} /> : <span className="asset-mark asset-mark--text" aria-hidden="true"><Coins /></span>}
        <div className="protocol-head__id">
          <div className="phead__kicker"><Coins aria-hidden="true" />Asset</div>
          <h1 className="phead__title" style={{ marginTop: 6 }}>{a ? `${a.name} (${a.symbol})` : "Asset"}</h1>
          <p className="phead__lead mono small" style={{ marginTop: 8, wordBreak: "break-all" }}>{address}</p>
          <div className="protocol-head__meta">
            {a && <span className="tag">{a.type}</span>}
            <a className="link small" href={explorer.address(address)} target="_blank" rel="noopener noreferrer">View on {explorer.name}<ArrowUpRight aria-hidden="true" style={{ width: 13, display: "inline", verticalAlign: -2 }} /></a>
          </div>
        </div>
        {a && <div className="protocol-head__actions"><FollowButton kind="asset" id={address} name={a.symbol} /></div>}
      </header>

      <IntelGate query={q} rows={6}>
        {d && a && (
          <div className="split split--wide-left">
            <div className="stack-col">
              <section className="panel" aria-labelledby="as-overview">
                <PanelHead title="Overview" id="as-overview"><Freshness fetchedAt={q.data?.fetchedAt} unavailable={q.data?.unavailable} /></PanelHead>
                <dl className="facts">
                  <div><dt>Holders</dt><dd className="facts__val"><span className="mono">{a.holders === null ? "—" : a.holders.toLocaleString("en-US")}</span><SourceTag source="observed" period="Current" /></dd></div>
                  <div><dt>Total supply</dt><dd className="facts__val"><span className="mono">{amount(a.supply)} {a.symbol}</span><SourceTag source="observed" period="Current" /></dd></div>
                  <div><dt>Transfers</dt><dd className="facts__val"><span className="mono">{d.transfers === null ? "—" : d.transfers.toLocaleString("en-US")}</span><SourceTag source="observed" period="All time" /></dd></div>
                  <div><dt>Decimals</dt><dd className="mono">{a.decimals ?? "—"}</dd></div>
                </dl>
              </section>
              <section className="panel" aria-labelledby="as-activity">
                <PanelHead title="Recent activity" id="as-activity"><SourceTag source="observed" period={`Latest ${d.recent.length} transfers, in ${a.symbol}`} /></PanelHead>
                {d.recent.length === 0 ? <p className="small secondary intel-note">No transfers in the latest explorer window.</p> : (
                  <ul className="pulse-list">
                    {d.recent.map((t) => (
                      <li key={t.id} className="pulse-row">
                        <div className="pulse-row__main">
                          <div className="pulse-row__title"><span className="pulse-row__type">Transfer</span>{t.method && <span className="mono xs secondary">{t.method}</span>}</div>
                          <div className="pulse-row__meta"><Entity entity={t.from} /><span aria-hidden="true">→</span><span className="visually-hidden">to</span><Entity entity={t.to} /></div>
                        </div>
                        <div className="pulse-row__side">
                          <span className="mono pulse-row__amt">{amount(t.amount)}</span>
                          <a className="pulse-row__time mono" href={explorer.tx(t.txHash)} target="_blank" rel="noopener noreferrer">
                            {t.at ? <time dateTime={t.at}>{timeAgo(t.at)}</time> : "—"}<ArrowUpRight aria-hidden="true" />
                            <span className="visually-hidden"> view transaction on the explorer</span>
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <aside className="stack-col">
              <section className="panel" aria-labelledby="as-markets">
                <PanelHead title="Markets" id="as-markets" />
                <p className="small secondary">Coming soon. Arcway shows prices only once there is an authoritative source for Arc markets.</p>
              </section>
              <section className="panel" aria-labelledby="as-related">
                <PanelHead title="Related apps" id="as-related"><SourceTag source="derived" period={`Latest ${d.sampleSize} transfers`} /></PanelHead>
                {d.relatedApps.length === 0 ? (
                  <p className="small secondary">No listed app appears in the recent transfers of this asset.</p>
                ) : (
                  <ul className="wrows">
                    {d.relatedApps.map((r) => {
                      const app = getApp(r.slug);
                      return (
                        <li key={r.slug} className="wrow">
                          {app && <AppMark app={app} size="sm" />}
                          <span className="wrow__main"><Link href={`/apps/${r.slug}`}>{r.name}</Link><span className="xs secondary">{r.transfers} transfer{r.transfers === 1 ? "" : "s"}</span></span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </aside>
          </div>
        )}
      </IntelGate>
    </>
  );
}

/** Followed assets on the watchlist, named from the asset list. */
export function WatchedAssets({ addresses }: { addresses: string[] }) {
  const q = useIntel("assets");
  const byAddr = new Map((q.data?.data ?? []).map((a) => [a.address.toLowerCase(), a]));
  return (
    <ul className="wrows">
      {addresses.map((addr) => {
        const a = byAddr.get(addr.toLowerCase());
        return (
          <li key={addr} className="wrow">
            {a ? <AssetMark asset={a} /> : <span className="asset-mark asset-mark--text" aria-hidden="true"><Coins /></span>}
            <span className="wrow__main"><Link href={`/assets/${addr}`}>{a?.symbol ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`}</Link><span className="xs secondary">{a ? `${a.name} · ${a.holders?.toLocaleString("en-US") ?? "—"} holders` : "Asset"}</span></span>
            <FollowButton kind="asset" id={addr} name={a?.symbol ?? addr} variant="icon" />
          </li>
        );
      })}
    </ul>
  );
}
