import type { Metadata } from "next";
import { Activity } from "../../components/Activity";
import { NextStep } from "../../components/NextStep";
import { PassCard } from "../../components/PassCard";
import { Badges, PassportStats, ProfileCard } from "../../components/PassportParts";
import { MyPassportActions, PassportLookup } from "../../components/PassportActions";
import { LevelLadder } from "../../components/PassportSection";

export const metadata: Metadata = { title: "Passport" };

export default function PassportPage() {
  return (
    <div className="container page">
      <div className="row between" style={{ alignItems: "flex-end", gap: 16, marginBottom: 32 }}>
        <div>
          <div className="label" style={{ color: "var(--link)" }}>Passport</div>
          <h1 className="h1" style={{ marginTop: 10 }}>Your record on Arc</h1>
        </div>
        <MyPassportActions />
      </div>

      <div className="showcase" style={{ alignItems: "start" }}>
        <div className="showcase__card"><PassCard /></div>
        <div className="showcase__copy showcase__copy--wide">
          <ProfileCard />
          <PassportStats />
        </div>
      </div>

      <div className="dash">
        <section className="card pad-lg" aria-labelledby="levels-title">
          <h2 id="levels-title" className="h4">Levels</h2>
          <p className="small secondary" style={{ marginTop: 4 }}>Earn XP from quests to move up.</p>
          <LevelLadder />
        </section>
        <NextStep />
      </div>

      <section className="section" style={{ paddingTop: 64 }} aria-labelledby="badges-title">
        <h2 id="badges-title" className="h3" style={{ marginBottom: 20 }}>Badges</h2>
        <Badges />
      </section>

      <section className="section" style={{ paddingTop: 64 }} aria-labelledby="activity-title">
        <h2 id="activity-title" className="h3" style={{ marginBottom: 20 }}>Recent activity</h2>
        <Activity />
      </section>

      <section className="section" style={{ paddingTop: 64 }}>
        <div className="card pad-lg"><PassportLookup /></div>
      </section>
    </div>
  );
}
