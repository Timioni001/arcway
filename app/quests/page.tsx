import { Target } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { Campaign } from "../../components/Campaign";
import { HowItWorks } from "../../components/HomeSections";
import { QuestPath } from "../../components/QuestPath";

export const metadata: Metadata = { title: "Quests" };

export default function QuestsPage() {
  return (
    <div className="container page">
      <PageHead icon={Target} kicker="Quests" title="Explore Arc, earn XP" lead="Short missions checked against your real onchain activity. No scores, just what you did." />
      <div style={{ height: 28 }} />
      <Campaign />
      <h2 className="h3" style={{ margin: "56px 0 24px" }}>All quests</h2>
      <QuestPath />
      <h2 className="h3" style={{ margin: "56px 0 24px" }}>How it works</h2>
      <HowItWorks />
    </div>
  );
}
