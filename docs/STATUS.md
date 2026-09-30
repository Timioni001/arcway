# Status

What is live, built or blocked. Architecture lives in [ARCHITECTURE.md](ARCHITECTURE.md); this file
changes with every release.

| Status | Meaning |
|---|---|
| LIVE | Deployed and working for users |
| BUILT | Code complete and tested; waiting on configuration or deployment |
| BLOCKED | Needs something outside the codebase |
| COMING SOON | Shown in the UI as coming soon |
| PLANNED | Agreed, not started |

## Current (Arc Testnet)

| Area | Status | Notes |
|---|---|---|
| Home, Explore, Categories, Builders | LIVE | |
| Assets list and asset pages | LIVE | Reads the explorer token list |
| Asset markets (prices) | COMING SOON | No authoritative price source for Arc yet |
| Activity, What's New, today's summary, Insights | LIVE | Explorer-backed, with provenance; under More |
| Search, Watchlist, Settings | LIVE | Watchlist is stored per browser |
| Quests (Beginner tier) and Passport | LIVE | Passport contract `0xa8a4A8FdE3fdCe351b9b22ACc3368e3b308b0107` |
| Passport styles (name, themes, frames, titles) | LIVE | Offchain, saved per browser |
| Quest tiers Explorer, Regular, Advanced | COMING SOON | Need new quests with onchain checks |
| Collectibles | COMING SOON | |
| Leaderboard and onchain proof | LIVE | |
| Submit a project, Badges, RSS | LIVE | Listings reviewed through GitHub issues |
| Envio indexer | BUILT | Deploy `indexer/` and set `ARCWAY_INDEXER_URL`; explorer fallback until then |
| Passkey wallets | BLOCKED | Needs a Circle Client Key, passkey domain and Gas Station policy |
| Campaigns | BUILT | Deploy `ArcwayCampaigns` and set `NEXT_PUBLIC_CAMPAIGNS_CONTRACT`; preview works now |
| Arc Mainnet | BLOCKED | Code ready and rehearsed on a local mainnet chain; needs the owner to deploy contracts, fund the verifier and switch Vercel (see DEPLOYMENT.md) |

## Planned

- Seasonal and community quests
- Passport styles that follow you across devices (signed profile)
- Alerts on watchlist items
- Contract and transaction entity pages inside Arcway (explorer links today)
- Integration detection between apps
- Partner-created quests and a public API
- EIP-712 attestations for passport records
