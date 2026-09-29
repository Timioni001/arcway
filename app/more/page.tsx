import { Menu } from "lucide-react";
import type { Metadata } from "next";
import { MoreHub } from "../../components/MoreHub";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Menu", description: "Every part of Arcway: discover, intelligence and participation." };

export default function MorePage() {
  return (
    <div className="container page">
      <PageHead icon={Menu} kicker="Menu" title="Everything on Arcway" lead="Discover what exists, see what changed, take part." />
      <MoreHub />
    </div>
  );
}
