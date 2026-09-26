import { getWatchedApps, getWatchlistServer, subscribeWatchlist, toggleWatch, watchId } from "./watchlist";

/** Followed apps: a view over the watchlist (kept for existing call sites). */
export const getSaved = getWatchedApps;
export const getSavedServer = getWatchlistServer;
export const toggleSaved = (appId: string) => toggleWatch(watchId("app", appId));
export const subscribeSaved = subscribeWatchlist;
