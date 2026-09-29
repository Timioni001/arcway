import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { Suspense } from "react";
import { Discover } from "../../components/Discover";
import { TrailCards } from "../../components/Trails";
import { TRAILS } from "../../lib/trails";

export const metadata: Metadata = { title: "Explore", description: "Find apps to try on Arc by goal, category and status." };

export default function AppsPage() {
  return (
    <div className="container page">
      <PageHead icon={Compass} kicker="Explore" title="Explore Arc" lead="Start with a goal, or browse every app by category." />
      <section aria-labelledby="trails-title" style={{ margin: "32px 0 56px" }}>
        <h2 id="trails-title" className="h4" style={{ marginBottom: 14 }}>Start with a goal</h2>
        <TrailCards trails={TRAILS} />
      </section>
      <h2 className="h4" style={{ marginBottom: 14 }}>All apps</h2>
      <Suspense>
        <Discover />
      </Suspense>
    </div>
  );
}
