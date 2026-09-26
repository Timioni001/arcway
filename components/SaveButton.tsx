'use client';

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getSaved, getSavedServer, subscribeSaved } from "../lib/saved";
import { getWatchlist, getWatchlistServer, subscribeWatchlist, toggleWatch, watchId, type WatchKind } from "../lib/watchlist";

export function useSavedApps() {
  return useSyncExternalStore(subscribeSaved, getSaved, getSavedServer);
}

export function useWatchlist() {
  return useSyncExternalStore(subscribeWatchlist, getWatchlist, getWatchlistServer);
}

/** Follow toggle for anything on the watchlist. Kept in this browser only. */
export function FollowButton({ kind, id, name, variant = "full" }: { kind: WatchKind; id: string; name: string; variant?: "icon" | "full" }) {
  const key = watchId(kind, id);
  const following = useWatchlist().includes(key);
  const Icon = following ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      className={variant === "icon" ? "save-btn" : `btn btn--secondary${following ? " is-following" : ""}`}
      aria-pressed={following}
      aria-label={variant === "icon" ? `${following ? "Unfollow" : "Follow"} ${name}` : undefined}
      data-saved={following}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatch(key);
      }}
    >
      <Icon aria-hidden="true" />
      {variant === "full" && (following ? "Following" : "Follow")}
    </button>
  );
}

/** Follow an app (kept name for existing call sites). */
export function SaveButton({ appId, name, variant = "icon" }: { appId: string; name: string; variant?: "icon" | "full" }) {
  return <FollowButton kind="app" id={appId} name={name} variant={variant} />;
}
