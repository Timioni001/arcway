import { Bookmark } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { WatchlistView } from "../../components/WatchlistView";

export const metadata: Metadata = { title: "Watchlist", description: "Protocols, builders and categories you follow on Arc." };

export default function WatchlistPage() {
  return (
    <div className="container page">
      <PageHead icon={Bookmark} kicker="Watchlist" title="Watchlist" lead="Protocols, builders and categories you follow, with their activity and signals. Kept in this browser." />
      <WatchlistView />
    </div>
  );
}
