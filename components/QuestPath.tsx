'use client';

import { Check } from "lucide-react";
import { useArcwayState } from "../lib/hooks/context";
import { QuestCard } from "./Quests";

/** Quests as one connected route: nodes on a rail, filled as quests are claimed. */
export function QuestPath() {
  const { quests, connection } = useArcwayState();
  const connected = connection.status === "connected";
  const done = connected ? quests.filter((q) => q.status === "completed").length : 0;
  const fill = quests.length > 1 ? Math.max(0, done - 1) / (quests.length - 1) : 0;

  return (
    <ol className="path swipe">
      <span className="path__fill" style={{ width: `calc((100% - 40px) * ${fill})` }} aria-hidden="true" />
      {quests.map((q, i) => {
        const state = connected ? q.status : "todo";
        return (
          <li key={q.id} className="path__step">
            <span className="node" data-state={state} aria-hidden="true">
              {state === "completed" ? <Check /> : i + 1}
            </span>
            <QuestCard quest={q} />
          </li>
        );
      })}
    </ol>
  );
}
