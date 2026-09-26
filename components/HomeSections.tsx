import { ArrowRight, ArrowUpRight, Compass, MousePointerClick, Trophy } from "lucide-react";
import Link from "next/link";
import { categoryCounts, CATEGORIES, type ArcApp } from "../lib/registry";
import { AppBadges, AppLogo } from "./AppCard";
import { CATEGORY_BLURB, CategoryTile } from "./CategoryIcon";
import { Forms } from "./Forms";
import { Reveal } from "./Reveal";

export function CategoryGrid({ apps }: { apps: ArcApp[] }) {
  const counts = categoryCounts(apps.filter((a) => !a.sample));
  return (
    <ul className="cats">
      {CATEGORIES.map((c, i) => (
        <Reveal as="li" key={c} delay={(i % 3) * 60}>
          <Link href={`/apps?category=${encodeURIComponent(c)}`} className="cat">
            <CategoryTile category={c} />
            <span style={{ minWidth: 0 }}>
              <span className="cat__name">{c}</span>
              <span className="cat__count" style={{ display: "block" }}>
                {counts[c] ? `${counts[c]} ${counts[c] === 1 ? "app" : "apps"}` : CATEGORY_BLURB[c]}
              </span>
            </span>
            <ArrowRight className="cat__arrow" aria-hidden="true" />
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

const STEPS = [
  { icon: Compass, title: "Find an app", body: "Browse by what you want to do: pay, trade, save or build." },
  { icon: MousePointerClick, title: "Try it", body: "Open the app and complete one simple action." },
  { icon: Trophy, title: "Earn XP", body: "Claim XP and badges on your Arcway passport. Free." }
];

export function HowItWorks() {
  return (
    <ol className="how">
      {STEPS.map((s, i) => (
        <Reveal as="li" key={s.title} className="how__step" delay={i * 80}>
          <span className="how__num">0{i + 1}</span>
          <span className="tile tile--lg" data-shade={i + 1}><s.icon aria-hidden="true" /></span>
          <h3 className="h4">{s.title}</h3>
          <p className="small secondary">{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export function AppShowcase({ featured, others }: { featured?: ArcApp; others: ArcApp[] }) {
  return (
    <div className="bento">
      {featured && (
        <Reveal className="bento__cell">
          <Link href={`/apps/${featured.slug}`} className="bento__feature hover-lift" aria-labelledby={`feat-${featured.id}`}>
            <div className="bento__art">
              <Forms />
              <AppLogo app={featured} size="lg" />
            </div>
            <div className="bento__body">
              <div className="row between">
                <span className="label" style={{ color: "var(--link)" }}>Featured</span>
                <AppBadges app={featured} />
              </div>
              <h3 id={`feat-${featured.id}`} className="h3">{featured.name}</h3>
              <p className="secondary">{featured.tagline}</p>
              <span className="link" style={{ marginTop: 4 }}>View app <ArrowRight aria-hidden="true" /></span>
            </div>
          </Link>
        </Reveal>
      )}
      <ul className="bento__list">
        {others.map((app, i) => (
          <Reveal as="li" key={app.id} delay={i * 70}>
            <Link href={`/apps/${app.slug}`} className="row-card">
              <AppLogo app={app} />
              <span style={{ minWidth: 0 }}>
                <span className="h4" style={{ display: "block", fontSize: 16 }}>{app.name}</span>
                <span className="xs secondary" style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.tagline}</span>
                <span className="row-card__meta"><AppBadges app={app} /><span className="xs secondary">{app.category}</span></span>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
