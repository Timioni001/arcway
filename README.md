# Arcway

**Arcway is an onboarding and discovery layer for Arc.**

It combines:
- Arc app discovery
- cross-chain USDC onboarding
- quests
- on-chain reputation / passport
- ecosystem activity

The product goal is simple:

> **Help a user enter Arc, know what to do next, complete useful actions, and build a portable record of their Arc activity.**

## Features

- **Discover**: live Arc apps by category, search, saved apps, and guided trails (step-by-step paths like "Earn on your USDC").
- **Quests**: the Arc Starter campaign, checked automatically from onchain activity; claim XP for free.
- **Passport**: XP, levels and badges on Arc, with a public, shareable page and preview image for every wallet.
- **Pay links**: request USDC with a link or QR code; payers send in a couple of taps.
- **Overview**: XP, day streak, 14-day activity, network status, live fee calculator.
- **Everywhere**: Ctrl/Cmd+K search with quick actions, one-click "Add Arc to wallet", light/dark themes, installable on phones.

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

