import { ArrowLeft, Code2, FileCode2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppCard } from "../../../components/AppCard";
import { AppMark, CategoryTile } from "../../../components/CategoryIcon";
import { PanelHead, SourceTag } from "../../../components/IntelBits";
import { FollowButton } from "../../../components/SaveButton";
import { ExternalLink } from "../../../components/Status";
import { explorer } from "../../../lib/config";
import { builderMark, buildersFrom, getBuilder } from "../../../lib/builders";
import { appContracts, isVerified } from "../../../lib/registry";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return buildersFrom().map((b) => ({ slug: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const builder = getBuilder((await params).slug);
  return builder ? { title: builder.name, description: `Apps by ${builder.name} on Arc.` } : { title: "Builder not found" };
}

export default async function BuilderPage({ params }: Props) {
  const builder = getBuilder((await params).slug);
  if (!builder) notFound();
  const verified = builder.apps.filter((a) => isVerified(a)).length;
  const contracts = builder.apps.flatMap((a) => appContracts(a).map((address) => ({ address, app: a })));

  return (
    <div className="container page">
      <Link href="/builders" className="link small"><ArrowLeft aria-hidden="true" />All builders</Link>
      <header className="builder-hero">
        <AppMark app={builderMark(builder)} size="lg" />
        <div style={{ minWidth: 0 }}>
          <div className="phead__kicker"><Code2 aria-hidden="true" />Builder</div>
          <h1 className="h1" style={{ marginTop: 6 }}>{builder.name}</h1>
          <div className="row" style={{ gap: 16, marginTop: 12 }}>
            {builder.github && <ExternalLink href={builder.github}>GitHub</ExternalLink>}
            {builder.x && <ExternalLink href={builder.x}>X</ExternalLink>}
            <FollowButton kind="builder" id={builder.id} name={builder.name} />
          </div>
        </div>
      </header>
      <ul className="stats stats--3" aria-label="Builder summary">
        <li className="card pad"><span className="xs secondary">Apps listed</span><strong className="h3 mono">{builder.apps.length}</strong></li>
        <li className="card pad"><span className="xs secondary">Published contracts</span><strong className="h3 mono">{contracts.length}</strong><SourceTag source="project" period={`${verified} app${verified === 1 ? "" : "s"} verified by Arcway`} /></li>
        <li className="card pad">
          <span className="xs secondary">Categories</span>
          <span className="row" style={{ gap: 8, marginTop: 6 }}>{builder.categories.map((c) => <span key={c} className="row" style={{ gap: 6 }}><CategoryTile category={c} size="xs" /><span className="small">{c}</span></span>)}</span>
        </li>
      </ul>
      <section className="band" aria-labelledby="apps-title">
        <PanelHead icon={Code2} title="Projects" id="apps-title" />
        <ul className="cards">{builder.apps.map((a) => <li key={a.id}><AppCard app={a} /></li>)}</ul>
      </section>
      <section className="band" aria-labelledby="contracts-title">
        <PanelHead icon={FileCode2} title="Deployments" id="contracts-title"><SourceTag source="project" period="Published by the team" /></PanelHead>
        {contracts.length ? (
          <ul className="crows panel">
            {contracts.map((c) => (
              <li key={c.address} className="crow">
                <span className="crow__main">
                  <a className="crow__name mono" href={explorer.address(c.address)} target="_blank" rel="noopener noreferrer">{c.address}<span className="visually-hidden"> (opens explorer)</span></a>
                  <span className="xs secondary">{c.app.name}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="small secondary">No contract addresses published for this network yet. Activity can&apos;t be measured until they are.</p>}
      </section>
    </div>
  );
}
