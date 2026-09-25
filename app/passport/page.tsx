import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { PassportSummary, PassportVisual } from "../../components/Passport";
import { QuestGrid } from "../../components/Quests";

export const metadata: Metadata = { title: "Passport" };

export default function PassportPage() {
  return (
    <div className="container page">
      <div className="label">Passport</div>
      <h1 className="display" style={{ marginTop: 16, marginBottom: 48 }}>Your record on Arc.</h1>
      <div className="passport-grid">
        <PassportVisual />
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <PassportSummary />
          <NextStep />
        </div>
      </div>

      <section className="section--tight" aria-labelledby="quests-title">
        <h2 id="quests-title" className="h2" style={{ marginBottom: 24 }}>Quests</h2>
        <QuestGrid />
      </section>

      <section className="section--tight" aria-labelledby="activity-title">
        <h2 id="activity-title" className="h2" style={{ marginBottom: 24 }}>Recent activity</h2>
        <Activity />
      </section>
    </div>
  );
}
