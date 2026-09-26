'use client';

import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getSaved, getSavedServer, subscribeSaved, toggleSaved } from "../lib/saved";

export function useSavedApps() {
  return useSyncExternalStore(subscribeSaved, getSaved, getSavedServer);
}

/** Heart toggle. Saved apps live in this browser only. */
export function SaveButton({ appId, name, variant = "icon" }: { appId: string; name: string; variant?: "icon" | "full" }) {
  const saved = useSavedApps().includes(appId);
  return (
    <button
      type="button"
      className={variant === "icon" ? "save-btn" : "btn btn--secondary"}
      aria-pressed={saved}
      aria-label={variant === "icon" ? `${saved ? "Remove" : "Save"} ${name}` : undefined}
      data-saved={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(appId);
      }}
    >
      <Heart aria-hidden="true" />
      {variant === "full" && (saved ? "Saved" : "Save")}
    </button>
  );
}
