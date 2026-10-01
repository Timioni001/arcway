import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { PassportLookup } from "../../components/PassportActions";
import { PassportStage } from "../../components/PassportStage";
import { LevelLadder } from "../../components/PassportSection";
import { PassportCustomizer } from "../../components/PassportStyle";
import { BadgeGallery, QuestHistory } from "../../components/Rewards";

export const metadata: Metadata = { title: "Passport", description: "Your Arc identity: level, XP, badges, achievements and your own style." };

const SECTIONS = [
  { id: "style", label: "Style" },
  { id: "rewards", label: "Badges" },
  { id: "progress", label: "Progress" },
  { id: "activity", label: "Activity" }
];

/** One header shape for every section below the card: number, title, one line on what it is. */
function SectionHead({ n, id, title, lead }: { n: number; id: string; title: string; lead: string }) {
  return (
    <header className="psec__head">
      <span className="psec__n mono" aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <h2 id={id} className="h3">{title}</h2>
      <p className="small secondary">{lead}</p>
    </header>
  );
}

export default function PassportPage() {
  return (
    <div className="container page">
      <PassportStage />

      <nav className="psub" aria-label="On this page">
        {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
      </nav>

      <section className="psec" id="style" aria-labelledby="style-title">
        <SectionHead n={1} id="style-title" title="Make it yours" lead="Card designs, frames and titles. Each locked piece shows what unlocks it." />
        <div className="card pad-lg"><PassportCustomizer /></div>
      </section>

      <section className="psec" id="rewards" aria-labelledby="badges-title">
        <SectionHead n={2} id="badges-title" title="Badges" lead="One stamp per quest, recorded on Arc when you claim it." />
        <div className="ppaper"><BadgeGallery /></div>
      </section>

      <section className="psec" id="progress" aria-labelledby="progress-title">
        <SectionHead n={3} id="progress-title" title="Progress" lead="Your level, the quests behind it, and what to do next." />
        <div className="dash">
          <div className="card pad-lg">
            <h3 className="pstyle__label">Levels</h3>
            <LevelLadder />
            <h3 className="pstyle__label" style={{ marginTop: 24 }}>Quest history</h3>
            <QuestHistory />
          </div>
          <NextStep />
        </div>
      </section>

      <section className="psec" id="activity" aria-labelledby="activity-title">
        <SectionHead n={4} id="activity-title" title="Activity summary" lead="What this wallet has done on Arc, read from the explorer." />
        <Activity />
        <div className="psec__lookup"><PassportLookup /></div>
      </section>
    </div>
  );
}
