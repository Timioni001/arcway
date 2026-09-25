import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { STATUS_LABEL, type ArcApp } from "../lib/registry";
import { HeroObject } from "./HeroObject";

export function AppLogo({ app, size = "md" }: { app: ArcApp; size?: "md" | "lg" }) {
  return (
    <span className={`app-logo${size === "lg" ? " app-logo--lg" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {app.logo ? <img src={app.logo} alt="" /> : <span>{app.name.charAt(0)}</span>}
    </span>
  );
}

/** Status, verification and sample labels. Colour is never the only signal: each has text. */
export function AppPills({ app }: { app: ArcApp }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {app.sample ? (
        <span className="pill pill--warn">Sample listing</span>
      ) : (
        <span className={`pill pill--${app.status}`}><span className="dot" />{STATUS_LABEL[app.status]}</span>
      )}
      {app.verified && (
        <span className="pill pill--verified"><ShieldCheck aria-hidden="true" />Verified</span>
      )}
    </div>
  );
}

export function AppCard({ app }: { app: ArcApp }) {
  return (
    <Link href={`/apps/${app.slug}`} className="app-card surface interactive">
      <div className="row row--between" style={{ alignItems: "flex-start" }}>
        <AppLogo app={app} />
        <span className="label">{app.category}</span>
      </div>
      <div className="stack-2">
        <h3 className="title">{app.name}</h3>
        <p className="body-sm muted">{app.tagline}</p>
      </div>
      <div className="app-card__foot">
        <AppPills app={app} />
        <ArrowUpRight className="app-card__arrow" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function FeaturedApp({ app }: { app: ArcApp }) {
  return (
    <Link href={`/apps/${app.slug}`} className="featured surface interactive" aria-labelledby={`featured-${app.id}`}>
      <div className="featured__cover">
        <HeroObject />
        <AppLogo app={app} size="lg" />
      </div>
      <div className="featured__body stack-3">
        <div className="row row--between">
          <span className="label" style={{ color: "var(--aw-signal)" }}>Featured</span>
          <span className="label">{app.category}</span>
        </div>
        <h3 id={`featured-${app.id}`} className="h2">{app.name}</h3>
        <p className="muted">{app.tagline}</p>
        <AppPills app={app} />
      </div>
    </Link>
  );
}

export function NewRail({ apps }: { apps: ArcApp[] }) {
  return (
    <div className="new-rail surface">
      <div className="label" style={{ padding: "24px 24px 16px" }}>New</div>
      {apps.map((app) => (
        <Link key={app.id} href={`/apps/${app.slug}`} className="new-rail__item">
          <AppLogo app={app} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{app.name}</div>
            <div className="body-sm muted" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.tagline}</div>
          </div>
          <span className="mono muted">{app.addedAt.slice(5).replace("-", "/")}</span>
        </Link>
      ))}
    </div>
  );
}
