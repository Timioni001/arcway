import { Newspaper } from "lucide-react";
import type { Metadata } from "next";
import { DigestView } from "../../components/DigestView";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = {
  title: "Arc today",
  description: "What changed on Arc today: activity, new and verified contracts, notable signals and new apps.",
  alternates: { types: { "application/rss+xml": "/digest/feed.xml" } }
};

export default function DigestPage() {
  return (
    <div className="container page">
      <PageHead icon={Newspaper} kicker="Daily digest" title="Arc today" lead="Everything that changed on Arc in the last day, in one page you can share or follow by RSS." />
      <DigestView />
    </div>
  );
}
