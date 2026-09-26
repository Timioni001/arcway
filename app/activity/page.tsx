import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { ActivityApps } from "../../components/ActivityApps";
import { ConnectBanner, ActivityStrip } from "../../components/Overview";

export const metadata: Metadata = { title: "Activity", description: "Your recent transactions on Arc, matched to the apps you used." };

export default function ActivityPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Activity</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Your activity on Arc</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Recent transactions from your wallet, matched to the apps you used.</p>
      <ConnectBanner />
      <div className="dash">
        <div className="dash__main">
          <ActivityStrip />
          <section aria-labelledby="tx-title">
            <h2 id="tx-title" className="h4" style={{ margin: "8px 0 14px" }}>Transactions</h2>
            <Activity limit={20} />
          </section>
        </div>
        <div className="dash__side">
          <ActivityApps />
        </div>
      </div>
    </div>
  );
}
