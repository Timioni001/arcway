import { Activity } from "lucide-react";
import type { Metadata } from "next";
import { PulseExplorer } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Activity", description: "Live activity across Arc: app interactions, deployments and USDC movement." };

export default function PulsePage() {
  return (
    <div className="container page">
      <PageHead icon={Activity} kicker="Activity" title="What is happening on Arc" lead="People using apps, new contracts and USDC moving, as it happens. Each item links to its transaction." />
      <PulseExplorer />
    </div>
  );
}
