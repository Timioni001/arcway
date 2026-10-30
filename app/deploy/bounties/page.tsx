import { Rocket } from "lucide-react";
import type { Metadata } from "next";
import { DeployBounties } from "../../../components/DeployBounties";
import { PageHead } from "../../../components/PageHead";

export const metadata: Metadata = { title: "Deploy ArcwayBounties", robots: { index: false, follow: false } };

export default function DeployBountiesPage() {
  return (
    <div className="container page">
      <PageHead icon={Rocket} kicker="Maintainers" title="Deploy ArcwayBounties" lead="A one-time setup for the Sponsor page. Your wallet signs the deployment; no key ever touches Arcway." />
      <div style={{ marginTop: 28, maxWidth: 720 }}>
        <DeployBounties />
      </div>
    </div>
  );
}
