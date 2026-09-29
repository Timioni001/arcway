import { ArrowRight, Blocks, Check, Code2, Globe, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBadges, AppLogo } from "../../../components/AppCard";
import { AppMark } from "../../../components/CategoryIcon";
import { PanelHead, SourceTag } from "../../../components/IntelBits";
import { OpenAppButton } from "../../../components/OpenAppButton";
import { ProtocolIntelView } from "../../../components/ProtocolIntel";
import { FollowButton } from "../../../components/SaveButton";
import { ExternalLink } from "../../../components/Status";
import { builderId } from "../../../lib/builders";
import { NETWORK_NAME } from "../../../lib/config";
import { APPS, appContracts, appLink, getApp, isVerified } from "../../../lib/registry";
import { RelativeDate } from "../../../components/RelativeDate";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return APPS.filter((a) => a.active).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug);
  return app ? { title: app.name, description: `${app.tagline} Category, status, contracts and observed activity on Arc.` } : {};
}

function Fact({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`check ${ok ? "check--ok" : "check--no"}`}>
      {ok ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}{children}
    </span>
  );
}

const listedOn = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Protocol intelligence: identity, observed activity, contracts, relationships and evidence. */
export default async function ProtocolPage({ params }: Props) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  const href = appLink(app);
  const contracts = appContracts(app);
  const verified = isVerified(app);
  const related = APPS.filter((a) => a.active && !a.sample && a.id !== app.id && (a.category === app.category || (app.builder && a.builder?.name === app.builder.name))).slice(0, 5);

  return (
    <div className="container page">
      <header className="protocol-head">
        <AppLogo app={app} size="lg" />
        <div className="protocol-head__id">
          <div className="phead__kicker"><Blocks aria-hidden="true" />Protocol</div>
          <h1 className="phead__title" style={{ marginTop: 6 }}>{app.name}</h1>
          <p className="phead__lead" style={{ marginTop: 8 }}>{app.tagline}</p>
          <div className="protocol-head__meta">
            <span className="tag">{app.category}</span>
            <AppBadges app={app} />
            {href && <ExternalLink href={href}><Globe aria-hidden="true" style={{ width: 14, verticalAlign: -2, marginRight: 4 }} />Website</ExternalLink>}
            {app.builder?.github && <ExternalLink href={app.builder.github}>GitHub</ExternalLink>}
            {app.builder?.x && <ExternalLink href={app.builder.x}>X</ExternalLink>}
          </div>
        </div>
        <div className="protocol-head__actions">
          <FollowButton kind="app" id={app.id} name={app.name} />
          {href ? <OpenAppButton appId={app.id} href={href} name={app.name} /> : (
            <span className="btn btn--primary" aria-disabled="true">{app.sample ? "Sample listing" : "Link coming soon"}</span>
          )}
        </div>
      </header>

      <div className="detail">
        <div className="stack-col">
          <section className="panel" aria-labelledby="overview">
            <PanelHead icon={Blocks} title="Overview" id="overview"><SourceTag source="project" period="Listing" /></PanelHead>
            <p className="secondary" style={{ lineHeight: 1.65 }}>{app.description}</p>
            <h3 className="label" style={{ marginTop: 18 }}>First thing to try</h3>
            <p style={{ marginTop: 6 }}>{app.firstAction}</p>
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              {app.features.map((f) => <span key={f} className="tag">{f}</span>)}
            </div>
          </section>

          <ProtocolIntelView slug={app.slug} measurable={contracts.length > 0 && !app.sample} />

          {related.length > 0 && (
            <section className="panel" aria-labelledby="related">
              <PanelHead icon={Blocks} title="Related protocols" id="related"><SourceTag source="project" period="Same category or builder" /></PanelHead>
              <ul className="brows">
                {related.map((a) => (
                  <li key={a.id}>
                    <Link href={`/apps/${a.slug}`} className="brow">
                      <AppMark app={a} size="sm" />
                      <span className="brow__main"><span className="brow__name">{a.name}</span><span className="xs secondary">{a.tagline}</span></span>
                      <span className="brow__stat xs">{a.builder?.name === app.builder?.name ? "Same builder" : a.category}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="detail__aside stack-col">
          <section className="panel" aria-labelledby="details">
            <h2 id="details" className="panel__title" style={{ marginBottom: 14 }}>Details</h2>
            <dl className="facts">
              <div><dt>Category</dt><dd>{app.category}</dd></div>
              <div><dt>Network</dt><dd>{NETWORK_NAME}</dd></div>
              <div><dt>Listed on Arcway</dt><dd className="mono small">{listedOn(app.addedAt)}</dd></div>
              <div><dt>Published contracts</dt><dd className="mono">{contracts.length || "None yet"}</dd></div>
              <div><dt>Verified by Arcway</dt><dd><Fact ok={verified}>{verified ? "Yes" : "Not yet"}</Fact></dd></div>
              <div><dt>Counts for quests</dt><dd><Fact ok={verified}>{verified ? "Yes" : "Not yet"}</Fact></dd></div>
              {verified && app.verification && <div><dt>Checked against</dt><dd><ExternalLink href={app.verification.sourceUrl}>Team&apos;s source</ExternalLink></dd></div>}
              {verified && app.verification && <div><dt>Last checked</dt><dd><RelativeDate iso={app.verification.checkedAt} /></dd></div>}
            </dl>
          </section>
          {app.builder && (
            <section className="panel" aria-labelledby="builder">
              <PanelHead icon={Code2} title="Builder" id="builder" />
              <Link href={`/builders/${builderId(app.builder.name)}`} className="brow" style={{ borderTop: 0 }}>
                <AppMark app={app} size="sm" />
                <span className="brow__main"><span className="brow__name">{app.builder.name}</span><span className="xs secondary">View projects and contracts</span></span>
                <ArrowRight aria-hidden="true" style={{ width: 16, color: "var(--text-muted)" }} />
              </Link>
            </section>
          )}
          <section className="panel" aria-labelledby="trust">
            <h2 id="trust" className="panel__title">About this data</h2>
            <p className="xs secondary" style={{ marginTop: 8 }}>
              Listing details come from the team. Activity is read from Arc&apos;s explorer for the contracts they publish.
              Nothing here is a rating or advice. <Link href="/settings#data" className="link">How we measure</Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
