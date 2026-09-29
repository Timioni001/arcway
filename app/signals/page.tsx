import { RadioTower } from "lucide-react";
import type { Metadata } from "next";
import { SignalsView } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Insights", description: "Verified onchain observations and ecosystem changes on Arc. Never investment advice." };

export default function SignalsPage() {
  return (
    <div className="container page">
      <PageHead icon={RadioTower} kicker="Insights" title="Insights" lead="Notable patterns on Arc, shown only with evidence: the period, the source and a link to check it. Never investment advice." />
      <SignalsView />
    </div>
  );
}
