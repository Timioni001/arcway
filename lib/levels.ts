/** Passport levels by XP. A progress identity, not a financial rank (§17). */
export const LEVELS = [
  { min: 0, name: "Newcomer" },
  { min: 10, name: "Arrival" },
  { min: 35, name: "Explorer" },
  { min: 110, name: "Pathfinder" }
] as const;

export function levelFor(xp: number) {
  let index = 0;
  LEVELS.forEach((l, i) => { if (xp >= l.min) index = i; });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { index, name: current.name, next, progress: Math.max(0, Math.min(1, progress)) };
}
