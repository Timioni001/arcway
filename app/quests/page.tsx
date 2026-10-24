import { Target } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { Campaign } from "../../components/Campaign";
import { SponsoredQuestsSection } from "../../components/BountiesSection";
import { HowItWorks } from "../../components/HomeSections";
import { QuestPath } from "../../components/QuestPath";
import { QuestTiers } from "../../components/Quests";
import { RewardKinds } from "../../components/Rewards";

export const metadata: Metadata = { title: "Quests", description: "Short quests on real Arc apps. Earn XP, badges and season rewards, and build your passport." };

export default function QuestsPage() {
  return (
    <div className="container page">
      <PageHead icon={Target} kicker="Quests" title="Try Arc, earn rewards" lead="Short quests on real Arc apps. Each one adds XP and a badge to your passport." />
      <div style={{ height: 28 }} />
      <Campaign />
      <section id="sponsored" style={{ marginTop: 40 }}><SponsoredQuestsSection /></section>
      <h2 className="h3" style={{ margin: "56px 0 16px" }}>Your path</h2>
      <QuestTiers />
      <h2 className="h3" style={{ margin: "56px 0 24px" }}>All quests</h2>
      <QuestPath />
      <h2 className="h3" style={{ margin: "56px 0 24px" }}>Rewards</h2>
      <RewardKinds />
      <h2 className="h3" style={{ margin: "56px 0 24px" }}>How it works</h2>
      <HowItWorks />
    </div>
  );
}
