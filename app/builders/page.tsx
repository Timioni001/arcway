import type { Metadata } from "next";
import { BuilderCard, GetListedCard } from "../../components/Builders";
import { buildersFrom } from "../../lib/builders";

export const metadata: Metadata = { title: "Builders" };

export default function BuildersPage() {
  return (
    <div className="container page">
      <h1 className="h1">Builders</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Teams shipping listed apps on Arc.</p>
      <ul className="cards">
        {buildersFrom().map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}
        <li><GetListedCard /></li>
      </ul>
    </div>
  );
}
