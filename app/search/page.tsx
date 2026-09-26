import { Search } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { Suspense } from "react";
import { SearchPage } from "../../components/SearchPage";

export const metadata: Metadata = { title: "Search", description: "Search protocols, builders, categories, quests, addresses and transactions on Arc." };

export default function Page() {
  return (
    <div className="container page">
      <PageHead icon={Search} kicker="Search" title="Search Arc" lead="Protocols, builders, categories, quests, contracts, wallets and transactions, in one place." />
      <div style={{ height: 24 }} />
      <Suspense><SearchPage /></Suspense>
    </div>
  );
}
