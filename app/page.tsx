import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { BuilderCard, GetListedCard } from "../components/Builders";
import { HeroArt } from "../components/HeroArt";
import { AppShowcase, CategoryGrid, HowItWorks } from "../components/HomeSections";
import { NextStepBar } from "../components/NextStepBar";
import { Campaign } from "../components/Campaign";
import { LiveMarquee } from "../components/LiveMarquee";
import { PassportSection } from "../components/PassportSection";
import { Reveal } from "../components/Reveal";
import { SectionHeader } from "../components/Section";
import { buildersFrom } from "../lib/builders";
import { ARC_DOCS_URL } from "../lib/config";
import { APPS, discoverApps } from "../lib/registry";
import { SECTIONS } from "../lib/sections";

export default function Home() {
  const apps = discoverApps(APPS);
  const featured = apps.find((a) => a.featured);
  const others = apps.filter((a) => a !== featured).slice(0, 3);
  const builders = buildersFrom();

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Apps, quests and your passport</span>
            <h1 id="hero-title" className="hero__title">
              {["Discover", "what’s", "being", "built", "on"].map((w, i) => (
                <Fragment key={w}><span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
              ))}
              <span className="word gradient-text shimmer" style={{ "--i": 5 } as React.CSSProperties}>Arc.</span>
            </h1>
            <p className="hero__sub enter enter-3">
              Find apps worth trying, complete quick quests and build a passport of everything you do.
            </p>
            <div className="hero__actions row enter enter-3">
              <Link href="/apps" className="btn btn--primary">Explore apps <ArrowRight aria-hidden="true" /></Link>
              <Link href="#how" className="btn btn--secondary">How it works</Link>
            </div>
            <ul className="trust enter enter-3">
              <li><Check aria-hidden="true" />Free to join</li>
              <li><Check aria-hidden="true" />No sign-up</li>
              <li><Check aria-hidden="true" />Works with your wallet</li>
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      <div className="container">
        <NextStepBar />
      </div>
      <LiveMarquee />

      <div className="container">

        <section className="section" aria-labelledby="cats-title">
          <SectionHeader
            label="Categories"
            titleId="cats-title"
            title="What do you want to do?"
            action={<Link href="/apps" className="link">All apps <ArrowRight aria-hidden="true" /></Link>}
          />
          <CategoryGrid apps={APPS} />
        </section>

        <section className="section" id="how" aria-labelledby="how-title">
          <SectionHeader label="How it works" titleId="how-title" title="Three steps to your first XP." />
          <HowItWorks />
        </section>

        <section className="section" id={SECTIONS.discover} aria-labelledby="apps-title">
          <SectionHeader
            label="Apps"
            titleId="apps-title"
            title="Worth trying."
            action={<Link href="/apps" className="link">View all <ArrowRight aria-hidden="true" /></Link>}
          />
          <AppShowcase featured={featured} others={others} />
        </section>

        <section className="section" id={SECTIONS.quests} aria-labelledby="quests-title">
          <SectionHeader
            label="Quests"
            titleId="quests-title"
            title="Start with the Arc Starter campaign."
            sub="Four short quests. We check them automatically."
            action={<Link href="/quests" className="link">All quests <ArrowRight aria-hidden="true" /></Link>}
          />
          <Reveal><Campaign /></Reveal>
        </section>

        <section className="section" id={SECTIONS.passport} aria-labelledby="passport-title">
          <Reveal><PassportSection /></Reveal>
        </section>

        <section className="section" aria-labelledby="builders-title">
          <SectionHeader
            label="Builders"
            titleId="builders-title"
            title="The teams behind the apps."
            action={<Link href="/builders" className="link">All builders <ArrowRight aria-hidden="true" /></Link>}
          />
          <ul className="cards">
            {builders.slice(0, 2).map((b) => <Reveal as="li" key={b.id}><BuilderCard builder={b} /></Reveal>)}
            <Reveal as="li"><GetListedCard /></Reveal>
          </ul>
        </section>

        <section className="section" aria-labelledby="build-title">
          <Reveal className="cta">
            <div>
              <h2 id="build-title" className="h2">Building on Arc?</h2>
              <p style={{ marginTop: 8 }}>Get your app in front of people looking for things to try.</p>
            </div>
            <div className="row">
              <Link href="/builders" className="btn btn--on-dark">Get listed <ArrowRight aria-hidden="true" /></Link>
              <a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn" style={{ color: "#F5FAFF", border: "1px solid rgba(245,250,255,.3)" }}>
                Arc docs <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
