import { ArrowRight, ArrowUpRight, Blocks, Check, Code2, Coins, Globe, IdCard, Wallet, type LucideIcon } from "lucide-react";
import { CategoryTile } from "../components/CategoryIcon";
import { Reveal } from "../components/Reveal";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { HeroJourney } from "../components/HeroJourney";
import { HomeLeaderboard, HomeNews, PopularQuests } from "../components/HomePublic";
import { MoreLink } from "../components/Onboarding";
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

/** One job per line; the last one, the reason to come back, in blue. */
const HEADLINE = [["Explore", "Arc."], ["Complete", "quests."], ["Build", "your", "Passport."]];

const HOW: { title: string; body: string; icon: LucideIcon }[] = [
  { title: "Money on the internet", body: "Arc is an open network where apps move US dollars (USDC) as easily as sending a message.", icon: Globe },
  { title: "Fees in dollars", body: "You pay small network fees in USDC, not in a separate token.", icon: Wallet },
  { title: "Your wallet, your record", body: "A wallet is your account on Arc. What you do there is public and yours.", icon: IdCard }
];

export default function Home() {
  const live = APPS.filter((a) => a.active && !a.sample);
  const counts = categoryCounts(live);
  const builders = buildersFrom();
  const cat = (c: Category) => `/ecosystem?category=${encodeURIComponent(c)}#protocols`;
  const explore: { name: string; href: string; count: string; mark: ReactNode; hue: number }[] = [
    { name: "Payments", href: cat("Payments"), count: `${counts.Payments} apps`, mark: <CategoryTile category="Payments" />, hue: 199 },
    { name: "Trading", href: cat("Trading"), count: `${counts.Trading} apps`, mark: <CategoryTile category="Trading" />, hue: 222 },
    { name: "Lending", href: cat("Lend & Earn"), count: `${counts["Lend & Earn"]} apps`, mark: <CategoryTile category="Lend & Earn" />, hue: 168 },
    { name: "Assets", href: "/assets", count: "Tokens on Arc", mark: <span className="xtile__icon" aria-hidden="true"><Coins /></span>, hue: 38 },
    { name: "Apps", href: "/apps", count: `${live.length} apps`, mark: <span className="xtile__icon" aria-hidden="true"><Blocks /></span>, hue: 210 },
    { name: "Builders", href: "/builders", count: `${builders.length} teams`, mark: <span className="xtile__icon" aria-hidden="true"><Code2 /></span>, hue: 260 }
  ];

  return (
    <div className="page page--home">
      <section className="hero hero--v3 hero--journey" aria-labelledby="hero-title">
        <div className="container hero__split">
          <div className="hero__copy">
            <span className="eyebrow enter"><b>Arc</b>Free, no sign-up to look around</span>
            <h1 id="hero-title" className="hero__title hero__title--lines">
              {HEADLINE.map((line, l) => (
                <Fragment key={line.join(" ")}>
                  <span className={`hero__line${l === HEADLINE.length - 1 ? " hero__line--accent" : ""}`}>
                    {line.map((w, i) => (
                      <Fragment key={w}><span className="word" style={{ "--i": l * 2 + i } as React.CSSProperties}>{w}</span>{i < line.length - 1 ? " " : ""}</Fragment>
                    ))}
                  </span>{l < HEADLINE.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </h1>
            <p className="hero__sub enter enter-3">Find apps worth trying, earn XP and badges for trying them, and make your passport your own.</p>
            <div className="hero__actions row enter enter-3">
              <Link href="/apps" className="btn btn--primary">Explore Arc <ArrowRight aria-hidden="true" /></Link>
              <Link href="/quests" className="btn btn--secondary">Start a Quest</Link>
            </div>
          </div>
          <HeroJourney />
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
            {explore.map((x, i) => (
              <Reveal as="li" key={x.name} delay={i * 50}>
                <Link href={x.href} className="xtile" style={{ "--xh": x.hue } as React.CSSProperties}>
                  {x.mark}
                  <span className="xtile__text"><span className="xtile__name">{x.name}</span><span className="xtile__count">{x.count}</span></span>
                  <span className="xtile__go" aria-hidden="true"><ArrowUpRight /></span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="osec" aria-labelledby="new-title">
          <Head id="new-title" kicker="What's New" title="What's new on Arc" action={<MoreLink href="/radar">See what&apos;s new</MoreLink>} />
          <HomeNews />
        </section>

        <section className="osec" aria-labelledby="lb-home-title">
          <Head id="lb-home-title" kicker="Leaderboard" title="Top explorers" action={<MoreLink href="/leaderboard">Full leaderboard</MoreLink>} />
          <HomeLeaderboard />
        </section>

        <section className="osec" aria-labelledby="build-title">
          <div className="hbuild">
            <div className="hbuild__copy">
              <div className="ohead__kicker">For Builders</div>
              <h2 id="build-title" className="ohead__title">Built something on Arc?</h2>
              <p className="ohead__lede">Get your app listed so people can find it, try it in quests and follow its activity. Then add a live badge to your site, or fund a campaign.</p>
              <div className="hbuild__actions">
                <Link href="/submit" className="btn btn--primary">Submit your app <ArrowRight aria-hidden="true" /></Link>
                <Link href="/launch" className="btn btn--secondary">Launch a campaign</Link>
              </div>
              <ol className="hbuild__steps">
                <li><b>1</b>Share your app and its contracts</li>
                <li><b>2</b>Arcway checks them live on Arc</li>
                <li><b>3</b>Get listed with a badge</li>
              </ol>
            </div>
            <div className="hbuild__preview" aria-hidden="true">
              <div className="hbuild__window">
                <span className="hbuild__dots"><i /><i /><i /></span>
                <div className="hbuild__listing">
                  <span className="hbuild__logo" />
                  <span className="hbuild__lines"><i /><i /></span>
                  <span className="badge badge--live"><span className="dot" />Live</span>
                </div>
                <div className="hbuild__checks">
                  <span><Check />Contract found on Arc</span>
                  <span><Check />Source verified</span>
                  <span><Check />Listed on Arcway</span>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hbuild__badge" src="/api/badge/uniswap" alt="" width={180} height={40} />
            </div>
          </div>
        </section>

        <section className="osec" id="how-arc" aria-labelledby="how-title">
          <Head
            id="how-title"
            kicker="New to Arc?"
            title="How Arc works"
            action={<a className="more-link" href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Learn more<span className="more-link__arrow" aria-hidden="true"><ArrowUpRight /></span></a>}
          />
          <ol className="hsteps swipe">
            {HOW.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal as="li" key={p.title} delay={i * 90} className="hstep">
                  <span className="hstep__num mono" aria-hidden="true">0{i + 1}</span>
                  <span className="hstep__icon" aria-hidden="true"><Icon /></span>
                  <span className="hstep__title">{p.title}</span>
                  <span className="hstep__body">{p.body}</span>
                </Reveal>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
