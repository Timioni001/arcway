import { Activity } from "lucide-react";
import type { Metadata } from "next";
import { PulseExplorer } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Pulse", description: "Live activity across Arc: app interactions, deployments and USDC movement." };

export default function PulsePage() {
  return (
    <div className="container page">
      <PageHead icon={Activity} kicker="Pulse" title="Arc Pulse" lead="Live activity across Arc: app interactions, new contracts and USDC movement, each linked to its transaction." />
      <PulseExplorer />
    </div>
  );
}
