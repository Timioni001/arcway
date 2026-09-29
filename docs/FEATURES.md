# Features

Each feature, the job it serves and where it lives. Availability is tracked in [STATUS.md](STATUS.md).

## Home

Popular quests (ranked by completions recorded on Arc), the four reward kinds, Explore tiles,
plain-language updates, your passport at a glance and a three-point "How Arc works". No raw network
data.

## Explore

- **Categories** (`/ecosystem`): map of categories, apps and builders; tap a node to trace its
  relationships. Protocol directory with category filters and observed activity per app.
- **Apps** (`/apps`, `/apps/[slug]`): goal-based trails, category and status filters, protocol pages
  with published contracts, verification, observed activity and related apps.
- **Builders** (`/builders`, `/builders/[id]`): teams and their projects.
- **For Builders** (`/submit`): Submit a project (live contract check, pre-filled GitHub issue),
  Launch a campaign, Badges (embeddable SVG).
- **Assets** (`/assets`, `/assets/[address]`): ERC-20 tokens ranked by holders. Asset page shows
  holders, supply, transfers, recent activity, related apps derived from transfers, and Markets
  (coming soon until an authoritative price source exists).

## Quests

- **Quests** (`/quests`): short tasks on real Arc apps; progress is detected from Arc and recorded on
  the passport contract. Each card shows the type (Learn, Explore, Try an app, Onchain action,
  Collect, Seasonal, Community), what you will do, the reward (XP and badge), difficulty (Beginner,
  Intermediate, Advanced) and time.
- **Progression**: Beginner, Explorer, Regular, Advanced. Beginner is live; later tiers show as coming
  soon until their quests exist.
- **Rewards**: XP, badges (one per quest, onchain), season rewards (monthly leaderboard), collectibles
  (coming soon).
- Views: Campaigns, Leaderboard (monthly season and all time, with onchain proof).

## Passport

- **Identity** (`/passport`): card, name, level, XP, apps explored, quests done.
- **Make it yours**: display name, card theme (Arc blue, Midnight, Dawn, Aurora), avatar frame (Ring,
  Halo) and title (First Mover, App Hopper, Arc Explorer). Each locked option says how to unlock it,
  for example "Complete 3 quests" or "Explore 5 Arc apps". Saved in the browser; a locked style can
  never be shown even if stored.
- **Rewards gallery**: every badge with artwork, what it is for, the quest that earns it, whether you
  hold it and how many explorers hold it.
- **Achievements, quest history, levels, activity summary**, and a public passport lookup.

## More: go deeper

- **Activity** (`/pulse`): what is happening on Arc, classified as App, Deployment, USDC, Transfer
  or Contract call, with pause and filters.
- **What's New** (`/radar`): new and verified contracts, most-used contracts, activity shifts, and
  today's summary (`/digest`, also as RSS).
- **Insights** (`/signals`): activity changes, new contracts, verifications, large transfers and new
  listings, each with period and evidence. Never investment advice.
- **Campaigns** (`/campaigns`, `/campaigns/[slug]`, `/launch`): see [CONTRACTS.md](CONTRACTS.md).
- **Watchlist** (`/watchlist`): follow apps, builders, assets and categories in this browser, with
  related signals. Alerts can build on it later.

## Across the app

- **Search**: ⌘K palette and `/search` across apps, quests, builders, assets, badges, insights,
  trails, addresses and transactions, with type labels.
- **Notifications**: latest insights in the top bar.
- **Account menu**: Your Arc, Your activity, Pay links, Get a wallet (passkey onboarding when
  configured).
- **Settings**: appearance, network, how Arcway measures, and clearing data stored in this browser.
