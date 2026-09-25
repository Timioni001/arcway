import type { Metadata } from "next";
import { QuestGrid } from "../../components/Quests";

export const metadata: Metadata = { title: "Quests" };

export default function QuestsPage() {
  return (
    <div className="container page">
      <h1 className="h1">Quests</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Verified from your onchain activity.</p>
      <QuestGrid />
    </div>
  );
}
