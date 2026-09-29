import { Newspaper } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { SnapshotGrid } from "../../components/HomeIntel";
import { RadarView } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "What's New", description: "What changed on Arc: new contracts, verifications, activity shifts and listings." };

export default function RadarPage() {
  return (
    <div className="container page">
      <PageHead icon={Newspaper} kicker="What's New" title="What changed on Arc" lead="New apps, new contracts and shifts in activity, each with its period and source." />
      <p className="small" style={{ marginTop: -8, marginBottom: 20 }}><Link className="link" href="/digest">Read today's summary</Link></p>
      <section className="band" aria-labelledby="snapshot-title"><SnapshotGrid /></section>
      <div className="stack-col" style={{ paddingTop: 20 }}><RadarView /></div>
    </div>
  );
}
