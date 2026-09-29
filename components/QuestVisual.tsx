import { BookOpen, CalendarDays, Compass, Gem, MousePointerClick, Users, Zap, type LucideIcon } from "lucide-react";
import type { Quest, QuestType } from "../lib/quests";

/** Every quest type gets its own mark and hue, so a card reads before a word is read. */
export const QUEST_TYPE_LOOK: Record<QuestType, { icon: LucideIcon; hue: number }> = {
  Learn: { icon: BookOpen, hue: 199 },
  Explore: { icon: Compass, hue: 188 },
  "Try an app": { icon: MousePointerClick, hue: 168 },
  "Onchain action": { icon: Zap, hue: 222 },
  Collect: { icon: Gem, hue: 38 },
  Seasonal: { icon: CalendarDays, hue: 280 },
  Community: { icon: Users, hue: 330 }
};

export function QuestTypeMark({ type, size = "md" }: { type: QuestType; size?: "md" | "lg" }) {
  const { icon: Icon, hue } = QUEST_TYPE_LOOK[type];
  return (
    <span className={`qmark qmark--${size}`} style={{ "--qh": hue } as React.CSSProperties} aria-hidden="true">
      <Icon />
    </span>
  );
}

/** Difficulty as three pips; the label stays for screen readers and scanning. */
export function DifficultyPips({ difficulty, label }: { difficulty: Quest["difficulty"]; label: string }) {
  const n = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return (
    <span className="pips" title={label}>
      <span className="pips__dots" aria-hidden="true">{[1, 2, 3].map((i) => <i key={i} data-on={i <= n} />)}</span>
      {label}
    </span>
  );
}
