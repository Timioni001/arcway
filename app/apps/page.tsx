import type { Metadata } from "next";
import { Discover } from "../../components/Discover";

export const metadata: Metadata = { title: "Discover apps" };

export default function AppsPage() {
  return (
    <div className="container page">
      <div className="label">Discover</div>
      <h1 className="display" style={{ marginTop: 16 }}>Apps on Arc.</h1>
      <p className="lede" style={{ marginTop: 16, marginBottom: 48 }}>
        Curated apps you can use today. Verified listings have contracts we&apos;ve checked with the team.
      </p>
      <Discover />
    </div>
  );
}
