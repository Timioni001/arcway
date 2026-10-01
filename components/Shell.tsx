import { ArrowRight, ChevronDown, Rss } from "lucide-react";
import Link from "next/link";
import { FooterFold } from "./FooterFold";
import { ARC_DOCS_URL, BRIDGE_URL, CONTACT_URL, IS_MAINNET, NETWORK_NAME, X_URL } from "../lib/config";
import { CardArt, CardChip } from "./CardArt";
import { MORE_NAV, PRIMARY_NAV, SECTION_VIEWS, YOU_NAV, type NavItem } from "../lib/nav";

const views = (href: string) => (SECTION_VIEWS[href] ?? []).filter((v) => v.blurb);
const FOOTER: { title: string; items: NavItem[] }[] = [
  { title: "Arcway", items: [...PRIMARY_NAV, ...views("/apps")] },
  { title: "Go deeper", items: MORE_NAV.filter((n) => ["/pulse", "/radar", "/signals", "/builders"].includes(n.href)) },
  { title: "Earn and build", items: [...views("/quests"), ...MORE_NAV.filter((n) => n.href === "/submit"), ...views("/submit")] }
];
import { Logo } from "./Logo";
import { FooterProof } from "./PassportProof";

/** The X mark, drawn inline (lucide has no current X logo). */
function XMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58l11.1 14.47Z" /></svg>;
}

function GhMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>;
}

/**
 * The footer closes every page the same way: one last invitation (the hero's promise, with the
 * cards you can earn), the full map of the site, live proof that it runs on Arc, and the name.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <section className="fcta" aria-labelledby="fcta-title">
          <div className="fcta__copy">
            <span className="fcta__kicker">arcway.world</span>
            <h2 id="fcta-title" className="fcta__title"><span>Explore Arc.</span> <span>Complete quests.</span> <span className="fcta__blue">Build your Passport.</span></h2>
            <div className="fcta__actions">
              <Link href="/quests" className="btn btn--on-dark">Start a quest<ArrowRight aria-hidden="true" /></Link>
              <Link href="/apps" className="btn btn--ghost-dark">Explore apps</Link>
            </div>
          </div>
          <div className="fcta__cards" aria-hidden="true">
            {["midnight", "aurora", "arc"].map((t, i) => (
              <span key={t} className="fcta__card" style={{ "--i": i } as React.CSSProperties}>
                <span className="pass pass--mini" data-theme={t}><CardArt theme={t} /><CardChip /></span>
              </span>
            ))}
          </div>
        </section>

        <div className="footer__inner">
          <div className="footer__brand">
            <Logo />
            <p className="small secondary">Explore Arc, complete quests and build your passport. Deeper activity data when you want it.</p>
            <FooterProof />
            <div className="footer__social">
              {X_URL && <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Arcway on X" className="footer__icon"><XMark /></a>}
              <a href="https://github.com/Timioni001/arcway" target="_blank" rel="noopener noreferrer" aria-label="Arcway on GitHub" className="footer__icon"><GhMark /></a>
              <a href="/digest/feed.xml" aria-label="RSS feed" className="footer__icon"><Rss aria-hidden="true" /></a>
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
            </ul>
            </details>
          </nav>
          <FooterFold />
        </div>

        <div className="footer__base">
          <div className="footer__built">
            <span className="footer__net"><span className="live-dot" aria-hidden="true" />{NETWORK_NAME}</span>
            <span className="built-on">
              <span className="label">Built on</span>
              {/* Official Arc marks, unmodified. See public/brand/arc/NOTICE.md */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="for-light" src="/brand/arc/arc-logo-dark.svg" alt="Arc" width={146} height={50} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="for-dark" src="/brand/arc/arc-logo-light.svg" alt="Arc" width={146} height={50} />
            </span>
          </div>
          <span>© {new Date().getFullYear()} Arcway · Independent, not affiliated with Circle.</span>
          <nav aria-label="Legal" className="footer__legal">
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Contact</a>
          </nav>
        </div>
      </div>
      <div className="footer__word" aria-hidden="true">arcway</div>
    </footer>
  );
}
