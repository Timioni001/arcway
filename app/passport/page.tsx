import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { Badges, PassportStats, ProfileCard } from "../../components/PassportParts";

export const metadata: Metadata = { title: "Passport" };

export default function PassportPage() {
  return (
    <div className="container page">
      <h1 className="h1" style={{ marginBottom: 32 }}>Passport</h1>
      <div className="detail" style={{ marginTop: 0 }}>
        <ProfileCard />
        <div style={{ display: "grid", gap: 20 }}>
          <PassportStats />
          <NextStep />
        </div>
      </div>

      <section className="section" style={{ paddingTop: 64 }} aria-labelledby="badges-title">
        <h2 id="badges-title" className="h3" style={{ marginBottom: 20 }}>Badges</h2>
        <Badges />
      </section>

      <section className="section" style={{ paddingTop: 64 }} aria-labelledby="onchain-title">
        <h2 id="onchain-title" className="h3" style={{ marginBottom: 20 }}>Onchain activity</h2>
        <Activity />
      </section>
    </div>
  );
}
