import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { NetworkNotice } from "../components/NetworkNotice";
import { Providers } from "../components/Providers";
import { BottomBar, MobileTop, Rail, SectionViews, Topbar } from "../components/AppShell";
import { SearchPalette } from "../components/SearchPalette";
import { Footer } from "../components/Shell";
import { AmbientPause } from "../components/AmbientPause";
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
  title: { default: "Arcway — Understand what's happening on Arc", template: "%s · Arcway" },
  description: "Arc ecosystem intelligence: explore applications, live activity, builders and verified signals across Arc."
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1F5" },
    { media: "(prefers-color-scheme: dark)", color: "#07152B" }
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
          <div className="os">
            <Rail />
            <div className="workspace">
              <Topbar />
              <MobileTop />
              <NetworkNotice />
              <SectionViews />
              <main id="main">{children}</main>
              <Footer />
            </div>
          </div>
          <BottomBar />
          <SearchPalette />
          <SpotlightTracker />
          <AmbientPause />
          <Celebrate />
        </Providers>
      </body>
    </html>
  );
}
