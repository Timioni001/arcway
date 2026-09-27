import { Send } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { SubmitForm } from "../../components/SubmitForm";
import { NETWORK_NAME } from "../../lib/config";

export const metadata: Metadata = { title: "Submit a project", description: "Built something on Arc mainnet? Get it listed on Arcway so people can find it, follow it and see its activity." };

const STEPS = [
  { title: "Deploy", body: `Your app runs on ${NETWORK_NAME}.` },
  { title: "Submit", body: "About two minutes. Contracts are checked live." },
  { title: "Community listing", body: "Visible with a Community label while we review." },
  { title: "Verified", body: "Contracts checked against your source; counts for quests." }
];

export default function SubmitPage() {
  return (
    <div className="container page">
      <PageHead icon={Send} kicker="Build on Arc" title="Submit your project" lead="Built something on Arc mainnet? List it so people can discover it, follow it and see its onchain activity. Free, and you keep full ownership." />
      <ol className="steps4">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="steps4__num" aria-hidden="true">{i + 1}</span>
            <span><b>{s.title}</b><span className="xs secondary">{s.body}</span></span>
          </li>
        ))}
      </ol>
      <SubmitForm />
    </div>
  );
}
