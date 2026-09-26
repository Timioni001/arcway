import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { BuilderCard, GetListedCard } from "../components/Builders";
import { HeroArt } from "../components/HeroArt";
import { AppShowcase, CategoryGrid, HowItWorks } from "../components/HomeSections";
import { NextStepBar } from "../components/NextStepBar";
import { PassCard } from "../components/PassCard";
import { QuestPath } from "../components/QuestPath";
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
            <h1 id="hero-title" className="hero__title enter enter-2">
              Discover what&apos;s being built on <span className="gradient-text">Arc.</span>
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
            title="Your first four quests."
            sub="Each takes a few minutes. We check them automatically."
            action={<Link href="/quests" className="link">All quests <ArrowRight aria-hidden="true" /></Link>}
          />
          <QuestPath />
        </section>

        <section className="section" id={SECTIONS.passport} aria-labelledby="passport-title">
          <div className="showcase">
            <Reveal className="showcase__copy">
              <div className="label" style={{ color: "var(--link)", marginBottom: 10 }}>Passport</div>
              <h2 id="passport-title" className="h2">A passport that grows with you.</h2>
              <ul className="feature-list">
                <li><span className="tile" data-shade="1"><Trophy aria-hidden="true" /></span><span><b>Earn XP</b><br /><span className="small secondary">Every quest you finish adds to your level.</span></span></li>
                <li><span className="tile" data-shade="2"><BadgeCheck aria-hidden="true" /></span><span><b>Collect badges</b><br /><span className="small secondary">One for each milestone you reach.</span></span></li>
                <li><span className="tile" data-shade="3"><Wallet aria-hidden="true" /></span><span><b>Yours to keep</b><br /><span className="small secondary">Tied to your wallet, not an account.</span></span></li>
              </ul>
              <Link href="/passport" className="btn btn--primary" style={{ marginTop: 32 }}>Open passport <ArrowRight aria-hidden="true" /></Link>
            </Reveal>
            <Reveal className="showcase__card"><PassCard /></Reveal>
          </div>
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
