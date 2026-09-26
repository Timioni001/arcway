import type { Metadata } from "next";
import { Suspense } from "react";
import { Discover } from "../../components/Discover";
import { TrailCards } from "../../components/Trails";
import { TRAILS } from "../../lib/trails";

export const metadata: Metadata = { title: "Discover" };

export default function AppsPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Discover</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Apps on Arc</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Start with a goal, or search every app.</p>
      <section aria-labelledby="trails-title" style={{ marginBottom: 56 }}>
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
