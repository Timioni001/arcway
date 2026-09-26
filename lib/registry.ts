import type { Address } from "viem";
import { ARC_NETWORK, type ArcNetwork } from "./config";

/** Plain-language categories: what someone wants to do, not protocol jargon. */
export const CATEGORIES = [
  "Payments",
  "Trading",
  "Lend & Earn",
  "FX",
  "Bridges",
  "Wallets",
  "AI Agents",
  "Assets"
] as const;

export type Category = (typeof CATEGORIES)[number];
export type AppStatus = "live" | "beta" | "experimental";

export type Builder = {
  name: string;
  github?: string;
  x?: string;
};

export type ArcApp = {
  id: string;
  slug: string;
  name: string;
  /** One line: what it is. */
  tagline: string;
  /** Two or three sentences for the detail page. */
  description: string;
  category: Category;
  url?: string;
  /** Path under /public, e.g. /apps/uniswap.svg. Falls back to a monogram. */
  logo?: string;
  status: AppStatus;
  /** How the app uses Arc, in plain words. */
  features: string[];
  /**
   * Contracts per network, only from the team's own published source.
   * Transactions to these count for the "Explore an app" quest.
   */
  contracts?: Partial<Record<ArcNetwork, Address[]>>;
  /** Where the contracts above were checked. Required for "Verified". */
  verification?: { checkedAt: string; sourceUrl: string };
  featured?: boolean;
  /** ISO date the listing was added; drives "New". */
  addedAt: string;
  active: boolean;
  /** Placeholder entry (not a real app). */
  sample?: boolean;
  /** Answer to "what would I do here?". */
  firstAction: string;
  builder?: Builder;
};

const MAINNET_LAUNCH = "2026-09-16";

/**
 * Curated registry of apps live on Arc, from public launch announcements.
 * Never add a contract address that isn't published by the app team.
 */
