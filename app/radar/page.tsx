import { Radar } from "lucide-react";
import type { Metadata } from "next";
import { SnapshotGrid } from "../../components/HomeIntel";
import { RadarView } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Radar", description: "What's new on Arc and what changed: new contracts, verifications, activity shifts and listings." };

export default function RadarPage() {
  return (
    <div className="container page">
      <PageHead icon={Radar} kicker="Radar" title="Arc Radar" lead="What's new on Arc and what changed, with the period behind every number." />
      <section className="band" aria-labelledby="snapshot-title"><SnapshotGrid /></section>
      <div className="stack-col" style={{ paddingTop: 20 }}><RadarView /></div>
    </div>
  );
}
