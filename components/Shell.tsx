import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { FooterFold } from "./FooterFold";
import { ARC_DOCS_URL, BRIDGE_URL, CONTACT_URL, IS_MAINNET } from "../lib/config";
import { MORE_NAV, PRIMARY_NAV, SECTION_VIEWS, YOU_NAV, type NavItem } from "../lib/nav";

const views = (href: string) => (SECTION_VIEWS[href] ?? []).filter((v) => v.blurb);
const FOOTER: { title: string; items: NavItem[] }[] = [
  { title: "Arcway", items: [...PRIMARY_NAV, ...views("/apps")] },
  { title: "Go deeper", items: MORE_NAV.filter((n) => ["/pulse", "/radar", "/signals", "/builders"].includes(n.href)) },
  { title: "Earn and build", items: [...views("/quests"), ...MORE_NAV.filter((n) => n.href === "/submit"), ...views("/submit")] }
];
import { Logo } from "./Logo";
import { FooterProof } from "./PassportProof";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand" style={{ display: "grid", gap: 14, maxWidth: 320 }}>
            <Logo />
            <p className="small secondary">Explore Arc, complete quests and build your passport. Deeper activity data when you want it.</p>
            <FooterProof />
          <div className="built-on">
              <span className="label">Built on</span>
              {/* Official Arc marks, unmodified. See public/brand/arc/NOTICE.md */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="for-light" src="/brand/arc/arc-logo-dark.svg" alt="Arc" width={146} height={50} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="for-dark" src="/brand/arc/arc-logo-light.svg" alt="Arc" width={146} height={50} />
            </div>
          </div>
          {FOOTER.map((g, i) => (
            <nav key={g.title} aria-labelledby={`f-${i}`}>
              <details className="fgroup" open>
                <summary><h2 id={`f-${i}`}>{g.title}</h2><ChevronDown className="fgroup__chev" aria-hidden="true" /></summary>
                <ul>{g.items.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
              </details>
            </nav>
          ))}
          <nav aria-labelledby="f-res">
            <details className="fgroup" open>
            <summary><h2 id="f-res">You &amp; resources</h2><ChevronDown className="fgroup__chev" aria-hidden="true" /></summary>
            <ul>
              {YOU_NAV.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              <li><Link href="/watchlist">Watchlist</Link></li>
              <li><a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Arc docs</a></li>
              <li><a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">{IS_MAINNET ? "Get USDC" : "Get test USDC"}</a></li>
              <li><a href="/digest/feed.xml">RSS feed</a></li>
            </ul>
            </details>
          </nav>
          <FooterFold />
        </div>
        <div className="footer__base">
          <span>© {new Date().getFullYear()} Arcway · Independent, not affiliated with Circle.</span>
          <nav aria-label="Legal" className="footer__legal">
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
