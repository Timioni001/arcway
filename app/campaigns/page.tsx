import { Gift } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CampaignList } from "../../components/Campaigns";
import { PageHead } from "../../components/PageHead";
import { MODES, MODE_HELP, MODE_LABEL } from "../../lib/campaigns";

export const metadata: Metadata = { title: "Campaigns", description: "Live campaigns from projects on Arc: complete real tasks, share a USDC prize pool locked in escrow. Free to join." };

export default function CampaignsPage() {
  return (
    <div className="container page">
      <PageHead icon={Gift} kicker="Campaigns" title="Live campaigns on Arc" lead="Projects put up a USDC prize pool for trying their app. Complete the tasks, join for free, and get rewarded. Every pool is locked on chain until it's paid out.">
        <Link href="/launch" className="btn btn--secondary">Launch a campaign</Link>
      </PageHead>
      <ol className="cpg-how" aria-label="Ways a pool is shared">
        {MODES.map((m, i) => (
          <li key={m}><span className="cpg-how__n" aria-hidden="true">{i + 1}</span><span><b>{MODE_LABEL[m]}</b><span className="xs secondary">{MODE_HELP[m]}</span></span></li>
        ))}
      </ol>
      <CampaignList />
    </div>
  );
}
