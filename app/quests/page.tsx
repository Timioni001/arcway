import type { Metadata } from "next";
import { NextStep } from "../../components/NextStep";
import { QuestGrid } from "../../components/Quests";

export const metadata: Metadata = { title: "Quests" };

export default function QuestsPage() {
  return (
    <div className="container page">
      <div className="label">Quests</div>
      <h1 className="display" style={{ marginTop: 16 }}>The Arc starter path.</h1>
      <p className="lede" style={{ marginTop: 16 }}>
        Short missions verified from your onchain activity. Complete them in order to become an Arc Explorer.
      </p>
      <div style={{ margin: "40px 0 48px", maxWidth: 560 }}>
        <NextStep />
      </div>
      <QuestGrid />
    </div>
  );
}
