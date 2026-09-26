import { ArrowRight, UserRound } from "lucide-react";
import { PageHead } from "../../components/PageHead";
import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { NextStepBar } from "../../components/NextStepBar";
import { FeeCalculator } from "../../components/FeeCalculator";
import { ActivityStrip, CategoryBars, NetworkCard, NewApps, OverviewStats, SavedApps } from "../../components/Overview";

export const metadata: Metadata = { title: "Your Arc", description: "Your progress, activity and followed apps on Arc." };

export default function OverviewPage() {
  return (
    <div className="container page">
      <PageHead icon={UserRound} kicker="Your Arc" title="Your Arc at a glance" lead="Your progress, activity and followed apps, in one place." />
      <div style={{ height: 20 }} />
      <NextStepBar />
      <div style={{ height: 20 }} />
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
