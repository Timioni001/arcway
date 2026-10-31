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
import { SITE_URL } from "../lib/site";
import { THEME_INIT_SCRIPT } from "../lib/theme";
import "./globals.css";
import "./components.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: "Arcway", type: "website" },
  twitter: { card: "summary_large_image" },
  title: { default: "Arcway · Find Arc apps, complete quests, earn rewards", template: "%s · Arcway" },
  description: "Discover the apps on Arc, complete quests onchain and build a Passport that proves what you've done."
};

export const viewport: Viewport = {
  viewportFit: "cover",
  // Light is the default whatever the device prefers; dark is an explicit choice in Settings.
  themeColor: "#EEF1F5"
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
