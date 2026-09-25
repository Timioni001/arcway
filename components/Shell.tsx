'use client';

import { Compass, IdCard, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NETWORK_NAME } from "../lib/config";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";

const LINKS = [
  { href: "/apps", label: "Discover", icon: Compass },
  { href: "/quests", label: "Quests", icon: Target },
  { href: "/passport", label: "Passport", icon: IdCard }
] as const;

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const isActive = useActive();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled}>
      <div className="container nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Main">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="nav__link" aria-current={isActive(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav__utils">
          <span className="pill nav__network"><span className="dot" style={{ background: "var(--aw-electric)" }} />{NETWORK_NAME}</span>
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
      {LINKS.map(({ href, label, icon: Icon }) => (
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
      <div className="container footer__inner">
        <div className="stack-3">
          <Logo />
          <p className="body-sm muted" style={{ maxWidth: 380 }}>
            An independent discovery layer for apps, quests and onchain experiences on Arc. Not affiliated with Circle.
          </p>
        </div>
        <div className="built-on">
          <span className="label">Built on</span>
          {/* Official Arc mark, unmodified. See public/brand/arc/NOTICE.md */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arc/arc-logo-light.svg" alt="Arc" width={146} height={50} />
        </div>
      </div>
    </footer>
  );
}
