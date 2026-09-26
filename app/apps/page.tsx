import type { Metadata } from "next";
import { Suspense } from "react";
import { Discover } from "../../components/Discover";

export const metadata: Metadata = { title: "Discover" };

export default function AppsPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Discover</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Apps on Arc</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Search by name or pick a category.</p>
      <Suspense>
        <Discover />
      </Suspense>
    </div>
  );
}
