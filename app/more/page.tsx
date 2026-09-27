import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import { MoreHub } from "../../components/MoreHub";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Everything on Arcway", description: "Every part of Arcway, from getting started to live network data and builder tools." };

export default function MorePage() {
  return (
    <div className="container page">
      <PageHead icon={LayoutGrid} kicker="More" title="Everything on Arcway" lead="Start at the top with the basics. Live network data and builder tools are further down." />
      <MoreHub />
    </div>
  );
}
