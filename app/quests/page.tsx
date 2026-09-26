import type { Metadata } from "next";
import { QuestPath } from "../../components/QuestPath";

export const metadata: Metadata = { title: "Quests" };

export default function QuestsPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Quests</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Earn XP on Arc</h1>
      <p className="lead" style={{ margin: "12px 0 40px" }}>Short missions. We check them automatically.</p>
      <QuestPath />
    </div>
  );
}
