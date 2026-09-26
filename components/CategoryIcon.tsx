import { ArrowLeftRight, Bot, Coins, Gem, PiggyBank, Send, Wallet, Waypoints, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { ArcApp, Category } from "../lib/registry";

type Meta = { icon: LucideIcon; color: string; blurb: string };

/** Each category owns one colour (all ≥3:1 on their tint in both themes) and one icon. */
export const CATEGORY_META: Record<Category, Meta> = {
  Payments: { icon: Send, color: "#2F6FDB", blurb: "Send, spend and get paid" },
  Trading: { icon: ArrowLeftRight, color: "#0B8F87", blurb: "Swap and trade tokens" },
  "Lend & Earn": { icon: PiggyBank, color: "#15803D", blurb: "Earn interest or borrow" },
  FX: { icon: Coins, color: "#6E56CF", blurb: "Trade currencies" },
  Bridges: { icon: Waypoints, color: "#C2410C", blurb: "Move money to Arc" },
  Wallets: { icon: Wallet, color: "#A16207", blurb: "Hold and manage your money" },
  "AI Agents": { icon: Bot, color: "#BE3A8C", blurb: "Assistants that act for you" },
  Assets: { icon: Gem, color: "#DC3545", blurb: "Collectibles and tokenized assets" }
};

const style = (category: Category) => ({ "--cat": CATEGORY_META[category].color }) as CSSProperties;

export function CategoryTile({ category, size = "md" }: { category: Category; size?: "xs" | "md" | "lg" }) {
  const Icon = CATEGORY_META[category].icon;
  return (
    <span className={`ctile${size === "md" ? "" : ` ctile--${size}`}`} style={style(category)} aria-hidden="true">
      <Icon />
    </span>
  );
}

function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 1)).toUpperCase();
}

/** An app's mark: its own logo when added, otherwise a monogram in its category colour. */
export function AppMark({ app, size = "md" }: { app: ArcApp; size?: "sm" | "md" | "lg" }) {
  const cls = `ctile ctile--mono${size === "md" ? "" : ` ctile--${size}`}`;
  if (app.logo) {
    return (
      <span className={`${cls} ctile--logo`} style={style(app.category)} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.logo} alt="" />
      </span>
    );
  }
  return <span className={cls} style={style(app.category)} aria-hidden="true">{initials(app.name)}</span>;
}
