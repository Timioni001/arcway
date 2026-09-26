/**
 * Guided trails: a goal broken into small steps across apps. Progress is
 * self-reported and kept in the browser (quests are the verified part).
 */
export type TrailStep = {
  id: string;
  title: string;
  body: string;
  /** App to open for this step. */
  appSlug?: string;
  /** Internal page for this step. */
  href?: string;
  /** Built-in action instead of a link. */
  action?: "add-arc" | "get-usdc";
};

export type Trail = {
  id: string;
  title: string;
  goal: string;
  minutes: number;
  icon: "rocket" | "piggy" | "swap" | "bot";
  steps: TrailStep[];
};

export const TRAILS: Trail[] = [
  {
    id: "get-started",
    title: "Get set up on Arc",
    goal: "Wallet ready, USDC in, first payment sent.",
    minutes: 5,
    icon: "rocket",
    steps: [
      { id: "add-arc", title: "Add Arc to your wallet", body: "One click adds the network so your wallet knows where to go.", action: "add-arc" },
      { id: "get-usdc", title: "Get some USDC", body: "USDC pays for everything on Arc, including fees.", action: "get-usdc" },
      { id: "first-payment", title: "Send your first payment", body: "Make a pay link and pay it, or pay a friend's link.", href: "/pay" },
      { id: "claim", title: "Claim your first XP", body: "Your first transaction counts toward the Arc Starter quests.", href: "/quests" }
    ]
  },
  {
    id: "earn",
    title: "Earn on your USDC",
    goal: "Put idle USDC to work in a lending market.",
    minutes: 8,
    icon: "piggy",
    steps: [
      { id: "bring", title: "Bring USDC to Arc", body: "Move USDC over from another chain in one step.", appSlug: "across" },
      { id: "compare", title: "Compare rates", body: "Aave is a big open market; Morpho vaults are curated by risk managers.", appSlug: "morpho" },
      { id: "deposit", title: "Deposit a small amount", body: "Start small. You can withdraw any time.", appSlug: "aave" },
      { id: "check", title: "Check your passport", body: "See your progress and what to try next.", href: "/passport" }
    ]
  },
  {
    id: "trade",
    title: "Swap stablecoins",
    goal: "Swap USDC and EURC at a good price.",
    minutes: 4,
    icon: "swap",
    steps: [
      { id: "tower", title: "Find the best price", body: "Tower checks several exchanges on Arc for you.", appSlug: "tower-exchange" },
      { id: "uniswap", title: "Swap on Uniswap", body: "A swap on Uniswap also counts for the Explore an app quest on mainnet.", appSlug: "uniswap" },
      { id: "curve", title: "Try a stablecoin pool", body: "Curve is built for coins that should trade close to each other.", appSlug: "curve" }
    ]
  },
  {
    id: "agents",
    title: "Try an AI agent",
    goal: "Ask an assistant to make a trade for you.",
    minutes: 3,
    icon: "bot",
    steps: [
      { id: "open", title: "Open Bankr", body: "An assistant you talk to in plain words.", appSlug: "bankr" },
      { id: "ask", title: "Ask for a small swap", body: "Try “swap 5 USDC to EURC”. Check the details before you approve.", appSlug: "bankr" },
      { id: "review", title: "Review it on your passport", body: "Your activity shows up within seconds.", href: "/passport" }
    ]
  }
];

export function getTrail(id: string): Trail | undefined {
  return TRAILS.find((t) => t.id === id);
}

export function trailProgress(trail: Trail, done: readonly string[]): { done: number; total: number; complete: boolean } {
  const n = trail.steps.filter((s) => done.includes(`${trail.id}:${s.id}`)).length;
  return { done: n, total: trail.steps.length, complete: n === trail.steps.length };
}
