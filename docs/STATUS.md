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

## Arc Mainnet (live since October 1, 2026)

| Contract | Address |
|---|---|
| ArcwayPassport | `0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c` |
| ArcwayCampaigns | `0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c` |
| Verifier (signer) | `0xF11Dd8b50714fFF3F22eEE6EC641c5dC4fC4A6f6` |

`/api/health` on production reports `claimsReady` and `campaignsReady`. Preview deployments stay on Arc Testnet.

## Feature status

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
| Campaigns | LIVE | Escrow deployed on mainnet; projects can launch funded campaigns |
| Arc Mainnet | LIVE | Passport and Campaigns deployed, verifier authorised and funded |

## Planned

- Seasonal and community quests
- Passport styles that follow you across devices (signed profile)
- Alerts on watchlist items
- Contract and transaction entity pages inside Arcway (explorer links today)
- Integration detection between apps
- Partner-created quests and a public API
- EIP-712 attestations for passport records
