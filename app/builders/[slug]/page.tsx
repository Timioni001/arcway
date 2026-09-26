import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppCard } from "../../../components/AppCard";
import { AppMark, CategoryTile } from "../../../components/CategoryIcon";
import { ExternalLink } from "../../../components/Status";
import { builderMark, buildersFrom, getBuilder } from "../../../lib/builders";
import { isVerified } from "../../../lib/registry";

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

  return (
    <div className="container page">
      <Link href="/builders" className="link small"><ArrowLeft aria-hidden="true" />All builders</Link>
      <header className="builder-hero">
        <AppMark app={builderMark(builder)} size="lg" />
        <div style={{ minWidth: 0 }}>
          <div className="label" style={{ color: "var(--link)" }}>Builder</div>
          <h1 className="h1" style={{ marginTop: 6 }}>{builder.name}</h1>
          <div className="row" style={{ gap: 16, marginTop: 12 }}>
            {builder.github && <ExternalLink href={builder.github}>GitHub</ExternalLink>}
            {builder.x && <ExternalLink href={builder.x}>X</ExternalLink>}
          </div>
        </div>
      </header>
      <ul className="stats stats--3" aria-label="Builder summary">
        <li className="card pad"><span className="xs secondary">Apps listed</span><strong className="h3 mono">{builder.apps.length}</strong></li>
        <li className="card pad"><span className="xs secondary">Verified contracts</span><strong className="h3 mono">{verified}</strong></li>
        <li className="card pad">
          <span className="xs secondary">Categories</span>
          <span className="row" style={{ gap: 8, marginTop: 6 }}>{builder.categories.map((c) => <span key={c} className="row" style={{ gap: 6 }}><CategoryTile category={c} size="xs" /><span className="small">{c}</span></span>)}</span>
        </li>
      </ul>
      <section className="section" aria-labelledby="apps-title" style={{ paddingTop: 32 }}>
        <h2 id="apps-title" className="h3" style={{ marginBottom: 20 }}>Apps</h2>
        <ul className="cards">{builder.apps.map((a) => <li key={a.id}><AppCard app={a} /></li>)}</ul>
      </section>
    </div>
  );
}
