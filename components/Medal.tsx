import { Award, CalendarCheck, CalendarDays, CalendarRange, Coins, Compass, Crown, Flag, Gem, Layers, Lock, Mountain, Repeat, Rocket, Send, Wallet, Zap, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "arrive-with-usdc": Coins,
  "first-tx": Send,
  "explore-app": Compass,
  "arc-explorer": Award,
  "five-tx": Repeat,
  "app-actions-3": Layers,
  "three-days": CalendarCheck,
  "arc-voyager": Flag,
  "twenty-five-tx": Zap,
  "app-actions-10": Rocket,
  "week-on-arc": CalendarDays,
  "fifty-usdc": Wallet,
  "arc-regular": Gem,
  "century": Mountain,
  "app-actions-25": Rocket,
  "twenty-days": CalendarRange,
  "arc-pathfinder": Crown
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
