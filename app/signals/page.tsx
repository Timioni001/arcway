import { RadioTower } from "lucide-react";
import type { Metadata } from "next";
import { SignalsView } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Signals", description: "Verified onchain observations and ecosystem changes on Arc. Never investment advice." };

export default function SignalsPage() {
  return (
    <div className="container page">
      <PageHead icon={RadioTower} kicker="Signals" title="Signals" lead="Factual observations from Arc data, each with its source and evidence. Never investment advice." />
      <SignalsView />
    </div>
  );
}
