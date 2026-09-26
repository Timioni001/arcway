import { Award, Coins, Compass, Lock, Send, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "arrive-with-usdc": Coins,
  "first-tx": Send,
  "explore-app": Compass,
  "arc-explorer": Award
};

/** Hexagonal badge. Earned: blue-spectrum fill with a light sweep on hover. Locked: muted with a lock. */
export function Medal({ questId, earned, index, size = "md" }: { questId: string; earned: boolean; index: number; size?: "sm" | "md" }) {
  const Icon = ICONS[questId] ?? Award;
  return (
    <span className={`medal medal--${size}`} data-earned={earned} data-tone={index % 4} aria-hidden="true">
      <span className="medal__face"><Icon /></span>
      {!earned && <span className="medal__lock"><Lock /></span>}
    </span>
  );
}
