'use client';

import { tiersDone } from "../lib/quests";
import { useCallback, useRef } from "react";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useCountUp } from "../lib/hooks/useCountUp";
import { usePointerVars } from "../lib/hooks/usePointerVars";
import { levelFor } from "../lib/levels";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { getItem, type PassportStyle } from "../lib/passportStyle";
import { CardArt, CardChip } from "./CardArt";
import { LogoMark } from "./Logo";

/** The passport as a physical card: tilts under the pointer and its holo foil shifts with the light. */
export function PassCardView({ address, xp, done, look }: { address?: string; xp: number; done: boolean[]; look?: PassportStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useCountUp(xp);
  const level = levelFor(xp);
  const tilt = useCallback((px: number, py: number, el: HTMLElement) => {
    el.style.setProperty("--ry", `${px * 10}deg`);
    el.style.setProperty("--rx", `${-py * 10}deg`);
    el.style.setProperty("--hyp", Math.min(1, Math.hypot(px, py)).toFixed(3));
  }, []);
  usePointerVars(ref, tilt);

  return (
    <div className="pass" ref={ref} data-theme={look?.theme ?? "arc"} role="img" aria-label={`Arcway passport${look?.name ? ` of ${look.name}` : ""}: ${level.name}, ${xp} XP`}>
      <CardArt theme={look?.theme ?? "arc"} />
      <div className="pass__holo" aria-hidden="true" />
      <div className="pass__glare" aria-hidden="true" />
      <div className="pass__top">
        <span className="pass__brand"><LogoMark className="logo__mark" id="aw-mark-pass" /> arcway</span>
        <span className="pass__label">Passport</span>
      </div>
      <CardChip />
      <div className="pass__bottom">
        <div>
          {look?.name && <div className="pass__name">{look.name}</div>}
          <div className="pass__label">{address ? level.name : "Your level"}{look && look.title !== "none" && <> · {getItem("title", look.title)?.name}</>}</div>
          <div className="pass__xp" style={{ marginTop: 8 }}>{String(shown).padStart(3, "0")} XP</div>
          <div className="mono pass__addr" style={{ marginTop: 10, fontSize: 13 }}>{address ? shortAddress(address) : "0x0000…0000"}</div>
        </div>
        <div className="pass__dots" aria-hidden="true">
          {done.map((d, i) => <i key={i} data-on={d} />)}
        </div>
      </div>
    </div>
  );
}

/** The connected wallet's passport card. */
export function PassCard() {
  const { xp, quests, connection } = useArcwayState();
  const { style } = usePassportStyle();
  const connected = connection.status === "connected";
  return (
    <PassCardView
      look={connected ? style : undefined}
      address={connected ? connection.address : undefined}
      xp={connected ? xp : 0}
      done={tiersDone(connected ? quests : quests.map((q) => ({ ...q, status: "todo" as const })))}
    />
  );
}
