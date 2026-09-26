import { Blocks, LayoutGrid, Network } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EcosystemMap } from "../../components/EcosystemMap";
import { CategoryGrid } from "../../components/HomeSections";
import { FeaturedProtocol } from "../../components/HomeIntel";
import { PanelHead, SourceTag } from "../../components/IntelBits";
import { ProtocolDirectory } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";
import { APPS, appContracts, discoverApps } from "../../lib/registry";

export const metadata: Metadata = { title: "Ecosystem", description: "Protocols, categories, builders and how they connect on Arc." };

export default function EcosystemPage() {
  // Only feature a protocol whose activity can actually be shown on this network.
  const featured = discoverApps(APPS).find((a) => a.featured && appContracts(a).length > 0);
  return (
    <div className="container page">
      <PageHead icon={Network} kicker="Ecosystem" title="The Arc ecosystem" lead="Protocols, categories and builders on Arc, and how they connect." />
      <section className="band" aria-labelledby="map-title">
        <PanelHead icon={Network} title="Ecosystem map" id="map-title"><SourceTag source="project" period="Listings" /></PanelHead>
        <EcosystemMap />
      </section>
      {featured && <section className="band" aria-label="Featured protocol"><FeaturedProtocol app={featured} /></section>}
      <section className="band" id="protocols" aria-labelledby="protocols-title">
        <PanelHead icon={Blocks} title="Protocols" id="protocols-title" />
        <Suspense><ProtocolDirectory /></Suspense>
      </section>
      <section className="band" aria-labelledby="cats-title">
        <PanelHead icon={LayoutGrid} title="Categories" id="cats-title" />
        <CategoryGrid apps={APPS} />
      </section>
    </div>
  );
}
