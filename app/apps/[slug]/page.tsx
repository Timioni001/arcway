import { ArrowLeft, Check, Minus, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppLogo, AppPills } from "../../../components/AppCard";
import { OpenAppButton } from "../../../components/OpenAppButton";
import { ExternalLink } from "../../../components/Status";
import { NETWORK_NAME, explorer } from "../../../lib/config";
import { shortAddress, timeAgo } from "../../../lib/format";
import { APPS, appLink, getApp } from "../../../lib/registry";

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
      {ok ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
      {children}
    </span>
  );
}

export default async function AppDetail({ params }: Props) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  const href = appLink(app);
  const hasContracts = app.contractAddresses.length > 0;

  return (
    <div className="container page">
      <Link href="/apps" className="back"><ArrowLeft aria-hidden="true" /> All apps</Link>

      <header className="row" style={{ gap: 24, marginTop: 24, alignItems: "flex-start" }}>
        <AppLogo app={app} size="lg" />
        <div className="stack-3" style={{ flex: 1, minWidth: 260 }}>
          <div className="label">{app.category}</div>
          <h1 className="display">{app.name}</h1>
          <p className="lede">{app.tagline}</p>
          <AppPills app={app} />
        </div>
      </header>

      <div className="detail" style={{ marginTop: 48 }}>
        <div style={{ display: "grid", gap: 40 }}>
          <div className="row">
            {href ? (
              <OpenAppButton appId={app.id} href={href} name={app.name} />
            ) : (
              <span className="btn btn--primary" aria-disabled="true">Link not available</span>
            )}
            {app.verified && (
              <Link href="/quests/explore-app" className="btn btn--secondary"><Target aria-hidden="true" /> Counts toward a quest</Link>
            )}
          </div>
          {app.sample && (
            <p className="body-sm" style={{ color: "var(--aw-signal)" }}>
              This is a sample listing that shows the layout. It isn&apos;t a real app.
            </p>
          )}

          <section className="stack-3" aria-labelledby="about">
            <h2 id="about" className="label">About</h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 640 }}>{app.description}</p>
          </section>

          <section className="stack-3" aria-labelledby="first">
            <h2 id="first" className="label">Start here</h2>
            <div className="surface pad">
              <div className="title">{app.firstAction}</div>
              <p className="body-sm muted" style={{ marginTop: 8 }}>
                {app.verified
                  ? "When you're done, come back to Arcway; your quest progress updates automatically."
                  : "Interactions with unverified listings don't count toward quests yet."}
              </p>
            </div>
          </section>

          <section className="stack-3" aria-labelledby="usage">
            <h2 id="usage" className="label">How it uses Arc</h2>
            <div className="feature-list">
              {app.features.map((f) => <span key={f} className="pill">{f}</span>)}
            </div>
          </section>
        </div>

        <aside className="detail__aside stack-4" style={{ display: "grid", gap: 20 }}>
          {/* Verification is factual, not promotional (§43). */}
          <section className="surface surface--lg pad" aria-labelledby="verification">
            <h2 id="verification" className="label" style={{ color: app.verified ? "var(--aw-sky)" : undefined }}>
              {app.verified ? "Arcway verified" : "Not yet verified"}
            </h2>
            <div className="facts body-sm" style={{ marginTop: 16 }}>
              <div>
                <span className="muted">Contract</span>
                <span className="stack-2" style={{ textAlign: "right" }}>
                  {hasContracts
                    ? app.contractAddresses.map((a) => (
                        <a key={a} className="mono link" href={explorer.address(a)} target="_blank" rel="noopener noreferrer">{shortAddress(a)}</a>
                      ))
                    : <span className="mono muted">Not listed</span>}
                </span>
              </div>
              <div><span className="muted">Deployment</span><Fact ok={app.verified && hasContracts}>{NETWORK_NAME}</Fact></div>
              <div><span className="muted">Source</span><Fact ok={Boolean(app.verification?.sourceUrl)}>{app.verification?.sourceUrl ? "Public repository" : "Not provided"}</Fact></div>
              <div>
                <span className="muted">Last checked</span>
                <span className="mono">{app.verification ? timeAgo(app.verification.checkedAt) : "—"}</span>
              </div>
            </div>
            {!app.verified && (
              <p className="body-sm muted" style={{ marginTop: 16 }}>
                Verified means Arcway confirmed the contracts with the team and matched them to a public source.
              </p>
            )}
          </section>

          {app.builder && (
            <section className="surface surface--lg pad" aria-labelledby="builder">
              <h2 id="builder" className="label">Builder</h2>
              <div className="title" style={{ marginTop: 12 }}>{app.builder.name}</div>
              <div className="row" style={{ marginTop: 8 }}>
                {app.builder.github && <ExternalLink href={app.builder.github}>GitHub</ExternalLink>}
                {app.builder.x && <ExternalLink href={app.builder.x}>X</ExternalLink>}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
