import type { Address } from "viem";

/** Categories translate Arc's strengths (dollar-native, fast, financial) into things to do. */
export const CATEGORIES = [
  "Payments",
  "Trading",
  "DeFi",
  "FX",
  "Assets",
  "Tools",
  "Agents",
  "Infrastructure",
  "Experiments"
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
  /** Where "Open" goes. Omitted for samples. */
  url?: string;
  /** Path under /public, e.g. /apps/flowpay.svg. Shown in a controlled container. */
  logo?: string;
  status: AppStatus;
  /** How the app uses Arc, e.g. "USDC gas", "Sub-second settlement". */
  features: string[];
  /** Only contracts confirmed by the app team. Used for the explore-app quest. */
  contractAddresses: Address[];
  /** Arcway checked the contracts above against the app team and a public source. */
  verified: boolean;
  verification?: { checkedAt: string; sourceUrl?: string };
  featured?: boolean;
  /** ISO date the listing was added; drives "New". */
  addedAt: string;
  active: boolean;
  /** Placeholder entry used while the curated registry is being filled. */
  sample?: boolean;
  /** Answer to "what would I do here?". */
  firstAction: string;
  builder?: Builder;
};

/**
 * Curated registry. Replace sample entries with reviewed listings before launch.
 * Never add a contract address that the app team has not confirmed.
 */
export const APPS: ArcApp[] = [
  {
    id: "sample-payments",
    slug: "sample-payments",
    name: "Sample payments app",
    tagline: "USDC payments that settle on Arc in under a second.",
    description:
      "Placeholder for a payments listing. Real listings describe what the app does, who it is for and how it uses Arc.",
    category: "Payments",
    status: "live",
    features: ["USDC gas", "Sub-second settlement"],
    contractAddresses: [],
    verified: false,
    featured: true,
    addedAt: "2026-09-20",
    active: true,
    sample: true,
    firstAction: "Send a small USDC payment to a friend."
  },
  {
    id: "sample-dex",
    slug: "sample-exchange",
    name: "Sample exchange",
    tagline: "Swap stablecoins and other assets on Arc.",
    description: "Placeholder for a trading listing.",
    category: "Trading",
    status: "beta",
    features: ["Onchain FX", "USDC gas"],
    contractAddresses: [],
    verified: false,
    addedAt: "2026-09-22",
    active: true,
    sample: true,
    firstAction: "Make a small stablecoin swap."
  },
  {
    id: "sample-lending",
    slug: "sample-lending",
    name: "Sample lending market",
    tagline: "Supply USDC and earn from borrowers.",
    description: "Placeholder for a DeFi listing.",
    category: "DeFi",
    status: "experimental",
    features: ["USDC-denominated", "Transparent rates"],
    contractAddresses: [],
    verified: false,
    addedAt: "2026-09-18",
    active: true,
    sample: true,
    firstAction: "Supply a small amount of USDC."
  },
  {
    id: "circle-cctp",
    slug: "circle-cctp",
    name: "Circle CCTP",
    tagline: "Move native USDC between Arc and other chains.",
    description:
      "Circle's Cross-Chain Transfer Protocol burns USDC on the source chain and mints native USDC on the destination. No wrapped tokens.",
    category: "Infrastructure",
    url: "https://developers.circle.com/cctp",
    status: "live",
    features: ["Native USDC", "Cross-chain"],
    contractAddresses: [],
    verified: false,
    addedAt: "2026-09-16",
    active: true,
    firstAction: "Bring USDC from another chain to Arc.",
    builder: { name: "Circle", github: "https://github.com/circlefin" }
  }
];

export type DiscoverQuery = {
  category?: Category | null;
  search?: string;
};

/** Explainable ranking: featured, then verified, then newest. Samples always last. */
export function discoverApps(apps: ArcApp[], query: DiscoverQuery = {}): ArcApp[] {
  const term = query.search?.trim().toLowerCase() ?? "";
  return apps
    .filter((app) => app.active)
    .filter((app) => !query.category || app.category === query.category)
    .filter((app) => !term || matches(app, term))
    .sort(
      (a, b) =>
        Number(Boolean(a.sample)) - Number(Boolean(b.sample)) ||
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        Number(b.verified) - Number(a.verified) ||
        b.addedAt.localeCompare(a.addedAt) ||
        a.name.localeCompare(b.name)
    );
}

function matches(app: ArcApp, term: string) {
  return [app.name, app.tagline, app.category, app.firstAction, app.builder?.name ?? "", ...app.features, ...app.contractAddresses]
    .some((field) => field.toLowerCase().includes(term));
}

/** Newest listings, for the "New" rail. */
export function newestApps(apps: ArcApp[], limit = 3): ArcApp[] {
  return apps
    .filter((a) => a.active)
    .sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample)) || b.addedAt.localeCompare(a.addedAt))
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
  live: "Live on Arc",
  beta: "Beta",
  experimental: "Experimental"
};

/** Lower-cased contract addresses that count toward the explore-app quest. */
export function questEligibleContracts(apps: ArcApp[] = APPS): Set<string> {
  return new Set(
    apps
      .filter((app) => app.verified && app.active && !app.sample)
      .flatMap((app) => app.contractAddresses.map((a) => a.toLowerCase()))
  );
}
