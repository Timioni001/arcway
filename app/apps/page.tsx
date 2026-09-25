import type { Metadata } from "next";
import { Discover } from "../../components/Discover";

export const metadata: Metadata = { title: "Discover" };

export default function AppsPage() {
  return (
    <div className="container page">
      <h1 className="h1" style={{ marginBottom: 28 }}>Discover</h1>
      <Discover />
    </div>
  );
}
