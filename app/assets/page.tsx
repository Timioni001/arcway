import { Coins } from "lucide-react";
import type { Metadata } from "next";
import { AssetsList } from "../../components/Assets";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Assets", description: "Tokens on Arc with holders, supply, recent transfers and the apps that use them." };

export default function AssetsPage() {
  return (
    <div className="container page">
      <PageHead icon={Coins} kicker="Assets" title="Assets on Arc" lead="Tokens on Arc, ranked by holders. Open one for its activity and the apps that use it." />
      <AssetsList />
    </div>
  );
}
