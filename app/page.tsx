import { Activity, ArrowLeftRight, ArrowRight, Award, BookOpen, Bot, Code2, Compass, Gem, Map as MapIcon, Network, PiggyBank, Radar, Rocket, Send, ShieldCheck, Target, TrendingUp, type LucideIcon } from "lucide-react";
import { IconOrb, type OrbHue } from "../components/IconOrb";
import { PassportPromo } from "../components/PassportPromo";
import { PassportProof } from "../components/PassportProof";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { AppMark } from "../components/CategoryIcon";
import { EcosystemMap } from "../components/EcosystemMap";
import { FloatingDots } from "../components/FloatingDots";
import { HeroArt } from "../components/HeroArt";
import { ArcRightNow, DiscoverApps, LearnArcLink, MoreLink, PulsePreview, WhatsNew } from "../components/Onboarding";
import { Reveal } from "../components/Reveal";
import { builderMark, buildersFrom } from "../lib/builders";
import { ARC_DOCS_URL } from "../lib/config";
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

type Path = { icon: LucideIcon; hue: OrbHue; title: string; body: string; href: string; cats: Category[] };
const PATHS: Path[] = [
  { icon: Send, hue: "blue", title: "Move money", body: "Send, receive and bring dollars to Arc.", href: "/ecosystem?category=Payments#protocols", cats: ["Payments", "Bridges", "Wallets"] },
  { icon: ArrowLeftRight, hue: "teal", title: "Trade", body: "Swap stablecoins and currencies.", href: "/ecosystem?category=Trading#protocols", cats: ["Trading", "FX"] },
  { icon: PiggyBank, hue: "green", title: "Earn", body: "Put dollars to work in lending markets.", href: `/ecosystem?category=${encodeURIComponent("Lend & Earn")}#protocols`, cats: ["Lend & Earn"] },
  { icon: Code2, hue: "violet", title: "Build", body: "See who's building and what they ship.", href: "/builders", cats: [] },
  { icon: Network, hue: "amber", title: "Explore", body: "Browse the whole ecosystem at once.", href: "/ecosystem", cats: [...CATEGORIES] }
];

const PILLARS: { icon: LucideIcon; hue: OrbHue; title: string; body: string }[] = [
  { icon: Send, hue: "sky", title: "Payments", body: "Send and receive dollars as easily as a message. Network fees are paid in USDC too." },
  { icon: TrendingUp, hue: "teal", title: "Markets", body: "Trade stablecoins and currencies on apps built for fast, final settlement." },
  { icon: Gem, hue: "pink", title: "Assets", body: "Tokenized assets and collectibles, issued and held on an open network." },
  { icon: Bot, hue: "amber", title: "Agents", body: "Software that can hold and move money for you, within rules you set." }
];

const STEPS: { icon: LucideIcon; hue: OrbHue; title: string; body: string }[] = [
  { icon: BookOpen, hue: "sky", title: "Learn what Arc is", body: "A 30-second explainer, just below. No jargon." },
  { icon: Compass, hue: "teal", title: "Find an app and try it", body: "Pick what you want to do; we show the apps for it." },
  { icon: Target, hue: "amber", title: "Earn your passport", body: "Quick quests add XP and badges to your record on Arc." }
];

const DEEPER: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "#map", label: "Ecosystem map", icon: MapIcon },
  { href: "#now", label: "Arc right now", icon: Activity },
  { href: "#new", label: "What's new", icon: Radar },
  { href: "#pulse", label: "Live activity", icon: TrendingUp },
  { href: "#proof", label: "Onchain proof", icon: ShieldCheck }
];

