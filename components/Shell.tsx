import Link from "next/link";
import { ARC_DOCS_URL, BRIDGE_URL, CONTACT_URL, IS_MAINNET } from "../lib/config";
import { NAV_GROUPS, YOU_NAV } from "../lib/nav";
import { Logo } from "./Logo";
import { FooterProof } from "./PassportProof";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand" style={{ display: "grid", gap: 14, maxWidth: 320 }}>
            <Logo />
            <p className="small secondary">Arc ecosystem intelligence. Explore applications, activity, builders and signals across Arc.</p>
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
          {NAV_GROUPS.map((g, i) => (
            <nav key={g.label} aria-labelledby={`f-${i}`}>
              <h2 id={`f-${i}`}>{g.label}</h2>
              <ul>{g.items.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
            </nav>
          ))}
          <nav aria-labelledby="f-res">
            <h2 id="f-res">You &amp; resources</h2>
            <ul>
              {YOU_NAV.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              <li><Link href="/watchlist">Watchlist</Link></li>
              <li><a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Arc docs</a></li>
              <li><a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">{IS_MAINNET ? "Get USDC" : "Get test USDC"}</a></li>
              <li><a href="/digest/feed.xml">RSS feed</a></li>
            </ul>
          </nav>
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
