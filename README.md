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

### Build on Arc
- **Submit a project**: builders list their Arc mainnet app in two minutes. Contract addresses are checked live on the explorer, the submission opens as a pre-filled GitHub issue, and the app shows with a Community label until reviewed.
- **Badges**: a live "on Arc" SVG badge for any listed app (`/api/badge/<slug>`), with Markdown and HTML snippets.
- **Arc today**: a daily digest page and an RSS feed (`/digest/feed.xml`) of signals.
- **Onchain proof and leaderboard**: passports issued, XP recorded and a monthly-season leaderboard, all read from the Arcway Passport contract's events.

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
- Envio HyperIndex indexer for passport data (`indexer/`), with the Arc explorer as fallback
- Circle Modular Wallets for passkey wallets (optional, `NEXT_PUBLIC_CIRCLE_CLIENT_KEY`)

## Indexer

`indexer/` is an [Envio HyperIndex](https://docs.envio.dev) project for the Arcway Passport on Arc:
every `QuestCompleted` and `BadgeAwarded` event becomes a queryable row (completions, explorers,
daily totals). Deploy it on Envio's hosted service and set `ARCWAY_INDEXER_URL`; the app then reads
passport stats and the leaderboard from it, and falls back to the Arc explorer when it is unset or
down. See `indexer/README.md`.

## Campaigns

Projects can launch live campaigns with a USDC prize pool (`/launch`), and people join for free
(`/campaigns`). The pool is locked in `contracts/src/ArcwayCampaigns.sol`:

- **First come**: a fixed reward paid on entry until the pool runs out.
- **Prize draw**: N winners drawn after the end; **Shared pool**: split equally between entrants.
- Entry needs a signature from Arcway's verifier after it checks the tasks on Arc (use the app,
  hold USDC, finish an Arcway quest). Draw results are computed from the on-chain entries and the
  hash of the first Arc block after the end, published as a Merkle root, and claimed with a proof.
- Neither Arcway nor the verifier can withdraw a pool. Only the project can take leftovers back:
  before it starts, if nobody joined, if results are 3 days late, or after the claim window.

Launching creates the campaign on chain; the project then sends it for listing (a pre-filled issue
with the description hash stored on chain). Deploy with `contracts/script/DeployCampaigns.s.sol` and
set `NEXT_PUBLIC_CAMPAIGNS_CONTRACT`.

## Passkey wallets

`/wallet` lets newcomers create an Arc wallet with a passkey (Face ID, fingerprint or device PIN):
a Circle smart account with no seed phrase, and gas sponsored through Circle's Gas Station. It
connects through wagmi like any wallet. Set `NEXT_PUBLIC_CIRCLE_CLIENT_KEY` (Circle Console > Keys >
Client Keys), register the site's domain as the passkey domain, and add a Gas Station policy for
Arc. Without a key the page shows it as coming soon and points to wallet apps instead.

## Network

Arc Mainnet:
- Chain ID: `5042`
- RPC: `https://rpc.mainnet.arc.io`
- Gas: USDC
- EVM-compatible

See `docs/` for the full set: ARCHITECTURE, PRODUCT, INFORMATION_ARCHITECTURE, UI_UX, DATA,
CONTRACTS, FEATURES, DEPLOYMENT and STATUS.

## Deploy

See `docs/DEPLOYMENT.md` for step-by-step Vercel instructions (no local setup needed).

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
- `lib/nav.ts` – information architecture: sections, views inside sections, mobile tabs.
- `docs/UI_UX.md` – interface system and every user-facing state; `app/globals.css` holds its tokens.
- `app/components.css` – component styles, one block per component.

## UI

Follows `docs/UI_UX.md`: white-dominant, one blue accent, deep-blue dark mode
(theme toggle in the sidebar and Settings; follows the system by default). Tokens live in `app/globals.css`; component styles in
`app/components.css`.

Navigation (see `docs/INFORMATION_ARCHITECTURE.md`): Overview; Discover (Ecosystem, Apps,
Builders, Assets); Intelligence (Pulse, Radar, Signals); Participate (Quests, Watchlist); Search;
Settings.

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

