# Features

Each feature, the job it serves and where it lives. Availability is tracked in [STATUS.md](STATUS.md).

## Discover

- **Ecosystem** (`/ecosystem`): map of categories, apps and builders; tap a node to trace its
  relationships. Protocol directory with category filters and observed activity per app.
- **Apps** (`/apps`, `/apps/[slug]`): goal-based trails, category and status filters, protocol pages
  with published contracts, verification, observed activity and related apps.
- **Builders** (`/builders`, `/builders/[id]`): teams and their projects. Views: Submit a project
  (live contract check, pre-filled GitHub issue), Launch a campaign, Badges (embeddable SVG).
- **Assets** (`/assets`, `/assets/[address]`): ERC-20 tokens ranked by holders. Asset page shows
  holders, supply, transfers, recent activity, related apps derived from transfers, and Markets
  (coming soon until an authoritative price source exists).

## Intelligence

- **Pulse** (`/pulse`): latest activity classified as App, Deployment, USDC, Transfer or Contract
  call, with pause and filters.
- **Radar** (`/radar`): network snapshot, new and verified contracts, most-used contracts, activity
  shifts. View: Arc today (`/digest`, also as RSS).
- **Signals** (`/signals`): activity changes, new contracts, verifications, large transfers,
  most-used contracts and new listings, each with period and evidence. Never investment advice.

## Participate

- **Quests** (`/quests`): short tasks on real Arc apps; progress is detected from Arc and recorded on
  the passport contract. Views: Campaigns, Leaderboard (monthly season and all time, with onchain
  proof), Passport (XP, level, badges, public share page).
- **Campaigns** (`/campaigns`, `/campaigns/[slug]`, `/launch`): see [CONTRACTS.md](CONTRACTS.md).
- **Watchlist** (`/watchlist`): follow apps, builders, assets and categories in this browser, with
  related signals. Alerts can build on it later.

## Across the app

- **Search**: ⌘K palette and `/search` across apps, builders, assets, signals, quests, trails,
  addresses and transactions, with entity type labels.
- **Notifications**: latest signals in the top bar.
- **Account menu**: Your Arc, Your activity, Pay links, Get a wallet (passkey onboarding when
  configured).
- **Settings**: appearance, network, how Arcway measures, and clearing data stored in this browser.
