import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { CampaignLaunch } from "../../components/CampaignLaunch";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Launch a campaign", description: "Reward people for trying your app on Arc: lock a USDC prize pool in escrow, pick tasks Arcway can check on chain, and choose first come, a prize draw or a shared pool." };

export default function LaunchPage() {
  return (
    <div className="container page">
      <PageHead icon={Megaphone} kicker="For builders" title="Launch a campaign" lead="Reward people for trying your app. Lock a USDC prize pool on Arc, choose tasks we can check on chain, and pick how rewards are shared." />
      <CampaignLaunch />
    </div>
  );
}
