import { ArrowLeftRight, Bot, Coins, FlaskConical, Gem, Landmark, Send, Server, Wrench, type LucideIcon } from "lucide-react";
import { CATEGORIES, type Category } from "../lib/registry";

const ICONS: Record<Category, LucideIcon> = {
  Payments: Send,
  Trading: ArrowLeftRight,
  DeFi: Landmark,
  FX: Coins,
  Assets: Gem,
  Tools: Wrench,
  Agents: Bot,
  Infrastructure: Server,
  Experiments: FlaskConical
};

export const CATEGORY_BLURB: Record<Category, string> = {
  Payments: "Send and receive USDC",
  Trading: "Swap and trade",
  DeFi: "Lend, borrow and earn",
  FX: "Exchange currencies",
  Assets: "Tokenized real-world assets",
  Tools: "Wallets and utilities",
  Agents: "AI that can pay and act",
  Infrastructure: "Bridges and building blocks",
  Experiments: "New and unusual ideas"
};

/** Rotates through three shades of the blue family so a grid of tiles has rhythm. */
export function shadeFor(category: Category): 1 | 2 | 3 {
  return ((CATEGORIES.indexOf(category) % 3) + 1) as 1 | 2 | 3;
}

export function CategoryTile({ category, size = "md" }: { category: Category; size?: "xs" | "md" | "lg" }) {
  const Icon = ICONS[category];
  return (
    <span className={`tile${size === "md" ? "" : ` tile--${size}`}`} data-shade={shadeFor(category)} aria-hidden="true">
      <Icon />
    </span>
  );
}
