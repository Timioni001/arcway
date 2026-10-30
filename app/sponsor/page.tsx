import { HandCoins } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { MyBounties, SponsoredQuests, SponsorForm } from "../../components/Bounties";

export const metadata: Metadata = { title: "Sponsor a quest", description: "Put USDC behind an Arcway quest. Everyone whose passport has it recorded can claim a share, straight from the contract." };

export default function SponsorPage() {
  return (
    <div className="container page">
      <PageHead icon={HandCoins} kicker="Quests" title="Sponsor a quest" lead="Put USDC behind a quest. Everyone whose passport has it recorded can claim a share, first come first served, straight from the contract." />
      <div className="dash" style={{ marginTop: 28 }}>
        <div>
          <SponsorForm />
          <MyBounties />
        </div>
        <div className="card pad-lg">
          <h2 className="h4">How it works</h2>
          <ol className="sponsor__how">
            <li><b>You escrow USDC</b> in ArcwayBounties: a reward per person and how many people.</li>
            <li><b>People finish the quest.</b> Arcway records it on their passport on Arc.</li>
            <li><b>They claim.</b> The contract checks the passport and pays them; no one in between.</li>
            <li><b>When it ends</b>, whatever wasn&apos;t claimed comes back to you.</li>
          </ol>
        </div>
      </div>
      <h2 className="h3" style={{ margin: "48px 0 16px" }} id="live">Live bounties</h2>
      <SponsoredQuests />
    </div>
  );
}
