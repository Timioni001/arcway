import { ArrowRight, Compass, MousePointerClick, Trophy } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { categoryCounts, CATEGORIES, type ArcApp } from "../lib/registry";
import { AppCard } from "./AppCard";
import { CATEGORY_META, CategoryTile } from "./CategoryIcon";
import { Reveal } from "./Reveal";

export function CategoryGrid({ apps }: { apps: ArcApp[] }) {
  const counts = categoryCounts(apps.filter((a) => !a.sample));
  return (
    <ul className="cats">
      {CATEGORIES.map((c, i) => (
        <Reveal as="li" key={c} delay={(i % 4) * 60}>
          <Link href={`/apps?category=${encodeURIComponent(c)}`} className="cat spotlight" style={{ "--cat": CATEGORY_META[c].color } as CSSProperties}>
            <span className="row between">
              <CategoryTile category={c} />
              <span className="cat__count mono">{counts[c] || "Soon"}</span>
            </span>
            <span className="cat__name">{c}</span>
            <span className="cat__blurb">{CATEGORY_META[c].blurb}</span>
            <ArrowRight className="cat__arrow" aria-hidden="true" />
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}

const STEPS = [
  { icon: Compass, title: "Discover", body: "Find applications and experiments built on Arc." },
  { icon: MousePointerClick, title: "Explore", body: "Open a project, understand what it does, and follow its links." },
  { icon: Trophy, title: "Build / Participate", body: "Use the application, complete quests, or explore the builder ecosystem." }
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

/** Live on Arc: real logos, real statuses. The count is the registry's own, never a made-up number. */
export function LiveOnArc({ apps }: { apps: ArcApp[] }) {
  return (
    <ul className="cards">
      {apps.map((app, i) => (
        <Reveal as="li" key={app.id} delay={(i % 3) * 70}><AppCard app={app} /></Reveal>
      ))}
    </ul>
  );
}
