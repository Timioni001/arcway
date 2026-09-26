import { ArrowLeftRight, ArrowRight, Bot, Code2, Gem, Network, PiggyBank, Send, Target, TrendingUp, Trophy, type LucideIcon } from "lucide-react";
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

export default function Home() {
  const live = APPS.filter((a) => a.active && !a.sample);
  const counts = categoryCounts(live);
  const builders = buildersFrom();
  const words = ["Understand", "what’s", "happening", "on"];

  return (
    <div className="page page--home">
      {/* 1. Hero */}
      <section className="hero hero--v3" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Ecosystem intelligence</span>
            <h1 id="hero-title" className="hero__title">
              {words.map((w, i) => (
                <Fragment key={w}><span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
              ))}
              <span className="word gradient-text" style={{ "--i": words.length } as React.CSSProperties}>Arc.</span>
            </h1>
            <p className="hero__sub enter enter-3">Explore the people, applications, markets and activity shaping the Arc ecosystem.</p>
            <div className="hero__actions row enter enter-3">
              <Link href="/ecosystem" className="btn btn--primary">Explore Arc <ArrowRight aria-hidden="true" /></Link>
              <Link href="#how-arc" className="btn btn--secondary">How Arc works</Link>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <div className="container">
        {/* 2. Discovery paths */}
        <section className="osec" aria-labelledby="paths-title">
          <Head id="paths-title" kicker="Start here" title="What are you looking for?" />
          <ul className="dpaths">
            {PATHS.map((p, i) => {
              const n = p.cats.reduce((s, c) => s + counts[c], 0);
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
      </div>

      {/* 3. Arc, at a glance (blue section) */}
      <section className="glance" id="how-arc" aria-labelledby="glance-title">
        <FloatingDots count={26} seed={3} />
        <div className="container glance__grid">
          <div className="glance__copy">
            <div className="ohead__kicker">Arc, at a glance</div>
            <h2 id="glance-title" className="glance__title">An open network for money on the internet.</h2>
            <p className="glance__lede">Arc is an open network for financial applications, stablecoin settlement and internet-native economic activity.</p>
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
        {/* 4. Arc right now */}
        <section className="osec" aria-labelledby="now-title">
          <Head id="now-title" kicker="Arc right now" title="A living ecosystem" lede="What's listed on Arcway today, and how busy the network is." />
          <ArcRightNow apps={live.length} builders={builders.length} categories={CATEGORIES.length} />
        </section>

        {/* 5. Explore the ecosystem */}
        <section className="osec" aria-labelledby="map-title">
          <Head id="map-title" kicker="Explore the ecosystem" title="How it fits together" lede="Payments, trading, lending, assets, FX, agents, bridges and wallets, and the apps in each." action={<MoreLink href="/ecosystem">Explore full ecosystem</MoreLink>} />
          <Reveal><EcosystemMap compact /></Reveal>
        </section>

        {/* 6. What's new */}
        <section className="osec" aria-labelledby="new-title">
          <Head id="new-title" kicker="What's new" title="Changes on Arc today" lede="New contracts, verifications and shifts in activity, each with its period and source." action={<MoreLink href="/radar">Open Radar</MoreLink>} />
          <WhatsNew />
        </section>

        {/* 7. Discover applications */}
        <section className="osec" aria-labelledby="apps-title">
          <Head id="apps-title" kicker="Discover applications" title="Apps on Arc" action={<MoreLink href="/apps">Explore apps</MoreLink>} />
          <DiscoverApps apps={discoverApps(APPS).filter((a) => !a.sample).slice(0, 6)} />
        </section>

        {/* 8. Who's building */}
        <section className="osec" aria-labelledby="builders-title">
          <Head id="builders-title" kicker="Who's building" title="The teams behind Arc's apps" action={<MoreLink href="/builders">Explore builders</MoreLink>} />
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

        {/* 9. Arc Pulse preview */}
        <section className="osec" aria-labelledby="pulse-title">
          <Head id="pulse-title" kicker="Arc Pulse" title="Happening now" lede="App use, new contracts and USDC moving across Arc, in plain words." action={<MoreLink href="/pulse">View live activity</MoreLink>} />
          <PulsePreview />
        </section>

        {/* Passport and XP: the reason to come back */}
        <section className="osec" aria-labelledby="passport-title">
          <PassportPromo />
        </section>

        <section className="osec" aria-labelledby="proof-title">
          <Head id="proof-title" kicker="Onchain on Arc" title="Recorded on Arc, checkable by anyone" lede="Every XP claim is a transaction to Arcway's own contract on Arc. Open it on the explorer and see for yourself." action={<MoreLink href="/leaderboard">See the leaderboard</MoreLink>} />
          <PassportProof />
        </section>
      </div>

      {/* 10. Quests (blue section) */}
      <section className="glance glance--quests" aria-labelledby="quests-title">
        <FloatingDots count={16} seed={19} />
        <div className="container quests-band">
          <div>
            <div className="ohead__kicker">Quests</div>
            <h2 id="quests-title" className="glance__title">Learn Arc by doing.</h2>
            <ol className="quest-steps">
              <li><IconOrb icon={Network} hue="sky" size="sm" />Explore Arc</li>
              <li><IconOrb icon={Target} hue="amber" size="sm" />Complete missions</li>
              <li><IconOrb icon={Trophy} hue="pink" size="sm" />Earn XP</li>
            </ol>
          </div>
          <Link href="/quests" className="btn btn--on-blue">Explore quests <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
