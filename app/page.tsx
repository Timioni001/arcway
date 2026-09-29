import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { AppMark } from "../components/CategoryIcon";
import { EcosystemMap } from "../components/EcosystemMap";
import { ArcRightNow, DiscoverApps, MoreLink, PulsePreview, WhatsNew } from "../components/Onboarding";
import { Reveal } from "../components/Reveal";
import { Ticker } from "../components/Ticker";
import { builderMark, buildersFrom } from "../lib/builders";
import { ARC_DOCS_URL } from "../lib/config";
import { QUESTS } from "../lib/quests";
import { APPS, CATEGORIES, categoryCounts, discoverApps, type Category } from "../lib/registry";

function Head({ id, kicker, title, lede, action }: { id: string; kicker: string; title: string; lede?: ReactNode; action?: ReactNode }) {
  return (
    <div className="ohead">
      <div>
        <div className="ohead__kicker">{kicker}</div>
        <h2 id={id} className="ohead__title">{title}</h2>
        {lede && <p className="ohead__lede">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

type Path = { title: string; body: string; href: string; cats: Category[] };
const PATHS: Path[] = [
  { title: "Move money", body: "Send, receive and bring dollars to Arc.", href: "/ecosystem?category=Payments#protocols", cats: ["Payments", "Bridges", "Wallets"] },
  { title: "Trade", body: "Swap stablecoins and currencies.", href: "/ecosystem?category=Trading#protocols", cats: ["Trading", "FX"] },
  { title: "Earn", body: "Put dollars to work in lending markets.", href: `/ecosystem?category=${encodeURIComponent("Lend & Earn")}#protocols`, cats: ["Lend & Earn"] },
  { title: "Build", body: "See who's building and what they ship.", href: "/builders", cats: [] },
  { title: "Explore", body: "Browse the whole ecosystem at once.", href: "/ecosystem", cats: [...CATEGORIES] }
];

const PILLARS: { title: string; body: string }[] = [
  { title: "Payments", body: "Send and receive dollars. Network fees are paid in USDC." },
  { title: "Markets", body: "Stablecoin and currency trading with fast, final settlement." },
  { title: "Assets", body: "Tokenized assets issued and held on an open network." },
  { title: "Agents", body: "Software that moves money within rules you set." }
];

export default function Home() {
  const live = APPS.filter((a) => a.active && !a.sample);
  const counts = categoryCounts(live);
  const builders = buildersFrom();
  const words = ["Understand", "what’s", "happening", "on"];

  return (
    <div className="page page--home">
      {/* 1. Hero */}
      <section className="hero hero--v3" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Discovery and intelligence</span>
            <h1 id="hero-title" className="hero__title">
              {words.map((w, i) => (
                <Fragment key={w}><span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
              ))}
              <span className="word gradient-text" style={{ "--i": words.length } as React.CSSProperties}>Arc.</span>
            </h1>
            <p className="hero__sub enter enter-3">Apps, builders, assets and network activity on Arc, with the source of every number. No wallet needed.</p>
            <div className="hero__actions row enter enter-3">
              <Link href="/apps" className="btn btn--primary">Explore apps <ArrowRight aria-hidden="true" /></Link>
              <Link href="/pulse" className="btn btn--secondary">Recent activity</Link>
            </div>
            <ul className="trust-strip enter enter-3" aria-label="At a glance">
              <li><b><Ticker value={live.length} /></b> apps</li>
              <li><b><Ticker value={builders.length} /></b> builders</li>
              <li><b><Ticker value={CATEGORIES.length} /></b> categories</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. Intent paths */}
        <section className="osec" aria-labelledby="paths-title">
          <Head id="paths-title" kicker="Start here" title="What are you looking for?" />
          <ul className="dpaths">
            {PATHS.map((p, i) => {
              const n = p.cats.reduce((sum, c) => sum + counts[c], 0);
              return (
                <Reveal as="li" key={p.title} delay={i * 60}>
                  <Link href={p.href} className="dpath">
                    <span className="dpath__title">{p.title}</span>
                    <span className="dpath__body">{p.body}</span>
                    <span className="dpath__foot">
                      <span>{p.title === "Build" ? `${builders.length} builders` : `${n} app${n === 1 ? "" : "s"}`}</span>
                      <ArrowRight aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </section>

        {/* 3. Arc at a glance */}
        <section className="osec" id="how-arc" aria-labelledby="glance-title">
          <Head
            id="glance-title"
            kicker="Arc at a glance"
            title="What is Arc?"
            lede="An open network for money on the internet. Apps on Arc settle in US dollars (USDC)."
            action={<a className="more-link" href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Arc docs<span className="more-link__arrow" aria-hidden="true"><ArrowUpRight /></span></a>}
          />
          <ul className="pillars pillars--plain">
            {PILLARS.map((p) => (
              <li key={p.title} className="pillar">
                <span className="pillar__title">{p.title}</span>
                <span className="pillar__body">{p.body}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Arc right now */}
        <section className="osec" id="now" aria-labelledby="now-title">
          <Head id="now-title" kicker="Arc right now" title="Network today" action={<MoreLink href="/pulse">Open Pulse</MoreLink>} />
          <ArcRightNow apps={live.length} builders={builders.length} categories={CATEGORIES.length} />
        </section>

        {/* 5. Ecosystem preview */}
        <section className="osec" id="map" aria-labelledby="map-title">
          <Head id="map-title" kicker="Ecosystem" title="How it fits together" action={<MoreLink href="/ecosystem">Full ecosystem</MoreLink>} />
          <Reveal><EcosystemMap compact /></Reveal>
        </section>

        {/* 6. What changed */}
        <section className="osec" id="new" aria-labelledby="new-title">
          <Head id="new-title" kicker="What changed" title="What's new" action={<MoreLink href="/radar">Open Radar</MoreLink>} />
          <WhatsNew />
        </section>

        {/* 7. Application discovery */}
        <section className="osec" aria-labelledby="apps-title">
          <Head id="apps-title" kicker="Apps" title="Explore apps" action={<MoreLink href="/apps">All apps</MoreLink>} />
          <DiscoverApps apps={discoverApps(APPS).filter((a) => !a.sample).slice(0, 6)} />
        </section>

        {/* 8. Builder discovery */}
        <section className="osec" aria-labelledby="builders-title">
          <Head id="builders-title" kicker="Builders" title="Who's building" action={<MoreLink href="/builders">All builders</MoreLink>} />
          <ul className="bchips">
            {builders.slice(0, 8).map((b) => (
              <li key={b.id}>
                <Link href={`/builders/${b.id}`} className="bchip">
                  <AppMark app={builderMark(b)} size="sm" />
                  <span><span className="bchip__name">{b.name}</span><span className="xs secondary">{b.apps.map((a) => a.name).join(", ")}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. Live activity preview */}
        <section className="osec" id="pulse" aria-labelledby="pulse-title">
          <Head id="pulse-title" kicker="Pulse" title="Recent activity" action={<MoreLink href="/pulse">View all activity</MoreLink>} />
          <PulsePreview />
        </section>

        {/* 10. Quests */}
        <section className="osec" id="quests" aria-labelledby="quests-title">
          <Head id="quests-title" kicker="Participate" title="Quests" lede="Short tasks on real Arc apps. Each one adds XP to your passport." action={<MoreLink href="/quests">All quests</MoreLink>} />
          <ul className="qpreview">
            {QUESTS.slice(0, 3).map((q) => (
              <li key={q.id}>
                <Link href={`/quests/${q.id}`} className="dpath">
                  <span className="dpath__title">{q.title}</span>
                  <span className="dpath__body">{q.description}</span>
                  <span className="dpath__foot"><span>+{q.xp} XP · {q.minutes} min</span><ArrowRight aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
