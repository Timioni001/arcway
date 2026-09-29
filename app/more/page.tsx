import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import { MoreHub } from "../../components/MoreHub";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "More", description: "Activity, what's new, insights, builders, your watchlist and settings." };

export default function MorePage() {
  return (
    <div className="container page">
      <PageHead icon={LayoutGrid} kicker="More" title="More on Arcway" lead="Go deeper into Arc, or manage your things." />
      <MoreHub />
    </div>
  );
}
