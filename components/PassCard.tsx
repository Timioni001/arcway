'use client';

import { useCallback, useRef } from "react";
import { shortAddress } from "../lib/format";
import { useArcwayState } from "../lib/hooks/context";
import { useCountUp } from "../lib/hooks/useCountUp";
import { usePointerVars } from "../lib/hooks/usePointerVars";
import { levelFor } from "../lib/levels";
import { Forms } from "./Forms";
import { LogoMark } from "./Logo";

/** The passport as a physical card: tilts and catches light under the pointer. */
export function PassCard() {
  const ref = useRef<HTMLDivElement>(null);
  const { xp, quests, connection } = useArcwayState();
  const shown = useCountUp(xp);
  const level = levelFor(xp);
  const connected = connection.status === "connected";
  const tilt = useCallback((px: number, py: number, el: HTMLElement) => {
    el.style.setProperty("--ry", `${px * 7}deg`);
    el.style.setProperty("--rx", `${-py * 7}deg`);
  }, []);
  usePointerVars(ref, tilt);

  return (
    <div className="pass" ref={ref} role="img" aria-label={`Arcway passport: ${level.name}, ${xp} XP`}>
      <Forms />
      <div className="pass__top">
        <span className="pass__brand"><LogoMark className="logo__mark" /> arcway</span>
        <span className="pass__label">Passport</span>
      </div>
      <div className="pass__bottom">
        <div>
          <div className="pass__label">{connected ? level.name : "Your level"}</div>
          <div className="pass__xp" style={{ marginTop: 8 }}>{String(connected ? shown : 0).padStart(3, "0")} XP</div>
          <div className="mono" style={{ marginTop: 10, fontSize: 13, color: "#A9DFEB" }}>
            {connected && connection.address ? shortAddress(connection.address) : "0x0000…0000"}
          </div>
        </div>
        <div className="pass__dots" aria-hidden="true">
          {quests.map((q) => <i key={q.id} data-on={connected && q.status === "completed"} />)}
        </div>
      </div>
    </div>
  );
}
