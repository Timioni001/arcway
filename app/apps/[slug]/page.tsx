import { Check, ChevronRight, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBadges, AppLogo } from "../../../components/AppCard";
import { OpenAppButton } from "../../../components/OpenAppButton";
import { SaveButton } from "../../../components/SaveButton";
import { ExternalLink } from "../../../components/Status";
import { NETWORK_NAME, explorer } from "../../../lib/config";
import { shortAddress, timeAgo } from "../../../lib/format";
import { APPS, appContracts, appLink, getApp, isVerified } from "../../../lib/registry";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return APPS.filter((a) => a.active).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug);
  return app ? { title: app.name, description: app.tagline } : {};
}

function Fact({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`check ${ok ? "check--ok" : "check--no"}`}>
      {ok ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}{children}
    </span>
  );
}

export default async function AppDetail({ params }: Props) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  const href = appLink(app);
  const contracts = appContracts(app);
  const verified = isVerified(app);

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/apps">Discover</Link><ChevronRight aria-hidden="true" /><span aria-current="page">{app.name}</span>
      </nav>

      <header className="row" style={{ gap: 20, marginTop: 28, alignItems: "center" }}>
        <AppLogo app={app} size="lg" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="h1">{app.name}</h1>
          <p className="lead" style={{ marginTop: 6 }}>{app.tagline}</p>
        </div>
      </header>
      <div className="row" style={{ marginTop: 20 }}>
        <AppBadges app={app} />
        <span className="tag">{app.category}</span>
      </div>
      <div className="row" style={{ marginTop: 28 }}>
        {href ? <OpenAppButton appId={app.id} href={href} name={app.name} /> : (
          <span className="btn btn--primary" aria-disabled="true">{app.sample ? "Sample listing" : "Link coming soon"}</span>
        )}
        <SaveButton appId={app.id} name={app.name} variant="full" />
      </div>

      <div className="detail">
        <div style={{ display: "grid", gap: 20 }}>
          <section className="card pad-lg" aria-labelledby="overview">
            <h2 id="overview" className="h4">Overview</h2>
            <p className="secondary" style={{ marginTop: 10, lineHeight: 1.6 }}>{app.description}</p>
          </section>
          <section className="card pad-lg" aria-labelledby="how">
            <h2 id="how" className="h4">How it works</h2>
            <p style={{ marginTop: 10 }}>{app.firstAction}</p>
            <div className="row" style={{ marginTop: 16, gap: 8 }}>
              {app.features.map((f) => <span key={f} className="tag">{f}</span>)}
            </div>
          </section>
          {app.builder && (
            <section className="card pad-lg" aria-labelledby="builder">
              <h2 id="builder" className="h4">Builder</h2>
              <div className="row between" style={{ marginTop: 14 }}>
                <span className="row" style={{ gap: 12 }}>
                  <span className="avatar" aria-hidden="true">{app.builder.name.charAt(0)}</span>
                  <span style={{ fontWeight: 600 }}>{app.builder.name}</span>
                </span>
                {app.builder.github && <ExternalLink href={app.builder.github}>GitHub</ExternalLink>}
              </div>
            </section>
          )}
        </div>

        <aside className="detail__aside">
          <section className="card pad" aria-labelledby="details">
            <h2 id="details" className="h4" style={{ marginBottom: 16 }}>Details</h2>
            <dl className="facts">
              <div><dt>Category</dt><dd>{app.category}</dd></div>
              <div><dt>Network</dt><dd>{NETWORK_NAME}</dd></div>
              <div><dt>Verified by Arcway</dt><dd><Fact ok={verified}>{verified ? "Yes" : "Not yet"}</Fact></dd></div>
              <div><dt>Counts for quests</dt><dd><Fact ok={verified}>{verified ? "Yes" : "Not yet"}</Fact></dd></div>
              {contracts.length > 0 && (
                <div>
                  <dt>Contract</dt>
                  <dd>{contracts.map((a) => <a key={a} className="mono link" href={explorer.address(a)} target="_blank" rel="noopener noreferrer">{shortAddress(a)}</a>)}</dd>
                </div>
              )}
              {verified && app.verification && <div><dt>Checked against</dt><dd><ExternalLink href={app.verification.sourceUrl}>Team&apos;s source</ExternalLink></dd></div>}
              {verified && app.verification && <div><dt>Last checked</dt><dd>{timeAgo(app.verification.checkedAt)}</dd></div>}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
