import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { FeeCalculator } from "../../components/FeeCalculator";
import { ActivityStrip, CategoryBars, ConnectBanner, NetworkCard, NewApps, OverviewStats, SavedApps } from "../../components/Overview";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Overview</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Your Arc at a glance</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Progress, activity and what&apos;s new, in one place.</p>

      <ConnectBanner />
      <OverviewStats />

      <div className="dash">
        <div className="dash__main">
          <ActivityStrip />
          <section aria-labelledby="recent-title">
            <div className="row between" style={{ margin: "8px 0 14px" }}>
              <h2 id="recent-title" className="h4">Recent activity</h2>
              <Link href="/activity" className="link small">View all <ArrowRight aria-hidden="true" /></Link>
            </div>
            <Activity limit={6} />
          </section>
        </div>
        <div className="dash__side">
          <NextStep />
          <NetworkCard />
        </div>
      </div>

      <div className="dash dash--even">
        <CategoryBars />
        <NewApps />
      </div>

      <div className="dash dash--even">
        <FeeCalculator />
        <SavedApps />
      </div>
    </div>
  );
}
