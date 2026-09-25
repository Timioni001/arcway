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

## Development

```bash
npm install
cp .env.example .env.local   # defaults to Arc Testnet
npm run dev
npm test                     # journey, quest, registry and helper logic
npm run typecheck
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

For contracts:

```bash
cd contracts
forge install
forge test
```

Never commit private keys or Circle secrets.
