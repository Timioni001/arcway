# Arcway

**Arc ecosystem intelligence: understand what's happening on Arc.**

Arc Portal is where you act on Arc. Arcway is where you understand it: which applications exist, what is happening onchain right now, what changed, who is building, and what is worth following. Discovery, quests and a passport sit on top of that.

## Features

### Intelligence
- **Overview**: live network snapshot, ecosystem map, Arc Pulse, Arc Radar, featured protocol, builder activity and signals.
- **Ecosystem**: interactive map of categories, apps, builders and published contracts, plus a protocol directory with observed activity.
- **Pulse**: live feed of app interactions, contract deployments and USDC movement, each linked to its transaction.
- **Radar**: what changed in the last 24 hours or 7 days, newly verified contracts, most used contracts, new listings.
- **Signals**: factual, rule-based observations (activity shifts, verifications, large transfers) with evidence links. Never advice.
- **Protocol pages**: identity, official links, published contracts with verification status, transaction counts, activity timeline, related protocols.

### Participation
- **Apps**: browse by category, status and goal, with guided trails.
- **Quests**: the Arc Starter campaign, checked automatically from onchain activity; claim XP for free.
- **Passport**: XP, levels and badges, with a public, shareable page for every wallet.
- **Watchlist**: follow protocols, builders and categories, with signals for what you follow.

### Everywhere
- Ctrl/Cmd+K search across protocols, builders, categories, quests, addresses and transaction hashes.
- Notifications for new signals, light/dark/system themes, installable on phones, pay links, one-click "Add Arc to wallet".

## Data trust

Every number shows its source and the period it covers:

| Label | Meaning |
| --- | --- |
| Observed | Read directly from Arc's explorer index (Blockscout API). |
| Derived | Calculated from observed data; the method and period are shown. |
| Project-provided | Supplied by the app team (the Arcway registry). |
| Community | User-submitted. Not used yet. |

Arcway never fabricates TVL, volume, users, growth, rewards or security status. When the explorer can't be reached, the UI says so and shows nothing rather than a guess. Server reads live in `lib/server/explorer.ts`; all derivations are pure functions in `lib/intel.ts` with unit tests.

## MVP

The first release is intentionally small:

1. Connect an EVM wallet.
2. Show the user's Arc USDC balance.
3. Discover a curated set of Arc apps.
4. Show starter quests.
5. Track completed quests and XP.
6. Read the user's Arc activity.
7. Provide a path into Circle's USDC cross-chain infrastructure.

## Current status

This repository is a **mainnet-ready development scaffold**, not a claim that the contracts have already been deployed.

Use Arc testnet while developing. Mainnet uses real USDC and transactions are irreversible.

## Stack

- Next.js + TypeScript
- wagmi + viem
- Solidity
- Foundry
- Circle App Kit / Bridge Kit where appropriate
- Arc Mainnet
- Optional Postgres/Supabase for curated app metadata
- Optional indexer for activity and quest verification

## Network

Arc Mainnet:
- Chain ID: `5042`
- RPC: `https://rpc.mainnet.arc.io`
- Gas: USDC
- EVM-compatible

See `docs/ARCHITECTURE.md` for the complete design and deployment plan.

## Deploy

See `docs/DEPLOY.md` for step-by-step Vercel instructions (no local setup needed).

## Development

```bash
npm install
cp .env.example .env.local   # defaults to Arc Testnet
npm run dev
npm test                     # unit tests: journey, quests, registry, streaks, helpers
npm run typecheck
npm run build && npm run test:e2e   # browser tests on desktop and phone sizes
```

Without `NEXT_PUBLIC_PASSPORT_CONTRACT` and `VERIFIER_PRIVATE_KEY` the app runs
with recording disabled: progress is still detected and shown, and users are
told recording opens soon.

## Code map

- `lib/config.ts` – chain, USDC and explorer constants (one place).
- `lib/journey.ts` – the "what should I do next?" engine.
- `lib/quests.ts` – quest definitions, XP and status logic.
- `lib/registry.ts` – curated app registry and discovery logic.
- `lib/server/verify.ts` – server-side quest verification.
- `app/api/*` – progress, activity and claim endpoints.
- `docs/UX.md` – every user-facing state and why it exists.
- `docs/UI_BRIEF.md` – visual system brief; `app/globals.css` holds its tokens.
- `app/components.css` – component styles, one block per component.

## UI

Follows the V2 brief in `docs/UI_BRIEF.md`: white-first, one ice→navy blue
spectrum, light and dark themes (toggle in the header, follows the system by
default). Tokens live in `app/globals.css`; component styles in
`app/components.css`.

Routes: `/`, `/apps`, `/apps/[slug]`, `/quests`, `/quests/[id]`, `/builders`,
`/passport`.

Accessibility note: white text on the signature blue `#3D91BE` is only 3.5:1,
so buttons and links use royal `#2464A5` (6.1:1). `#3D91BE` stays the brand
colour for the hero forms, progress, focus and accents.

Every push runs CI (`.github/workflows/ci.yml`): typecheck, unit tests, build,
browser tests, and the contract tests.

To add an app: add an entry to `APPS` in `lib/registry.ts` (optional logo in
`public/apps/`). It gets a detail page, and its builder appears on
`/builders` automatically. Only list `contracts` that the team publishes
themselves, per network, with `verification.sourceUrl` pointing at that source;
that's what makes an app "Verified" and lets it count for the app quest.

The Arc logo in `public/brand/arc/` is Circle's official file, used unmodified
for "Built on Arc" attribution only. See `public/brand/arc/NOTICE.md`.

