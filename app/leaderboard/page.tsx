import { Trophy } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { LeaderboardView, PassportProof } from "../../components/PassportProof";

export const metadata: Metadata = { title: "Leaderboard", description: "Explorers ranked by XP from verified quests on Arc. Monthly seasons, never ranked by balance." };

export default function LeaderboardPage() {
  return (
    <div className="container page">
      <PageHead icon={Trophy} kicker="Leaderboard" title="Top explorers on Arc" lead="Ranked by XP from verified quests this month and all time. Read straight from the Passport contract." />
      <div className="stack-col" style={{ paddingTop: 28 }}>
        <LeaderboardView />
        <PassportProof />
      </div>
    </div>
  );
}
