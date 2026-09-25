'use client';

import { Compass, IdCard, Target, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NETWORK_NAME } from "../lib/config";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { WalletButton } from "./WalletButton";

const LINKS = [
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
        <div className="stack" style={{ ["--gap" as string]: "12px" }}>
          <Logo />
          <p className="small secondary">Independent. Not affiliated with Circle.</p>
        </div>
        <div className="built-on">
          <span className="label">Built on</span>
          {/* Official Arc marks, unmodified. See public/brand/arc/NOTICE.md */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="for-light" src="/brand/arc/arc-logo-dark.svg" alt="Arc" width={146} height={50} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="for-dark" src="/brand/arc/arc-logo-light.svg" alt="Arc" width={146} height={50} />
        </div>
      </div>
    </footer>
  );
}
