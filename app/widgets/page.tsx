import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { WidgetBuilder } from "../../components/WidgetBuilder";

export const metadata: Metadata = { title: "Badges and widgets", description: "Add a live \"on Arc\" badge to your README or website." };

export default function WidgetsPage() {
  return (
    <div className="container page">
      <PageHead icon={Code2} kicker="Build on Arc" title="Badges for your project" lead="Show that your app is live on Arc, with real activity, on your README or website. Every badge links back to your Arcway page." />
      <div style={{ height: 28 }} />
      <WidgetBuilder />
    </div>
  );
}
