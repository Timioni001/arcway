# Arcway architecture

This document defines structure only. Product purpose is in [PRODUCT.md](PRODUCT.md), navigation in
[INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), and what is live today in [STATUS.md](STATUS.md).

## Product hierarchy

```text
                  ARCWAY
                     │
          ┌──────────┴──────────┐
       PUBLIC                 DEEP (More)
   Home · Explore           Activity
   Quests · Passport        What's New
          │                 Insights
          └──────────┬──────────┘
                  ENTITIES
        Apps · Builders · Assets
         Contracts · Transactions
                     │
                   DATA
                     │
                    ARC
```

People enter through discovery and participation. Technical data (addresses, hashes, raw calls,
network metrics) appears only on the deeper pages and entity pages.

## System

```text
Browser
  ├── Next.js / React (App Router)
  ├── wagmi / viem        wallet connection, explicit user-signed transactions
  └── TanStack Query      client cache for /api/* reads
          │
          ▼
     API / Server (Next.js route handlers, Vercel)
          ├── Arc RPC
          ├── Arc explorer (Blockscout v2 API)
          ├── Envio indexer (optional, ARCWAY_INDEXER_URL)
          └── Verifier (quest and campaign checks, signs with VERIFIER_PRIVATE_KEY)
          │
          ▼
      Arc (testnet or mainnet, one network per deployment)
```

## Data flow

Every live number goes through the same three stages. Details in [DATA.md](DATA.md).

```text
FETCH   lib/server/explorer.ts, lib/server/indexer.ts   typed reads, timeouts, short cache
DERIVE  lib/intel.ts, lib/assets.ts, lib/campaignDraw.ts pure functions, unit-tested
SERVE   app/api/intel/*                                  { data, fetchedAt, network, unavailable }
```

## Repository

| Path | Responsibility |
|---|---|
| `app/` | Routes, layouts and API endpoints |
| `components/` | Reusable UI and interactive components |
| `lib/` | Configuration, navigation (`nav.ts`), registries, pure derivations |
| `lib/server/` | Server-only RPC, explorer, verifier, indexer and rate-limit logic |
| `lib/hooks/` | Client state and data hooks |
| `contracts/` | Foundry contracts, tests and deployment scripts |
| `indexer/` | Envio configuration, schema and event handlers |
| `tests/` | Unit (Vitest) and end-to-end (Playwright) tests |
| `docs/` | This documentation set |
| `marketing/` | Launch posts and graphics (not part of the app) |
| `public/` | Static assets and official brand marks |

## Onchain components

Two contracts, both participation infrastructure rather than the intelligence layer. See
[CONTRACTS.md](CONTRACTS.md).

- **ArcwayPassport**: XP, badges and verified quest completion (proof of activity).
- **ArcwayCampaigns**: project-funded USDC prize pools with entry, results, claims and refunds.

The visual passport (name, theme, frame, title) is an application layer on top of that proof, kept
offchain so it can change freely.

## Architecture rules

1. Do not add a sidebar item when a feature can live inside an existing section.
2. Do not create a new entity page when the information belongs to an existing entity.
3. Do not duplicate the same data in multiple independent systems.
4. Do not expose technical data before the user needs it.
5. Every metric has a source and a period.
6. Arcway is a discovery, participation and identity product, not a replacement for Arc Portal.
8. Public pages lead with people's jobs; protocol terms appear only after the user has a reason to care.
7. Every new feature answers: which user job does it serve, which entity does it belong to, which
   existing view should contain it, and what new data does it require?

## Core principle

```text
COME IN → SEE SOMETHING INTERESTING → START A QUEST → EARN SOMETHING
        → MAKE YOUR PASSPORT YOUR OWN → DISCOVER MORE → OPTIONALLY GO DEEPER
```