export const APPS: ArcApp[] = [
  {
    id: "uniswap",
    slug: "uniswap",
    name: "Uniswap",
    tagline: "Swap tokens with deep liquidity.",
    description: "The largest decentralized exchange, live on Arc from day one with its latest pools and smart order routing.",
    category: "Trading",
    url: "https://app.uniswap.org",
    status: "live",
    features: ["Instant swaps", "Pay fees in USDC"],
    contracts: {
      mainnet: [
        "0x4fca4a51ab4f23a7447b3284fbd7d73289a89fb1", // Universal Router 2.1.1
        "0x8702463e73f74d0b6765aBceb314Ef07aCb92650", // Universal Router 2.1.2
        "0x53bf6b0684ec7ef91e1387da3d1a1769bc5a6f77", // SwapRouter02
        "0x39654a85a4c05127f5fd6ed22caec077a0fb1377", // v3 position manager
        "0x6049c9a0e26405c0985f9e3685c87d0ae917f82b" // v4 position manager
      ]
    },
    verification: { checkedAt: "2026-09-26", sourceUrl: "https://github.com/Uniswap/sdks/tree/main/sdks/universal-router-sdk" },
    featured: true,
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Swap a few USDC for EURC.",
    builder: { name: "Uniswap Labs", github: "https://github.com/Uniswap", x: "https://x.com/Uniswap" }
  },
  {
    id: "tower",
    slug: "tower-exchange",
    name: "Tower Exchange",
    tagline: "Arc-native stablecoin swaps at the best rate.",
    description: "Finds the best price across Arc's exchanges for USDC, EURC and cirBTC, with an assistant that explains your trades.",
    category: "Trading",
    url: "https://www.tower.exchange",
    status: "live",
    features: ["Best-price routing", "Built for Arc"],
    addedAt: "2026-09-17",
    active: true,
    firstAction: "Swap USDC to EURC and back.",
    builder: { name: "Tower", x: "https://x.com/TowerExchange" }
  },
  {
    id: "curve",
    slug: "curve",
    name: "Curve",
    tagline: "Low-slippage stablecoin swaps.",
    description: "An exchange designed for assets that should trade close to each other, like USDC and other stablecoins.",
    category: "Trading",
    url: "https://curve.finance",
    status: "live",
    features: ["Stablecoin pools", "Low slippage"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Make a small stablecoin swap.",
    builder: { name: "Curve", github: "https://github.com/curvefi" }
  },
  {
    id: "aave",
    slug: "aave",
    name: "Aave",
    tagline: "Earn interest on USDC, or borrow against it.",
    description: "The largest lending market, live on Arc with USDC, EURC, cirBTC and WETH.",
    category: "Lend & Earn",
    url: "https://app.aave.com",
    status: "live",
    features: ["Earn on USDC", "Borrow"],
    featured: false,
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Supply a small amount of USDC.",
    builder: { name: "Aave Labs", github: "https://github.com/aave", x: "https://x.com/aave" }
  },
  {
    id: "morpho",
    slug: "morpho",
    name: "Morpho",
    tagline: "Curated vaults that put USDC to work.",
    description: "Lending vaults managed by risk curators such as Gauntlet and Steakhouse. Powers Arc's built-in earn features.",
    category: "Lend & Earn",
    url: "https://app.morpho.org",
    status: "live",
    features: ["Curated vaults", "USDC and EURC"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Deposit USDC into a vault.",
    builder: { name: "Morpho", github: "https://github.com/morpho-org", x: "https://x.com/MorphoLabs" }
  },
  {
    id: "hibachi",
    slug: "hibachi",
    name: "Hibachi",
    tagline: "Trade currencies with stablecoins.",
    description: "A stablecoin-native exchange for foreign-exchange trading, built with support from the Arc Builders Fund.",
    category: "FX",
    url: "https://hibachi.xyz",
    status: "beta",
    features: ["Currency trading", "Private settlement"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Explore the USD/EUR market.",
    builder: { name: "Hibachi", x: "https://x.com/hibachi_xyz" }
  },
  {
    id: "wirex",
    slug: "wirex",
    name: "Wirex",
    tagline: "Spend stablecoins with a card.",
    description: "A payments app and card that lets you spend and send stablecoins in everyday life.",
    category: "Payments",
    url: "https://wirexapp.com",
    status: "live",
    features: ["Card payments", "Send money"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Send a small USDC payment.",
    builder: { name: "Wirex", x: "https://x.com/wirexapp" }
  },
  {
    id: "rain",
    slug: "rain",
    name: "Rain",
    tagline: "Stablecoin-powered cards for businesses.",
    description: "Card issuing that settles in stablecoins, so companies can offer cards funded with USDC.",
    category: "Payments",
    url: "https://www.rain.xyz",
    status: "live",
    features: ["Card issuing", "USDC settlement"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "See how Rain cards work.",
    builder: { name: "Rain" }
  },
  {
    id: "across",
    slug: "across",
    name: "Across",
    tagline: "Move USDC to Arc from 17 chains.",
    description: "A fast bridge with live routes from Ethereum, Base, Arbitrum, Optimism, Polygon and more, in both directions.",
    category: "Bridges",
    url: "https://across.to",
    status: "live",
    features: ["17 source chains", "One-step transfers"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Bring USDC to Arc from another chain.",
    builder: { name: "Across", github: "https://github.com/across-protocol", x: "https://x.com/AcrossProtocol" }
  },
  {
    id: "circle-cctp",
    slug: "circle-cctp",
    name: "Circle CCTP",
    tagline: "Move native USDC between Arc and other chains.",
    description: "Circle's own transfer protocol: burns USDC on one chain and mints it on the other, with no wrapped tokens.",
    category: "Bridges",
    url: "https://developers.circle.com/cctp",
    status: "live",
    features: ["Native USDC", "No wrapped tokens"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Bring USDC from another chain to Arc.",
    builder: { name: "Circle", github: "https://github.com/circlefin", x: "https://x.com/circle" }
  },
  {
    id: "arc-portal",
    slug: "arc-portal",
    name: "Arc Portal",
    tagline: "Earn, swap, send and bridge in one place.",
    description: "Circle's own home for Arc: a wallet interface with built-in earn, swaps, transfers and app discovery.",
    category: "Wallets",
    url: "https://portal.arc.io",
    status: "live",
    features: ["All-in-one", "Built by Circle"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Connect your wallet and look around.",
    builder: { name: "Circle", github: "https://github.com/circlefin", x: "https://x.com/circle" }
  },
  {
    id: "metamask",
    slug: "metamask",
    name: "MetaMask",
    tagline: "The popular browser and mobile wallet.",
    description: "Supports Arc from day one. Add the network, hold USDC and connect to any Arc app.",
    category: "Wallets",
    url: "https://metamask.io",
    status: "live",
    features: ["Browser and mobile", "Arc supported"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Add Arc to your wallet.",
    builder: { name: "MetaMask", github: "https://github.com/MetaMask", x: "https://x.com/MetaMask" }
  },
  {
    id: "phantom",
    slug: "phantom",
    name: "Phantom",
    tagline: "A simple multichain wallet.",
    description: "A friendly wallet for many chains, with Arc support at launch.",
    category: "Wallets",
    url: "https://phantom.com",
    status: "live",
    features: ["Multichain", "Arc supported"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Add Arc and receive some USDC.",
    builder: { name: "Phantom", x: "https://x.com/phantom" }
  },
  {
    id: "bankr",
    slug: "bankr",
    name: "Bankr",
    tagline: "An AI assistant that trades for you.",
    description: "Tell it what you want in plain words, like “swap 10 USDC to EURC”, and it does it.",
    category: "AI Agents",
    url: "https://bankr.bot",
    status: "beta",
    features: ["Plain-language trades", "AI assistant"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Ask it to make a small swap.",
    builder: { name: "Bankr", x: "https://x.com/bankrbot" }
  },
  {
    id: "opensea",
    slug: "opensea",
    name: "OpenSea",
    tagline: "Collect and trade digital items.",
    description: "The largest marketplace for NFTs, with Arc collections from launch.",
    category: "Assets",
    url: "https://opensea.io",
    status: "live",
    features: ["NFT marketplace", "Pay in USDC"],
    addedAt: MAINNET_LAUNCH,
    active: true,
    firstAction: "Browse Arc collections.",
    builder: { name: "OpenSea", github: "https://github.com/ProjectOpenSea", x: "https://x.com/opensea" }
  }
];

/** Contracts that count on the network this deployment runs on. */
export function appContracts(app: ArcApp, network: ArcNetwork = ARC_NETWORK): Address[] {
  return app.contracts?.[network] ?? [];
}

/** "Verified" means published contracts on this network, checked against a public source. */
export function isVerified(app: ArcApp, network: ArcNetwork = ARC_NETWORK): boolean {
  return Boolean(app.verification) && !app.sample && appContracts(app, network).length > 0;
}

export type DiscoverQuery = {
  category?: Category | null;
  search?: string;
};

/** Explainable ranking: featured, then verified, then newest. Samples always last. */
export function discoverApps(apps: ArcApp[], query: DiscoverQuery = {}, network: ArcNetwork = ARC_NETWORK): ArcApp[] {
  const term = query.search?.trim().toLowerCase() ?? "";
  return apps
    .filter((app) => app.active)
    .filter((app) => !query.category || app.category === query.category)
    .filter((app) => !term || matches(app, term, network))
    .sort(
      (a, b) =>
        Number(Boolean(a.sample)) - Number(Boolean(b.sample)) ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Number(isVerified(b, network)) - Number(isVerified(a, network)) ||
        b.addedAt.localeCompare(a.addedAt) ||
        a.name.localeCompare(b.name)
    );
}

function matches(app: ArcApp, term: string, network: ArcNetwork) {
  return [app.name, app.tagline, app.category, app.firstAction, app.builder?.name ?? "", ...app.features, ...appContracts(app, network)]
    .some((field) => field.toLowerCase().includes(term));
}

/** Newest listings, for "New" rails. */
export function newestApps(apps: ArcApp[], limit = 3): ArcApp[] {
  return apps
    .filter((a) => a.active)
    .sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample)) || b.addedAt.localeCompare(a.addedAt) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getApp(slug: string, apps: ArcApp[] = APPS): ArcApp | undefined {
  return apps.find((a) => a.slug === slug && a.active);
}

export function categoryCounts(apps: ArcApp[]): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const app of apps) if (app.active) counts[app.category] += 1;
  return counts;
}

export function appLink(app: ArcApp): string | undefined {
  return app.sample ? undefined : app.url;
}

export const STATUS_LABEL: Record<AppStatus, string> = {
  live: "Live",
  beta: "Beta",
  experimental: "Experimental"
};

/** Lower-cased contract addresses that count toward the explore-app quest. */
export function questEligibleContracts(apps: ArcApp[] = APPS, network: ArcNetwork = ARC_NETWORK): Set<string> {
  return new Set(
    apps
      .filter((app) => app.active && isVerified(app, network))
      .flatMap((app) => appContracts(app, network).map((a) => a.toLowerCase()))
  );
}
