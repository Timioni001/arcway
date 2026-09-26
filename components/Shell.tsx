'use client';

import { Compass, IdCard, LayoutDashboard, Target, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ARC_DOCS_URL, BRIDGE_URL, CONTACT_URL, IS_MAINNET, NETWORK_NAME, SUBMIT_APP_URL } from "../lib/config";
import { Logo } from "./Logo";
import { SearchPalette } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "./WalletButton";

const LINKS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/apps", label: "Discover", icon: Compass },
  { href: "/quests", label: "Quests", icon: Target },
  { href: "/builders", label: "Builders", icon: Users },
  { href: "/passport", label: "Passport", icon: IdCard }
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const isActive = useActive();
  return (
    <header className="header">
      <div className="container header__inner">
        <Logo />
        <nav className="header__nav" aria-label="Main">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="header__link" aria-current={isActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header__utils">
          <SearchPalette />
          <span className="net"><i aria-hidden="true" />{NETWORK_NAME}</span>
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}

export function MobileNav() {
  const isActive = useActive();
  return (
    <nav className="mobile-nav" aria-label="Main">
      {LINKS.filter((l) => l.href !== "/builders").map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
          <Icon aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <div className="footer__brand" style={{ display: "grid", gap: 14, maxWidth: 320 }}>
            <Logo />
            <p className="small secondary">Find apps worth trying on Arc, complete quests and build your passport.</p>
          </div>
          <nav aria-labelledby="f-explore">
            <h2 id="f-explore">Explore</h2>
            <ul>
              {LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-labelledby="f-res">
            <h2 id="f-res">Resources</h2>
            <ul>
              <li><a href={ARC_DOCS_URL} target="_blank" rel="noopener noreferrer">Arc docs</a></li>
              <li><a href={BRIDGE_URL} target="_blank" rel="noopener noreferrer">{IS_MAINNET ? "Get USDC" : "Get test USDC"}</a></li>
              <li><a href={SUBMIT_APP_URL} target="_blank" rel="noopener noreferrer">Submit an app</a></li>
            </ul>
          </nav>
          <div className="built-on" style={{ justifySelf: "end" }}>
            <span className="label">Built on</span>
            {/* Official Arc marks, unmodified. See public/brand/arc/NOTICE.md */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="for-light" src="/brand/arc/arc-logo-dark.svg" alt="Arc" width={146} height={50} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="for-dark" src="/brand/arc/arc-logo-light.svg" alt="Arc" width={146} height={50} />
          </div>
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
