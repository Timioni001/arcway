import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Discover } from "../components/Discover";
import { HeroObject } from "../components/HeroObject";
import { NetworkMap } from "../components/NetworkMap";
import { NextStep } from "../components/NextStep";
import { PassportSummary, PassportVisual } from "../components/Passport";
import { QuestGrid } from "../components/Quests";
import { SectionHeader } from "../components/Section";
import { ARC_DOCS_URL, SUBMIT_APP_URL } from "../lib/config";
import { SECTIONS } from "../lib/sections";

const TOTAL = "07";
const FRAGMENTS = ["Apps", "Quests", "Experiments", "Builders", "Infrastructure"];

export default function Home() {
  return (
    <div className="container">
      {/* 01 / INTRO */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <div className="label enter">01 / {TOTAL} · Built on Arc</div>
          <h1 id="hero-title" className="display-xl enter enter-2" style={{ marginTop: 24 }}>
            Discover what&apos;s<br />being built<br />on Arc.
          </h1>
          <p className="lede enter enter-3" style={{ marginTop: 24 }}>
            Find apps, quests and useful things to do on Arc, then build a verified record of what you&apos;ve done.
          </p>
          <div className="hero__cta row enter enter-4">
            <Link href="#discover" className="btn btn--primary">Explore apps <ArrowRight aria-hidden="true" /></Link>
            <a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
              Build on Arc <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
          <div className="hero__next enter enter-4">
            <NextStep />
          </div>
        </div>
        <div className="hero__visual">
          <HeroObject />
        </div>
      </section>

      {/* 02 / PROBLEM */}
      <section className="section" aria-labelledby="problem-title">
        <div className="mono muted">02 / {TOTAL}</div>
        <h2 id="problem-title" className="display" style={{ marginTop: 16, maxWidth: 900 }}>
          Arc is live.<br /><span className="muted">Discovery is still fragmented.</span>
        </h2>
        <ul className="fragments" style={{ listStyle: "none", padding: 0 }}>
          {FRAGMENTS.map((f, i) => (
            <li key={f} className="fragment">
              <div className="mono muted">{String(i + 1).padStart(2, "0")}</div>
              <div className="title" style={{ marginTop: 24 }}>{f}</div>
            </li>
          ))}
        </ul>
      </section>

      {/* 03 / NETWORK */}
      <section className="section" aria-labelledby="network-title">
        <SectionHeader
          marker={`03 / ${TOTAL}`}
          label="One map"
          titleId="network-title"
          title="Everything on Arc, connected."
          lede="Arcway links what's live on Arc to what you can do there, and to the builders behind it."
        />
        <NetworkMap />
      </section>

      {/* 04 / DISCOVER */}
      <section className="section" id={SECTIONS.discover} aria-labelledby="discover-title">
        <SectionHeader
          marker={`04 / ${TOTAL}`}
          label="Discover"
          titleId="discover-title"
          title="Find something to do on Arc."
          action={<Link href="/apps" className="btn btn--secondary">All apps <ArrowRight aria-hidden="true" /></Link>}
        />
        <Discover />
      </section>

      {/* 05 / QUESTS */}
      <section className="section" id={SECTIONS.quests} aria-labelledby="quests-title">
        <SectionHeader
          marker={`05 / ${TOTAL}`}
          label="Quests"
          titleId="quests-title"
          title="The Arc starter path."
          lede="Four short missions. Each one is verified from your onchain activity, not a checkbox."
          action={<Link href="/quests" className="btn btn--secondary">All quests <ArrowRight aria-hidden="true" /></Link>}
        />
        <QuestGrid />
      </section>

      {/* 06 / PASSPORT */}
      <section className="section" id={SECTIONS.passport} aria-labelledby="passport-title">
        <SectionHeader marker={`06 / ${TOTAL}`} label="Passport" titleId="passport-title" title="A record that's actually yours." />
        <div className="passport-grid">
          <PassportVisual />
          <PassportSummary compact />
        </div>
      </section>

      {/* 07 / BUILD */}
      <section className="section" aria-labelledby="build-title">
        <div className="build">
          <div className="mono muted">07 / {TOTAL}</div>
          <h2 id="build-title" className="display" style={{ marginTop: 16, maxWidth: 640 }}>Shipping on Arc?</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Get your app listed and turn its first action into a verified quest.
          </p>
          <div className="row" style={{ marginTop: 32 }}>
            <a href={SUBMIT_APP_URL} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              Submit your app <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
              Arc docs <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
