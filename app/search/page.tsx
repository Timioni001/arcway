import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "../../components/SearchPage";

export const metadata: Metadata = { title: "Search", description: "Search apps, categories, quests and builders on Arc." };

export default function Page() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Search</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Search Arcway</h1>
      <p className="lead" style={{ margin: "12px 0 28px" }}>Apps, categories, quests and builders, in one place.</p>
      <Suspense><SearchPage /></Suspense>
    </div>
  );
}
