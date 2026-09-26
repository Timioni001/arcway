import { Radar } from "lucide-react";
import type { Metadata } from "next";
import { RadarView } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Radar", description: "What's new on Arc and what changed: new contracts, verifications, activity shifts and listings." };

export default function RadarPage() {
  return (
    <div className="container page">
      <PageHead icon={Radar} kicker="Radar" title="Arc Radar" lead="What's new on Arc and what changed, with the period behind every number." />
      <div className="stack-col"><RadarView /></div>
    </div>
  );
}
