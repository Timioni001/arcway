import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { PassCard } from "../../components/PassCard";
import { PassportStats, ProfileCard } from "../../components/PassportParts";
import { MyPassportActions, PassportLookup } from "../../components/PassportActions";
import { LevelLadder } from "../../components/PassportSection";
import { PassportCustomizer } from "../../components/PassportStyle";
import { Achievements, BadgeGallery, QuestHistory } from "../../components/Rewards";

export const metadata: Metadata = { title: "Passport", description: "Your Arc identity: level, XP, badges, achievements and your own style." };

export default function PassportPage() {
  return (
    <div className="container page">
      <div className="row between" style={{ alignItems: "flex-end", gap: 16, marginBottom: 32 }}>
        <div>
          <div className="label" style={{ color: "var(--link)" }}>Passport</div>
          <h1 className="h1" style={{ marginTop: 10 }}>Your Arc identity</h1>
        </div>
        <MyPassportActions />
      </div>

      <div className="showcase" style={{ alignItems: "start" }}>
        <div className="showcase__card"><PassCard /></div>
        <div className="showcase__copy showcase__copy--wide">
          <ProfileCard />
          <PassportStats />
        </div>
      </div>

      <section className="section" style={{ paddingTop: 56 }} aria-labelledby="style-title">
        <h2 id="style-title" className="h3" style={{ marginBottom: 20 }}>Make it yours</h2>
        <div className="dash">
          <div className="card pad-lg"><PassportCustomizer /></div>
          <section className="card pad-lg" aria-labelledby="achv-title">
            <h3 id="achv-title" className="h4" style={{ marginBottom: 14 }}>Achievements</h3>
            <Achievements />
          </section>
        </div>
      </section>

      <section className="section" id="rewards" style={{ paddingTop: 56 }} aria-labelledby="badges-title">
        <h2 id="badges-title" className="h3" style={{ marginBottom: 20 }}>Rewards</h2>
        <BadgeGallery />
      </section>

      <div className="dash" style={{ marginTop: 56 }}>
        <section className="card pad-lg" aria-labelledby="history-title">
          <h2 id="history-title" className="h4" style={{ marginBottom: 14 }}>Quest history</h2>
          <QuestHistory />
          <h3 className="pstyle__label" style={{ marginTop: 24 }}>Levels</h3>
          <LevelLadder />
        </section>
        <NextStep />
      </div>

      <section className="section" style={{ paddingTop: 56 }} aria-labelledby="activity-title">
        <h2 id="activity-title" className="h3" style={{ marginBottom: 20 }}>Activity summary</h2>
        <Activity />
      </section>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="card pad-lg"><PassportLookup /></div>
      </section>
    </div>
  );
}
