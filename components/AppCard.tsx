import { ArrowRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { NETWORK_NAME } from "../lib/config";
import { STATUS_LABEL, isNew, isVerified, type ArcApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";
import { SaveButton } from "./SaveButton";
import { Forms } from "./Forms";

/** Kept for existing call sites: the app's mark. */
export function AppLogo({ app, size = "md" }: { app: ArcApp; size?: "md" | "lg" }) {
  return <AppMark app={app} size={size} />;
}

/** One status badge, plus Verified only when there's a verification basis. Text, not colour alone. */
export function AppBadges({ app, showNew = true }: { app: ArcApp; showNew?: boolean }) {
  return (
    <span className="row" style={{ gap: 6 }}>
      {app.sample ? (
        <span className="badge badge--warn">Sample</span>
      ) : (
        <span className={`badge ${app.status === "live" ? "badge--live" : ""}`}><span className="dot" />{app.status === "live" ? "Live" : STATUS_LABEL[app.status]}</span>
      )}
      {app.community && <span className="badge badge--community" title="Submitted by the community. Not reviewed by Arcway yet.">Community</span>}
      {isVerified(app) && <span className="badge"><ShieldCheck aria-hidden="true" />Verified</span>}
      {showNew && isNew(app) && <span className="badge badge--new">New</span>}
    </span>
  );
}

export function AppCard({ app }: { app: ArcApp }) {
  return (
    <div className="app-card-wrap">
    <Link href={`/apps/${app.slug}`} className="app-card card hover-lift spotlight">
      <div className="app-card__top">
        <AppLogo app={app} />
        <AppBadges app={app} />
      </div>
      <div>
        <h3 className="h4">{app.name}</h3>
        <p className="small secondary app-card__desc">{app.tagline}</p>
      </div>
      <div className="app-card__foot">
        <span className="app-card__meta"><span className="tag">{app.category}</span><span className="xs secondary">{NETWORK_NAME}</span></span>
        <span className="app-card__open">View app <ArrowUpRight aria-hidden="true" /></span>
      </div>
    </Link>
    <SaveButton appId={app.id} name={app.name} />
    </div>
  );
}

/** The visual anchor: a contained product visual on top (it owns its artwork), content below. */
export function FeaturedApp({ app }: { app: ArcApp }) {
  return (
    <Link href={`/apps/${app.slug}`} className="featured-card hover-lift" aria-labelledby={`featured-${app.id}`}>
      <div className="featured-visual">
        <Forms />
        <span className="featured-visual__mark"><AppLogo app={app} size="lg" /></span>
        <span className="featured-visual__label">Featured</span>
      </div>
      <div className="featured-content">
        <div className="featured-content__head">
          <div style={{ minWidth: 0 }}>
            <h3 id={`featured-${app.id}`} className="h3">{app.name}</h3>
            <p className="secondary">{app.tagline}</p>
          </div>
        </div>
        <div className="featured-content__foot">
          <span className="row" style={{ gap: 8 }}><AppBadges app={app} /><span className="tag">{app.category}</span></span>
          <span className="btn btn--primary btn--sm">View app <ArrowRight aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}
