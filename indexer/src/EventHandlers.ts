/*
 * Arcway Passport handlers. Every QuestCompleted event becomes a Completion row and
 * updates the explorer, the UTC day bucket and the global totals. Nothing is estimated:
 * each row points back to its transaction.
 */
import { indexer } from "envio";

const dayOf = (ts: number) => new Date(ts * 1000).toISOString().slice(0, 10);

indexer.onEvent({ contract: "ArcwayPassport", event: "QuestCompleted" }, async ({ event, context }) => {
  const user = event.params.user.toLowerCase();
  const ts = event.block.timestamp;
  const xp = event.params.xpAwarded;

  const existing = await context.Explorer.get(user);
  const isNew = !existing;
  context.Explorer.set({
    id: user,
    xp: (existing?.xp ?? 0n) + xp,
    completions: (existing?.completions ?? 0) + 1,
    badges: existing?.badges ?? 0,
    firstAt: existing?.firstAt ?? ts,
    lastAt: ts
  });

  context.Completion.set({
    id: `${event.transaction.hash}-${event.logIndex}`,
    explorer_id: user,
    user,
    questId: event.params.questId.toLowerCase(),
    xp,
    timestamp: ts,
    block: event.block.number,
    txHash: event.transaction.hash
  });

  const day = dayOf(ts);
  const bucket = await context.DailyStat.get(day);
  context.DailyStat.set({
    id: day,
    day,
    completions: (bucket?.completions ?? 0) + 1,
    xp: (bucket?.xp ?? 0n) + xp,
    newExplorers: (bucket?.newExplorers ?? 0) + (isNew ? 1 : 0)
  });

  const totals = await context.Totals.get("global");
  context.Totals.set({
    id: "global",
    explorers: (totals?.explorers ?? 0) + (isNew ? 1 : 0),
    completions: (totals?.completions ?? 0) + 1,
    xp: (totals?.xp ?? 0n) + xp
  });
});

indexer.onEvent({ contract: "ArcwayPassport", event: "BadgeAwarded" }, async ({ event, context }) => {
  const user = event.params.user.toLowerCase();
  const txHash: string = event.transaction.hash;
  context.Badge.set({ id: `${txHash}-${event.logIndex}`, user, badgeId: event.params.badgeId.toLowerCase(), timestamp: event.block.timestamp });
  const existing = await context.Explorer.get(user);
  if (existing) context.Explorer.set({ ...existing, badges: existing.badges + 1 });
});
