'use client';

import { Check, Lock } from "lucide-react";
import { useArcwayState } from "../lib/hooks/context";
import { QUEST_TIERS } from "../lib/quests";
import { QuestCard } from "./Quests";

/** Quests as a route in four stages: each tier's quests on one rail, the tier's XP, and what opens it. */
export function QuestPath() {
  const { quests, connection } = useArcwayState();
  const connected = connection.status === "connected";

  return (
    <div className="qroute">
      {QUEST_TIERS.map((tier, t) => {
        const inTier = quests.filter((q) => q.tier === tier);
        if (!inTier.length) return null;
        const gate = inTier[0].after ? quests.find((q) => q.id === inTier[0].after) : undefined;
        const open = !gate || gate.status === "completed";
        const done = connected ? inTier.filter((q) => q.status === "completed").length : 0;
        const xp = inTier.reduce((n, q) => n + q.xp, 0);
        return (
          <section key={tier} className="qroute__tier" data-open={open} aria-labelledby={`tier-${tier}`}>
            <header className="qroute__head">
              <span className="qroute__n mono" aria-hidden="true">{t + 1}</span>
              <h3 id={`tier-${tier}`} className="h4">{tier}</h3>
              <span className="qroute__meta mono xs">{inTier.length} quests · {xp.toLocaleString("en-US")} XP{connected ? ` · ${done}/${inTier.length} done` : ""}</span>
              {!open && gate && <span className="qroute__gate xs"><Lock aria-hidden="true" />Opens after {gate.title}</span>}
            </header>
            <ol className="path path--tier swipe">
              {inTier.map((q) => {
                const state = connected ? q.status : "todo";
                return (
                  <li key={q.id} className="path__step">
                    <span className="node" data-state={state} aria-hidden="true">
                      {state === "completed" ? <Check /> : quests.indexOf(q) + 1}
                    </span>
                    <QuestCard quest={q} />
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
