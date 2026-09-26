import { ArrowLeftRight, Bot, CircleDollarSign, Gem, PiggyBank, Send, WalletCards, Waypoints, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { ArcApp, Category } from "../lib/registry";

type Meta = { icon: LucideIcon; color: string; blurb: string };

/** Each category owns one colour (all ≥3:1 on their tint in both themes) and one icon. */
export const CATEGORY_META: Record<Category, Meta> = {
  Payments: { icon: Send, color: "#2F6FDB", blurb: "Send, spend and get paid" },
  Trading: { icon: ArrowLeftRight, color: "#0B8F87", blurb: "Swap and trade tokens" },
  "Lend & Earn": { icon: PiggyBank, color: "#15803D", blurb: "Earn interest or borrow" },
  FX: { icon: CircleDollarSign, color: "#6E56CF", blurb: "Trade currencies" },
  Bridges: { icon: Waypoints, color: "#C2410C", blurb: "Move money to Arc" },
  Wallets: { icon: WalletCards, color: "#A16207", blurb: "Hold and manage your money" },
  "AI Agents": { icon: Bot, color: "#BE3A8C", blurb: "Assistants that act for you" },
  Assets: { icon: Gem, color: "#DC3545", blurb: "Collectibles and tokenized assets" }
};

const style = (category: Category) => ({ "--cat": CATEGORY_META[category].color }) as CSSProperties;

export function CategoryTile({ category, size = "md" }: { category: Category; size?: "xs" | "sm" | "md" | "lg" }) {
  const Icon = CATEGORY_META[category].icon;
  return (
    <span className={`ctile${size === "md" ? "" : ` ctile--${size}`}`} style={style(category)} aria-hidden="true">
      <Icon />
    </span>
  );
}

/**
 * An app's mark: its own logo in a consistent rounded container, otherwise its category icon.
 * Decorative by default because the app name always sits beside it; pass `labelled` when it stands alone.
 */
export function AppMark({ app, size = "md", labelled = false }: { app: ArcApp; size?: "sm" | "md" | "lg"; labelled?: boolean }) {
  const sz = size === "md" ? "" : ` ctile--${size}`;
  if (app.logo) {
    return (
      <span className={`ctile ctile--logo${sz}`} style={style(app.category)} {...(labelled ? {} : { "aria-hidden": true })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.logo} alt={labelled ? `${app.name} logo` : ""} loading="lazy" decoding="async" />
      </span>
    );
  }
  const Icon = CATEGORY_META[app.category].icon;
  return (
    <span className={`ctile${sz}`} style={style(app.category)} {...(labelled ? { role: "img", "aria-label": app.name } : { "aria-hidden": true })}>
      <Icon />
    </span>
  );
}
