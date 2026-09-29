import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { HomeNews, HomePassport, PopularQuests } from "../components/HomePublic";
import { MoreLink } from "../components/Onboarding";
import { PassCard } from "../components/PassCard";
import { RewardKinds } from "../components/Rewards";
import { buildersFrom } from "../lib/builders";
import { ARC_DOCS_URL } from "../lib/config";
import { APPS, categoryCounts, type Category } from "../lib/registry";

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

const HEADLINE = ["Explore", "Arc.", "Complete", "quests.", "Build", "your", "Passport."];

const HOW: { title: string; body: string }[] = [
  { title: "Money on the internet", body: "Arc is an open network where apps move US dollars (USDC) as easily as sending a message." },
  { title: "Fees in dollars", body: "You pay small network fees in USDC, not in a separate token." },
  { title: "Your wallet, your record", body: "A wallet is your account on Arc. What you do there is public and yours." }
];

export default function Home() {
  const live = APPS.filter((a) => a.active && !a.sample);
  const counts = categoryCounts(live);
  const builders = buildersFrom();
  const cat = (c: Category) => `/ecosystem?category=${encodeURIComponent(c)}#protocols`;
  const explore: { name: string; href: string; count: string }[] = [
    { name: "Payments", href: cat("Payments"), count: `${counts.Payments} apps` },
    { name: "Trading", href: cat("Trading"), count: `${counts.Trading} apps` },
    { name: "Lending", href: cat("Lend & Earn"), count: `${counts["Lend & Earn"]} apps` },
    { name: "Assets", href: "/assets", count: "Tokens on Arc" },
    { name: "Apps", href: "/apps", count: `${live.length} apps` },
    { name: "Builders", href: "/builders", count: `${builders.length} teams` }
  ];

  return (
    <div className="page page--home">
      <section className="hero hero--v3" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Free, no sign-up to look around</span>
            <h1 id="hero-title" className="hero__title">
              {HEADLINE.map((w, i) => (
                <Fragment key={i}><span className={`word${i >= 4 ? " gradient-text" : ""}`} style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
              ))}
            </h1>
            <p className="hero__sub enter enter-3">Find apps worth trying, earn XP and badges for trying them, and make your passport your own.</p>
            <div className="hero__actions row enter enter-3">
              <Link href="/apps" className="btn btn--primary">Explore Arc <ArrowRight aria-hidden="true" /></Link>
              <Link href="/quests" className="btn btn--secondary">Start a Quest</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="osec" aria-labelledby="popular-title">
          <Head id="popular-title" kicker="Quests" title="Popular right now" action={<MoreLink href="/quests">All quests</MoreLink>} />
          <PopularQuests />
        </section>

        <section className="osec" aria-labelledby="rewards-title">
          <Head id="rewards-title" kicker="Rewards" title="What you can earn" />
          <RewardKinds />
        </section>

        <section className="osec" aria-labelledby="explore-title">
          <Head id="explore-title" kicker="Explore" title="Explore Arc" action={<MoreLink href="/apps">Open Explore</MoreLink>} />
          <ul className="xtiles">
            {explore.map((x) => (
              <li key={x.name}><Link href={x.href} className="xtile"><span className="xtile__name">{x.name}</span><span className="xtile__count">{x.count}</span></Link></li>
            ))}
          </ul>
        </section>

        <section className="osec" aria-labelledby="new-title">
          <Head id="new-title" kicker="What's New" title="What's new on Arc" action={<MoreLink href="/radar">See what&apos;s new</MoreLink>} />
          <HomeNews />
        </section>

        <section className="osec" aria-labelledby="passport-title">
          <Head id="passport-title" kicker="Passport" title="Your Passport" action={<MoreLink href="/passport">View Passport</MoreLink>} />
          <div className="hpass-wrap">
            <PassCard />
            <HomePassport />
          </div>
        </section>

        <section className="osec" id="how-arc" aria-labelledby="how-title">
          <Head
            id="how-title"
            kicker="New to Arc?"
            title="How Arc works"
            action={<a className="more-link" href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Learn more<span className="more-link__arrow" aria-hidden="true"><ArrowUpRight /></span></a>}
          />
          <ul className="pillars pillars--plain pillars--3">
            {HOW.map((p) => (
              <li key={p.title} className="pillar">
                <span className="pillar__title">{p.title}</span>
                <span className="pillar__body">{p.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
