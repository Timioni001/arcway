'use client';

import { Check, Lock } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useArcwayState } from "../lib/hooks/context";
import { usePassportStyle } from "../lib/hooks/usePassportStyle";
import { cleanName, isUnlocked, itemsOf, unlockProgress, unlockText, unlockedCount, type StyleItem, type StyleKind } from "../lib/passportStyle";
import { AddressAvatar } from "./AddressAvatar";
import { CardArt } from "./CardArt";

const TABS: { kind: StyleKind; label: string }[] = [
  { kind: "theme", label: "Card designs" },
  { kind: "frame", label: "Frames" },
  { kind: "title", label: "Titles" }
];

/** What the item looks like: a small card, a framed avatar, or the title chip. */
function Preview({ item, address }: { item: StyleItem; address?: string }) {
  if (item.kind === "theme") return <span className="pass pass--mini" data-theme={item.id} aria-hidden="true"><CardArt theme={item.id} /></span>;
  if (item.kind === "frame") return <span className="pcol__stage" aria-hidden="true"><span className="avatar-frame" data-frame={item.id}><AddressAvatar address={address} /></span></span>;
  return <span className="pcol__stage" aria-hidden="true">{item.id === "none" ? <span className="pcol__notitle">No title</span> : <span className="pstage__title-chip">{item.name}</span>}</span>;
}

/**
 * "Make it yours": a collection of card designs, frames and titles. What you own comes first and
 * can be used with one tap; locked pieces sit together below, closest to unlocking first, each
 * with exactly what to do and how far along you are.
 */
export function PassportCustomizer() {
  const { connection } = useArcwayState();
  const { style, progress, update, address } = usePassportStyle();
  const [name, setName] = useState(style.name);
  const [tab, setTab] = useState<StyleKind>("theme");
  const nameId = useId();
  const tabsId = useId();
  useEffect(() => setName(style.name), [style.name]);
  const { unlocked, total } = unlockedCount(progress);
  const preview = connection.status !== "connected" || !address;

  const items = itemsOf(tab);
  const owned = items.filter((i) => !i.unlock || (!preview && isUnlocked(i, progress)));
  const locked = items
    .filter((i) => !owned.includes(i))
    .map((i) => ({ item: i, at: unlockProgress(i, progress) ?? { have: 0, need: 1 } }))
    .sort((a, b) => b.at.have / b.at.need - a.at.have / a.at.need);

  return (
    <div className="pcol" data-preview={preview || undefined}>
      <div className="pcol__top">
        <div className="pcol__meter">
          <span className="pcol__count"><b className="mono">{preview ? 0 : unlocked}</b>/{total} unlocked</span>
          <span className="pcol__bar" aria-hidden="true"><i style={{ width: `${((preview ? 0 : unlocked) / total) * 100}%` }} /></span>
          <span className="xs secondary">{preview ? "Connect your wallet to style your passport. Styles unlock as you complete quests and explore apps." : "Saved in this browser, not onchain."}</span>
        </div>
        {!preview && (
          <div className="pcol__name">
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
        )}
      </div>

      <div className="pcol__tabs" role="tablist" aria-label="Style">
        {TABS.map((t) => {
          const all = itemsOf(t.kind);
          const have = all.filter((i) => !i.unlock || (!preview && isUnlocked(i, progress))).length;
          return (
            <button key={t.kind} type="button" role="tab" id={`${tabsId}-${t.kind}`} aria-selected={tab === t.kind} aria-controls={`${tabsId}-panel`} onClick={() => setTab(t.kind)}>
              {t.label}<span className="mono">{have}/{all.length}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${tab}`} className="pcol__panel" data-kind={tab}>
        <h3 className="pcol__group">Yours</h3>
        <ul className="pcol__grid">
          {owned.map((item) => {
            const current = !preview && style[item.kind] === item.id;
            return (
              <li key={item.id}>
                <button type="button" className="pcol__item" aria-pressed={current} disabled={preview} onClick={() => update({ [item.kind]: item.id })}>
                  <Preview item={item} address={address} />
                  <span className="pcol__meta">
                    <span className="pcol__name-text">{item.name}</span>
                    <span className="pcol__state">{current ? <><Check aria-hidden="true" />In use</> : preview ? "Included" : "Tap to use"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {locked.length > 0 && (
          <>
            <h3 className="pcol__group">Locked <span className="mono">{locked.length}</span><small>Closest first</small></h3>
            <ul className="pcol__grid pcol__grid--locked swipe swipe--narrow">
              {locked.map(({ item, at }) => (
                <li key={item.id} className="pcol__item pcol__item--locked">
                  <span className="pcol__lockwrap">
                    <Preview item={item} address={address} />
                    <span className="pcol__lock"><Lock aria-hidden="true" /></span>
                  </span>
                  <span className="pcol__meta">
                    <span className="pcol__name-text">{item.name}</span>
                    <span className="pcol__how">{unlockText(item)}</span>
                    <span className="pcol__prog" role="progressbar" aria-label={`${item.name}: ${at.have} of ${at.need}`} aria-valuemin={0} aria-valuemax={at.need} aria-valuenow={at.have}>
                      <span className="pcol__bar"><i style={{ width: `${(at.have / at.need) * 100}%` }} /></span>
                      <span className="mono xs">{at.have}/{at.need}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
