import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { STATUS_LABEL, isVerified, type ArcApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { Forms } from "./Forms";

/** Kept for existing call sites: the app's mark. */
export function AppLogo({ app, size = "md" }: { app: ArcApp; size?: "md" | "lg" }) {
  return <AppMark app={app} size={size} />;
}

/** One status badge, plus Verified only when there's a verification basis. Text, not colour alone. */
export function AppBadges({ app }: { app: ArcApp }) {
  return (
    <span className="row" style={{ gap: 6 }}>
      {app.sample ? (
        <span className="badge badge--warn">Sample</span>
      ) : (
        <span className={`badge ${app.status === "live" ? "badge--live" : ""}`}><span className="dot" />{app.status === "live" ? "Live" : STATUS_LABEL[app.status]}</span>
      )}
      {isVerified(app) && <span className="badge"><ShieldCheck aria-hidden="true" />Verified</span>}
    </span>
  );
}

export function AppCard({ app }: { app: ArcApp }) {
  return (
    <Link href={`/apps/${app.slug}`} className="app-card card hover-lift">
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <AppLogo app={app} />
        <AppBadges app={app} />
      </div>
      <div>
        <h3 className="h4">{app.name}</h3>
        <p className="small secondary" style={{ marginTop: 6 }}>{app.tagline}</p>
      </div>
      <div className="app-card__foot">
        <span className="tag">{app.category}</span>
        <span className="app-card__open">View <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

export function FeaturedApp({ app }: { app: ArcApp }) {
  return (
    <Link href={`/apps/${app.slug}`} className="featured hover-lift" aria-labelledby={`featured-${app.id}`}>
      <div className="featured__body">
        <span className="label" style={{ color: "var(--link)" }}>Featured</span>
        <h3 id={`featured-${app.id}`} className="h2">{app.name}</h3>
        <p className="lead">{app.tagline}</p>
        <div className="row" style={{ marginTop: 6 }}>
          <AppBadges app={app} />
          <span className="tag">{app.category}</span>
        </div>
        <span className="app-card__open" style={{ marginTop: 10 }}>View app <ArrowRight aria-hidden="true" /></span>
      </div>
      <div className="featured__art"><Forms /></div>
    </Link>
  );
}
