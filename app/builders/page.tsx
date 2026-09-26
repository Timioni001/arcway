import type { Metadata } from "next";
import { BuilderCard, GetListedCard } from "../../components/Builders";
import { buildersFrom } from "../../lib/builders";

export const metadata: Metadata = { title: "Builders" };

export default function BuildersPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Builders</div>
      <h1 className="h1" style={{ marginTop: 10 }}>The teams behind the apps</h1>
      <p className="lead" style={{ margin: "12px 0 32px" }}>Everyone with an app listed on Arcway.</p>
      <ul className="cards">
        {buildersFrom().map((b) => <li key={b.id}><BuilderCard builder={b} /></li>)}
        <li><GetListedCard /></li>
      </ul>
    </div>
  );
}
