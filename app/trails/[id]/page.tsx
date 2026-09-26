import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrailCards, TrailDetail } from "../../../components/Trails";
import { TRAILS, getTrail } from "../../../lib/trails";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return TRAILS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = getTrail((await params).id);
  return t ? { title: t.title, description: t.goal } : {};
}

export default async function TrailPage({ params }: Props) {
  const trail = getTrail((await params).id);
  if (!trail) notFound();
  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/apps">Discover</Link><ChevronRight aria-hidden="true" /><span aria-current="page">{trail.title}</span>
      </nav>
      <div style={{ marginTop: 28 }}><TrailDetail trail={trail} /></div>
      <section className="section" style={{ paddingTop: 72 }} aria-labelledby="more-trails">
        <h2 id="more-trails" className="h3" style={{ marginBottom: 20 }}>More trails</h2>
        <TrailCards trails={TRAILS.filter((t) => t.id !== trail.id)} />
      </section>
    </div>
  );
}
