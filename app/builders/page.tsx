import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { BuilderCard, GetListedCard } from "../../components/Builders";
import { buildersFrom } from "../../lib/builders";

export const metadata: Metadata = { title: "Builders" };

export default function BuildersPage() {
  return (
    <div className="container page">
      <PageHead icon={Code2} kicker="Builders" title="Builders on Arc" lead="The teams behind Arc's protocols: their projects, published contracts and links. Follow a builder to keep them on your watchlist." />
      <ul className="cards" style={{ marginTop: 32 }}>
        {buildersFrom().map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}
        <li><GetListedCard /></li>
      </ul>
    </div>
  );
}
