'use client';

import { BOUNTIES_CONTRACT } from "../lib/config";
import { SponsoredQuests } from "./Bounties";
import { BountyStats, StudioBadge } from "./BountyFeed";

/** The Quests page block: only shown once ArcwayBounties is live. */
export function SponsoredQuestsSection() {
  if (!BOUNTIES_CONTRACT) return null;
  return (
    <>
      <div className="row between" style={{ marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 className="h3">Sponsored quests</h2>
        <StudioBadge />
      </div>
      <BountyStats />
      <SponsoredQuests />
    </>
  );
}
