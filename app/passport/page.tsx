import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { PassportLookup } from "../../components/PassportActions";
import { PassportStage } from "../../components/PassportStage";
import { LevelLadder } from "../../components/PassportSection";
import { PassportCustomizer } from "../../components/PassportStyle";
import { Achievements, BadgeGallery, QuestHistory } from "../../components/Rewards";

export const metadata: Metadata = { title: "Passport", description: "Your Arc identity: level, XP, badges, achievements and your own style." };

export default function PassportPage() {
  return (
    <div className="container page">
      <PassportStage />

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

      <section className="section ppaper" id="rewards" aria-labelledby="badges-title">
        <div className="ppaper__head">
          <h2 id="badges-title" className="h3">Rewards</h2>
          <span className="xs secondary">Every stamp is recorded on Arc when you claim its quest.</span>
        </div>
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
