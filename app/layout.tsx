import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { NetworkNotice } from "../components/NetworkNotice";
import { Providers } from "../components/Providers";
import { Footer, Header, MobileNav } from "../components/Shell";
import { SpotlightTracker } from "../components/SpotlightTracker";
import { Celebrate } from "../components/Celebrate";
import { THEME_INIT_SCRIPT } from "../lib/theme";
import "./globals.css";
import "./components.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { siteName: "Arcway", type: "website" },
  twitter: { card: "summary_large_image" },
  title: { default: "Arcway — Discover what's being built on Arc", template: "%s · Arcway" },
  description: "Explore apps, quests and builders on Arc."
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#080D3D" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link visually-hidden">Skip to content</a>
        <Providers>
          <Header />
          <NetworkNotice />
          <main id="main">{children}</main>
          <Footer />
          <MobileNav />
          <SpotlightTracker />
          <Celebrate />
        </Providers>
      </body>
    </html>
  );
}
