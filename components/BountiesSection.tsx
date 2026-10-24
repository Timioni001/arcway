'use client';

import { BOUNTIES_CONTRACT } from "../lib/config";
import { SponsoredQuests } from "./Bounties";

/** The Quests page block: only shown once ArcwayBounties is live. */
export function SponsoredQuestsSection() {
  if (!BOUNTIES_CONTRACT) return null;
  return (
    <>
      <h2 className="h3" style={{ marginBottom: 16 }}>Sponsored quests</h2>
      <SponsoredQuests />
    </>
  );
}