export default function Home() {
  const live = APPS.filter((a) => a.active && !a.sample);
  const counts = categoryCounts(live);
  const builders = buildersFrom();
  const words = ["Understand", "what’s", "happening", "on"];

  return (
    <div className="page page--home">
      {/* ---------------- Part 1: the basics, for anyone ---------------- */}
      <section className="hero hero--v3" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Your guide to Arc</span>
            <h1 id="hero-title" className="hero__title">
              {words.map((w, i) => (
                <Fragment key={w}><span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
              ))}
              <span className="word gradient-text" style={{ "--i": words.length } as React.CSSProperties}>Arc.</span>
            </h1>
            <p className="hero__sub enter enter-3">Find apps worth trying, learn how Arc works, and earn a passport as you go. Free, with no sign-up.</p>
            <div className="hero__actions row enter enter-3">
              <Link href="/apps" className="btn btn--primary">Explore apps <ArrowRight aria-hidden="true" /></Link>
              <Link href="#how" className="btn btn--secondary">How it works</Link>
            </div>
            <ul className="trust-strip enter enter-3" aria-label="At a glance">
              <li><b>{live.length}</b> apps</li>
              <li><b>{builders.length}</b> builders</li>
              <li><b>{CATEGORIES.length}</b> categories</li>
              <li>Free, no sign-up</li>
            </ul>
          </div>
          <HeroArt />
        </div>
      </section>

      <div className="container">
        <section className="osec" id="how" aria-labelledby="how-title">
          <Head id="how-title" kicker="How it works" title="Three steps, no experience needed" />
          <ol className="steps3">
            {STEPS.map((st, i) => (
              <Reveal as="li" key={st.title} delay={i * 70} className="step3">
                <span className="step3__num mono" aria-hidden="true">{i + 1}</span>
                <IconOrb icon={st.icon} hue={st.hue} />
                <span className="step3__title">{st.title}</span>
                <span className="step3__body">{st.body}</span>
              </Reveal>
            ))}
          </ol>
        </section>
      </div>

      <section className="glance" id="how-arc" aria-labelledby="glance-title">
        <FloatingDots count={26} seed={3} />
        <div className="container glance__grid">
          <div className="glance__copy">
            <div className="ohead__kicker">Arc in 30 seconds</div>
            <h2 id="glance-title" className="glance__title">What is Arc?</h2>
            <p className="glance__lede">Arc is an open network for money on the internet: payments, markets and apps that settle in US dollars (USDC). Arcway helps you find your way around it.</p>
            <LearnArcLink href={ARC_DOCS_URL} />
          </div>
          <ul className="pillars">
            {PILLARS.map((p) => (
              <li key={p.title} className="pillar">
                <IconOrb icon={p.icon} hue={p.hue} size="sm" glass />
                <span className="pillar__title">{p.title}</span>
                <span className="pillar__body">{p.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container">
        <section className="osec" aria-labelledby="paths-title">
          <Head id="paths-title" kicker="Start here" title="What are you looking for?" />
          <ul className="dpaths">
            {PATHS.map((p, i) => {
              const n = p.cats.reduce((sum, c) => sum + counts[c], 0);
              return (
                <Reveal as="li" key={p.title} delay={i * 60}>
                  <Link href={p.href} className="dpath">
                    <IconOrb icon={p.icon} hue={p.hue} />
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

        <section className="osec" aria-labelledby="apps-title">
          <Head id="apps-title" kicker="Popular on Arc" title="Apps to try first" action={<MoreLink href="/apps">See all apps</MoreLink>} />
          <DiscoverApps apps={discoverApps(APPS).filter((a) => !a.sample).slice(0, 6)} />
        </section>

        <section className="osec" aria-labelledby="passport-title">
          <PassportPromo />
        </section>

        <section className="osec" aria-labelledby="builders-title">
          <Head id="builders-title" kicker="Who's building" title="The teams behind the apps" action={<MoreLink href="/builders">See all builders</MoreLink>} />
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
      </div>

      {/* ---------------- Part 2: go deeper, live network data ---------------- */}
      <section className="deeper" aria-labelledby="deeper-title">
        <div className="container">
          <div className="deeper__head">
            <div>
              <div className="ohead__kicker">Go deeper</div>
              <h2 id="deeper-title" className="ohead__title">Live data from the Arc network</h2>
              <p className="ohead__lede">For the curious. Everything below is read live from Arc&apos;s public explorer, and every number shows where it came from.</p>
            </div>
            <nav className="deeper__jump" aria-label="In this part">
              {DEEPER.map((d) => <a key={d.href} href={d.href} className="chip"><d.icon aria-hidden="true" />{d.label}</a>)}
            </nav>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="osec" id="map" aria-labelledby="map-title">
          <Head id="map-title" kicker="Ecosystem map" title="How everything fits together" lede="Categories, the apps in each, and the teams behind them. Tap any circle." action={<MoreLink href="/ecosystem">Open the full map</MoreLink>} />
          <Reveal><EcosystemMap compact /></Reveal>
        </section>

        <section className="osec" id="now" aria-labelledby="now-title">
          <Head id="now-title" kicker="Arc right now" title="A living ecosystem" lede="What's listed on Arcway, and how busy the network is today." />
          <ArcRightNow apps={live.length} builders={builders.length} categories={CATEGORIES.length} />
        </section>

        <section className="osec" id="new" aria-labelledby="new-title">
          <Head id="new-title" kicker="What's new" title="Changes on Arc today" lede="New contracts, verifications and shifts in activity, each with its period and source." action={<MoreLink href="/radar">Open Radar</MoreLink>} />
          <WhatsNew />
        </section>

        <section className="osec" id="pulse" aria-labelledby="pulse-title">
          <Head id="pulse-title" kicker="Arc Pulse" title="Happening now" lede="App use, new contracts and USDC moving across Arc, in plain words." action={<MoreLink href="/pulse">View live activity</MoreLink>} />
          <PulsePreview />
        </section>

        <section className="osec" id="proof" aria-labelledby="proof-title">
          <Head id="proof-title" kicker="Onchain proof" title="Recorded on Arc, checkable by anyone" lede="Every XP claim is a transaction to Arcway's own contract on Arc. Open it on the explorer and see for yourself." action={<MoreLink href="/leaderboard">See the leaderboard</MoreLink>} />
          <PassportProof />
        </section>

        {/* ---------------- Part 3: for builders ---------------- */}
        <section className="osec" aria-labelledby="build-title">
          <div className="buildcta">
            <IconOrb icon={Rocket} hue="violet" size="lg" />
            <div className="buildcta__copy">
              <div className="ohead__kicker">For builders</div>
              <h2 id="build-title" className="ohead__title">Built something on Arc?</h2>
              <p className="ohead__lede">List it in two minutes so people can find it, follow it and see its activity. Then add a live badge to your site.</p>
            </div>
            <div className="buildcta__actions">
              <Link href="/submit" className="btn btn--primary">Submit a project <ArrowRight aria-hidden="true" /></Link>
              <Link href="/widgets" className="btn btn--secondary"><Award aria-hidden="true" />Get a badge</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
