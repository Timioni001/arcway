import Link from "next/link";
import { APPS } from "../lib/registry";
import { AppMark } from "./CategoryIcon";

/** Endless strip of live apps. Pauses on hover/focus; static with reduced motion. */
export function LiveMarquee() {
  const apps = APPS.filter((a) => a.active && !a.sample);
  const row = (hidden: boolean) =>
    apps.map((app) => (
      <li key={`${hidden ? "b" : "a"}-${app.id}`} aria-hidden={hidden || undefined}>
        <Link href={`/apps/${app.slug}`} className="marquee__item" tabIndex={hidden ? -1 : undefined}>
          <AppMark app={app} size="sm" />
          <span>{app.name}</span>
        </Link>
      </li>
    ));
  return (
    <section className="marquee" aria-label="Apps live on Arc">
      <div className="container marquee__head">
        <span className="live-dot" aria-hidden="true" />
        <span className="label">Live on Arc · {apps.length} apps</span>
      </div>
      <div className="marquee__viewport">
        <ul className="marquee__track">
          {row(false)}
          {row(true)}
        </ul>
      </div>
    </section>
  );
}
