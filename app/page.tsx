import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AppCard, FeaturedApp } from "../components/AppCard";
import { BuilderCard, GetListedCard } from "../components/Builders";
import { Forms } from "../components/Forms";
import { NetworkPanel } from "../components/NetworkPanel";
import { QuestGrid } from "../components/Quests";
import { SectionHeader } from "../components/Section";
import { buildersFrom } from "../lib/builders";
import { ARC_DOCS_URL } from "../lib/config";
import { APPS, discoverApps } from "../lib/registry";
import { SECTIONS } from "../lib/sections";

export default function Home() {
  const apps = discoverApps(APPS);
  const featured = apps.find((a) => a.featured);
  const rest = apps.filter((a) => a !== featured).slice(0, 3);
  const builders = buildersFrom();

  return (
    <div className="container">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <span className="badge enter">Built on Arc</span>
          <h1 id="hero-title" className="display enter enter-2" style={{ marginTop: 20 }}>
            Discover what&apos;s being built on Arc.
          </h1>
          <p className="lead enter enter-3" style={{ marginTop: 20, maxWidth: 440 }}>
            Explore apps, quests and builders shipping real products on Arc.
          </p>
          <div className="hero__actions row enter enter-3">
            <Link href="/apps" className="btn btn--primary">Explore apps <ArrowRight aria-hidden="true" /></Link>
            <Link href="/quests" className="btn btn--secondary">View quests</Link>
          </div>
        </div>
        <div className="hero__side">
          <Forms />
          <div className="hero__panel"><NetworkPanel /></div>
        </div>
      </section>

      <section className="section" id={SECTIONS.discover} aria-labelledby="apps-title">
        <SectionHeader titleId="apps-title" title="Explore apps" action={<Link href="/apps" className="link">View all <ArrowRight aria-hidden="true" /></Link>} />
        {featured && <FeaturedApp app={featured} />}
        <ul className="cards">{rest.map((app) => <li key={app.id}><AppCard app={app} /></li>)}</ul>
      </section>

      <section className="section" id={SECTIONS.quests} aria-labelledby="quests-title">
        <SectionHeader titleId="quests-title" title="Quests" action={<Link href="/quests" className="link">View all <ArrowRight aria-hidden="true" /></Link>} />
        <QuestGrid />
      </section>

      <section className="section" aria-labelledby="builders-title">
        <SectionHeader titleId="builders-title" title="Builders" action={<Link href="/builders" className="link">View all <ArrowRight aria-hidden="true" /></Link>} />
        <ul className="cards">
          {builders.slice(0, 2).map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}
          <li><GetListedCard /></li>
        </ul>
      </section>

      <section className="section" aria-labelledby="build-title">
        <div className="cta">
          <div>
            <h2 id="build-title" className="h2">Build on Arc</h2>
            <p style={{ marginTop: 8 }}>USDC gas, sub-second finality, EVM tooling.</p>
          </div>
          <a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn btn--on-dark">
            Read the docs <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
      </section>
    </div>
  );
}
