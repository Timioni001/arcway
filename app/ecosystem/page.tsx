import { Blocks, LayoutGrid, Network } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EcosystemMap } from "../../components/EcosystemMap";
import { CategoryGrid } from "../../components/HomeSections";
import { PanelHead, SourceTag } from "../../components/IntelBits";
import { ProtocolDirectory } from "../../components/IntelPages";
import { PageHead } from "../../components/PageHead";
import { APPS } from "../../lib/registry";

export const metadata: Metadata = { title: "Ecosystem", description: "Protocols, categories, builders and how they connect on Arc." };

export default function EcosystemPage() {
  return (
    <div className="container page">
      <PageHead icon={Network} kicker="Ecosystem" title="The Arc ecosystem" lead="Protocols, categories and builders on Arc, and how they connect." />
      <section className="band" aria-labelledby="map-title">
        <PanelHead icon={Network} title="Ecosystem map" id="map-title"><SourceTag source="project" period="Listings" /></PanelHead>
        <EcosystemMap />
      </section>
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
