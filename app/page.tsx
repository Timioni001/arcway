import { ArrowRight, ArrowUpRight, Code2, Network, Target } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Campaign } from "../components/Campaign";
import { AppMark } from "../components/CategoryIcon";
import { EcosystemMap } from "../components/EcosystemMap";
import { FeaturedProtocol, LiveNow, PulsePanel, RadarPanel, SignalsPanel, SnapshotGrid } from "../components/HomeIntel";
import { PanelHead, SourceTag } from "../components/IntelBits";
import { Reveal } from "../components/Reveal";
import { builderMark, buildersFrom } from "../lib/builders";
import { SUBMIT_APP_URL } from "../lib/config";
import { APPS, appContracts, discoverApps } from "../lib/registry";

export default function Home() {
  const featured = discoverApps(APPS).find((a) => a.featured);
  const builders = buildersFrom().slice(0, 6);
  const words = ["Understand", "what’s", "happening", "on"];

  return (
    <div className="container page page--home">
      <section className="ihero" aria-labelledby="hero-title">
        <div className="ihero__copy">
          <span className="eyebrow enter"><b>Arc</b>Ecosystem intelligence</span>
          <h1 id="hero-title" className="ihero__title">
            {words.map((w, i) => (
              <Fragment key={w}><span className="word" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</Fragment>
            ))}
            <span className="word gradient-text" style={{ "--i": words.length } as React.CSSProperties}>Arc.</span>
          </h1>
          <p className="ihero__sub enter enter-3">Explore applications, activity, builders and emerging signals across the Arc ecosystem.</p>
          <div className="row enter enter-3" style={{ marginTop: 28, gap: 10 }}>
            <Link href="/ecosystem" className="btn btn--primary">Explore ecosystem <ArrowRight aria-hidden="true" /></Link>
            <Link href="/pulse" className="btn btn--secondary">View live activity</Link>
          </div>
          <p className="ihero__trust enter enter-3">
            Every number shows its source and period. <Link href="/settings#data" className="link">How we measure</Link>
          </p>
        </div>
        <div className="ihero__live enter enter-2"><LiveNow /></div>
      </section>

      <section className="band" aria-labelledby="snapshot-title">
        <SnapshotGrid />
      </section>

      <section className="band" aria-labelledby="map-title">
        <PanelHead icon={Network} title="Ecosystem map" id="map-title">
          <Link href="/ecosystem" className="link small">Open ecosystem <ArrowRight aria-hidden="true" /></Link>
        </PanelHead>
        <Reveal><EcosystemMap compact /></Reveal>
      </section>

      <div className="split">
        <section className="panel" aria-labelledby="pulse-title"><PulsePanel /></section>
        <section className="panel" aria-labelledby="radar-title"><RadarPanel /></section>
      </div>

      {featured && (
        <section className="band" aria-label="Featured protocol intelligence">
          <FeaturedProtocol app={featured} />
        </section>
      )}

      <div className="split split--wide-left">
        <section className="panel" aria-labelledby="signals-title"><SignalsPanel /></section>
        <section className="panel" aria-labelledby="builders-title">
          <PanelHead icon={Code2} title="Builder activity" id="builders-title">
            <SourceTag source="project" period="Registry" />
          </PanelHead>
          <ul className="brows">
            {builders.map((b) => {
              const contracts = b.apps.reduce((s, a) => s + appContracts(a).length, 0);
              return (
                <li key={b.id}>
                  <Link href={`/builders/${b.id}`} className="brow">
                    <AppMark app={builderMark(b)} size="sm" />
                    <span className="brow__main">
                      <span className="brow__name">{b.name}</span>
                      <span className="xs secondary">{b.apps.map((a) => a.name).join(", ")}</span>
                    </span>
                    <span className="brow__stat mono xs">{contracts ? `${contracts} contract${contracts === 1 ? "" : "s"}` : `${b.apps.length} app${b.apps.length === 1 ? "" : "s"}`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/builders" className="link small panel__more">All builders <ArrowRight aria-hidden="true" /></Link>
        </section>
      </div>

      <section className="band" aria-labelledby="quests-title">
        <PanelHead icon={Target} title="Quests" id="quests-title">
          <Link href="/quests" className="link small">All quests <ArrowRight aria-hidden="true" /></Link>
        </PanelHead>
        <Reveal><Campaign /></Reveal>
      </section>

      <section className="closing" aria-labelledby="build-title">
        <div>
          <h2 id="build-title" className="h3">Building on Arc?</h2>
          <p className="secondary" style={{ marginTop: 6 }}>List your protocol so people can find it, follow it and see its activity.</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <a href={SUBMIT_APP_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
            Get listed <ArrowUpRight aria-hidden="true" /><span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <Link href="/builders" className="btn btn--ghost">Explore builders <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
