import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { NetworkNotice } from "../components/NetworkNotice";
import { Providers } from "../components/Providers";
import { Footer, MobileNav, Navbar } from "../components/Shell";
import "./globals.css";
import "./components.css";

export const metadata: Metadata = {
  title: { default: "Arcway — Discover what's being built on Arc", template: "%s · Arcway" },
  description: "A discovery layer for apps, quests and onchain experiences built on Arc."
};

export const viewport: Viewport = {
  themeColor: "#050A18",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link visually-hidden">Skip to content</a>
        <Providers>
          <Navbar />
          <NetworkNotice />
          <main id="main">{children}</main>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
