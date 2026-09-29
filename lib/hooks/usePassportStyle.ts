'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_STYLE, STYLE_EVENT, loadStyle, resolveStyle, saveStyle, type PassportStyle, type StyleProgress } from "../passportStyle";
import { visitedApps } from "../visited";
import { useArcwayState } from "./context";

/** Progress that unlocks styles: quests recorded onchain, apps opened from Arcway in this browser. */
export function useStyleProgress(): StyleProgress {
  const { quests, connection } = useArcwayState();
  const connected = connection.status === "connected";
  const [apps, setApps] = useState(0);
  useEffect(() => setApps(visitedApps().length), []);
  return useMemo(() => {
    const questIds = connected ? quests.filter((q) => q.status === "completed").map((q) => q.id) : [];
    return { quests: questIds.length, apps, questIds };
  }, [quests, connected, apps]);
}

/** The connected wallet's passport style, resolved against what it has unlocked. */
export function usePassportStyle() {
  const { connection } = useArcwayState();
  const address = connection.status === "connected" ? connection.address : undefined;
  const progress = useStyleProgress();
  const [stored, setStored] = useState<Partial<PassportStyle> | null>(null);
  useEffect(() => {
    const sync = () => setStored(address ? loadStyle(address) : null);
    sync();
    window.addEventListener(STYLE_EVENT, sync);
    return () => window.removeEventListener(STYLE_EVENT, sync);
  }, [address]);
  const style = useMemo(() => (address ? resolveStyle(stored, progress) : DEFAULT_STYLE), [address, stored, progress]);
  const update = useCallback((patch: Partial<PassportStyle>) => {
    if (!address) return;
    saveStyle(address, resolveStyle({ ...style, ...patch }, progress));
  }, [address, style, progress]);
  return { style, progress, update, address };
}
