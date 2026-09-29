# Data: sources, derivation and provenance

## Sources

| Source | Used for | Code |
|---|---|---|
| Arc RPC | Balances, contract reads, transactions the user signs | wagmi / viem, `lib/config.ts` |
| Arc explorer (Blockscout v2) | Stats, daily transactions, contracts, token lists, transfers, logs | `lib/server/explorer.ts` |
| Envio indexer (optional) | Passport completions | `lib/server/indexer.ts`, `indexer/` |
| App registry | Apps, categories, builders, published contracts | `lib/registry.ts` (project-provided, reviewed) |
| Community submissions | New listings awaiting review | GitHub issues from `/submit` |

The explorer is always the fallback: when `ARCWAY_INDEXER_URL` is unset or unreachable, the same
figures are read from explorer logs.

## Flow

```text
FETCH   typed explorer reads with a timeout and a short in-process cache; settle() turns a failure into null
DERIVE  pure functions in lib/intel.ts, lib/assets.ts, lib/campaignDraw.ts (unit-tested, no I/O)
SERVE   /api/intel/* returns an envelope; CDN caches for seconds to minutes
CLIENT  TanStack Query with per-view refresh intervals (lib/hooks/useIntel.ts)
```

Envelope:

```ts
{ data, fetchedAt, network, unavailable }
```

`unavailable` names the sources that failed. If every source for a view fails, the route answers
`502 arc_unavailable` instead of an empty or guessed result.

### Endpoints

| Endpoint | Derivation | Refresh |
|---|---|---|
| `/api/intel/snapshot` | `buildSnapshot`: network metrics with periods | 60s |
| `/api/intel/pulse` | `buildPulse`: latest transactions and USDC transfers, classified | 15s |
| `/api/intel/radar` | `buildRadar`: new, verified and most-used contracts, activity shifts | 2 min |
| `/api/intel/signals` | `buildSignals`: observations with period and evidence | 60s |
| `/api/intel/protocol/[slug]` | `buildProtocol`: a listed app's published contracts | 60s |
| `/api/intel/assets` | `buildAssets`: ERC-20 tokens ranked by holders | 5 min |
| `/api/intel/asset/[address]` | `buildAssetDetail`: token counters, transfers, related apps | 60s |
| `/api/intel/passport` | `buildPassportStats`: passports, XP, leaderboard | 60s |
| `/api/campaigns/[id]/*` | Eligibility, entry signature, Merkle proof, draw results | per request |

## Provenance

Every displayed metric has a state:

| State | Meaning |
|---|---|
| Observed | Read directly from Arc or the explorer |
| Derived | Calculated from observed data (for example, related apps from recent transfers) |
| Project-provided | Published by the project team (registry listings, contracts) |
| Community | Submitted by users and not yet verified |

Metrics carry `value`, `source`, `period` and provenance. Estimates are never shown as observed facts.
When no authoritative source exists (asset prices, for example), the UI says "coming soon".
