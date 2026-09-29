'use client';

import { Check, Lock } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useArcwayState } from "../lib/hooks/context";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { cleanName, isUnlocked, itemsOf, unlockText, unlockedCount, type StyleKind } from "../lib/passportStyle";

const KIND_TITLE: Record<StyleKind, string> = { theme: "Card theme", frame: "Avatar frame", title: "Title" };

/** "Make it yours": name, theme, frame and title. Locked options say exactly how to unlock them. */
export function PassportCustomizer() {
  const { connection } = useArcwayState();
  const { style, progress, update, address } = usePassportStyle();
  const [name, setName] = useState(style.name);
  const nameId = useId();
  useEffect(() => setName(style.name), [style.name]);
  const { unlocked, total } = unlockedCount(progress);

  if (connection.status !== "connected" || !address) {
    return <p className="small secondary">Connect your wallet to style your passport. Styles unlock as you complete quests and explore apps.</p>;
  }
  return (
    <div className="pstyle">
      <p className="xs secondary">{unlocked} of {total} styles unlocked · saved in this browser, not onchain</p>
      <div className="pstyle__field">
        <label htmlFor={nameId} className="pstyle__label">Display name</label>
        <input
          id={nameId}
          className="input"
          maxLength={24}
          placeholder="Add a name"
          value={name}
          onChange={(e) => setName(cleanName(e.target.value))}
          onBlur={() => update({ name })}
          onKeyDown={(e) => { if (e.key === "Enter") update({ name }); }}
        />
      </div>
      {(["theme", "frame", "title"] as StyleKind[]).map((kind) => (
        <fieldset key={kind} className="pstyle__field">
          <legend className="pstyle__label">{KIND_TITLE[kind]}</legend>
          <div className="pstyle__options">
            {itemsOf(kind).map((item) => {
              const open = isUnlocked(item, progress);
              const current = style[kind] === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className="pstyle__opt"
                  data-kind={kind}
                  data-value={item.id}
                  aria-pressed={current}
                  disabled={!open}
                  onClick={() => update({ [kind]: item.id })}
                >
                  {kind === "theme" && <span className="pstyle__swatch" data-theme={item.id} aria-hidden="true" />}
                  <span className="pstyle__opt-text">
                    <span className="pstyle__opt-name">{item.name}</span>
                    {!open && <span className="xs secondary">{unlockText(item)}</span>}
                  </span>
                  {current ? <Check aria-hidden="true" /> : !open ? <Lock aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      <p className="xs secondary">Apps explored counts apps you opened from Arcway in this browser ({progress.apps} so far).</p>
    </div>
  );
}
