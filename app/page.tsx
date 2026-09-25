import { Activity } from "../components/Activity";
import { Discover } from "../components/Discover";
import { NetworkNotice } from "../components/NetworkNotice";
import { NextStep } from "../components/NextStep";
import { Onboard } from "../components/Onboard";
import { PassportCard } from "../components/PassportCard";
import { QuestList } from "../components/QuestList";
import { WalletButton } from "../components/WalletButton";
import { SECTIONS } from "../lib/sections";

export default function Home() {
  return (
    <>
      <a href="#main" className="visually-hidden">Skip to content</a>
      <main className="container" id="main">
        <nav className="nav" aria-label="Main">
          <div className="logo">arcway</div>
          <WalletButton />
        </nav>

        <NetworkNotice />

        <section className="hero">
          <div>
            <div className="muted small">THE ARC ONBOARDING LAYER</div>
            <h1>Enter Arc.<br />Know what to do next.</h1>
            <p>
              Discover Arc applications, move USDC into the ecosystem, complete
              useful quests, and build an on-chain activity passport.
            </p>
            <NextStep />
          </div>
          <PassportCard />
        </section>

        <section className="section" aria-labelledby="start-title">
          <div className="muted small">START HERE</div>
          <h2 id="start-title">Three steps</h2>
          <Onboard />
        </section>

        <section className="section" id={SECTIONS.discover} aria-labelledby="discover-title">
          <div className="muted small">DISCOVER</div>
          <h2 id="discover-title">Find something to do</h2>
          <Discover />
        </section>

        <section className="section" id={SECTIONS.quests} aria-labelledby="quests-title">
          <div className="muted small">QUESTS</div>
          <h2 id="quests-title">Arc Starter Path</h2>
          <QuestList />
        </section>

        <section className="section" aria-labelledby="activity-title">
          <div className="muted small">ACTIVITY</div>
          <h2 id="activity-title">Your recent Arc transactions</h2>
          <Activity />
        </section>
      </main>
    </>
  );
}
