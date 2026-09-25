import type { Address } from "viem";

export const CATEGORIES = [
  "Payments",
  "Trading",
  "DeFi",
  "Infrastructure",
  "Wallets",
  "RWA",
  "AI / Agents",
  "Developer tools"
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ArcApp = {
  id: string;
  name: string;
  description: string;
  category: Category;
  website?: string;
  /** Deep link into the app's Arc experience, preferred over `website`. */
  arcUrl?: string;
  /** Only contracts confirmed by the app team. Used for the explore-app quest. */
  contractAddresses: Address[];
  /** Listing reviewed by Arcway. Unverified listings never count for quests. */
  verified: boolean;
  active: boolean;
  /** Placeholder entry used while the curated registry is being filled. */
  sample?: boolean;
  /** One-line answer to "what would I do here?" shown under the name. */
  firstAction: string;
};

/**
 * Curated registry. Replace sample entries with reviewed listings before launch.
 * Never add a contract address that the app team has not confirmed.
 */
export const APPS: ArcApp[] = [
  {
    id: "sample-payments",
    name: "Sample payments app",
    description: "Send and receive USDC payments that settle on Arc in under a second.",
    category: "Payments",
    contractAddresses: [],
    verified: false,
    active: true,
    sample: true,
    firstAction: "Send a small USDC payment to a friend."
  },
  {
    id: "sample-dex",
    name: "Sample exchange",
    description: "Swap stablecoins and other assets on Arc.",
    category: "Trading",
    contractAddresses: [],
    verified: false,
    active: true,
    sample: true,
    firstAction: "Make a small stablecoin swap."
  },
  {
    id: "sample-lending",
    name: "Sample lending market",
    description: "Supply USDC and earn yield from borrowers.",
    category: "DeFi",
    contractAddresses: [],
    verified: false,
    active: true,
    sample: true,
    firstAction: "Supply a small amount of USDC."
  },
  {
    id: "circle-cctp",
    name: "Circle CCTP",
    description: "Move native USDC between Arc and 20+ other chains without wrapped tokens.",
    category: "Infrastructure",
    website: "https://developers.circle.com/cctp",
    contractAddresses: [],
    verified: true,
    active: true,
    firstAction: "Bring USDC from another chain to Arc."
  }
];

export type DiscoverQuery = {
  category?: Category | null;
  search?: string;
};

/** Active apps matching the query, verified and non-sample listings first. */
export function discoverApps(apps: ArcApp[], query: DiscoverQuery = {}): ArcApp[] {
  const term = query.search?.trim().toLowerCase() ?? "";
  return apps
    .filter((app) => app.active)
    .filter((app) => !query.category || app.category === query.category)
    .filter(
      (app) =>
        !term ||
        [app.name, app.description, app.category, app.firstAction].some((field) =>
          field.toLowerCase().includes(term)
        )
    )
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

function rank(app: ArcApp) {
  return (app.sample ? 2 : 0) + (app.verified ? 0 : 1);
}

export function categoryCounts(apps: ArcApp[]): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
  for (const app of apps) if (app.active) counts[app.category] += 1;
  return counts;
}

export function appLink(app: ArcApp): string | undefined {
  return app.sample ? undefined : app.arcUrl ?? app.website;
}

/** Lower-cased contract addresses that count toward the explore-app quest. */
export function questEligibleContracts(apps: ArcApp[] = APPS): Set<string> {
  return new Set(
    apps
      .filter((app) => app.verified && app.active && !app.sample)
      .flatMap((app) => app.contractAddresses.map((a) => a.toLowerCase()))
  );
}
