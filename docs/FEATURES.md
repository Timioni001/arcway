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
- **Progression**: 17 quests in four tiers, 2,145 XP in total. Each tier opens when the previous
  tier's finale is recorded:
  | Tier | Quests | XP |
  | --- | --- | --- |
  | Beginner | Arrive on Arc (1 USDC), First transaction, Explore an app, Arc Explorer (finale) | 110 |
  | Explorer | 5 transactions, 3 verified-app actions, active on 3 days, Arc Voyager (finale) | 240 |
  | Regular | 25 transactions, 10 verified-app actions, active on 7 days, hold 50 USDC, Arc Regular (finale) | 595 |
  | Advanced | 100 transactions, 25 verified-app actions, active on 20 days, Arc Pathfinder (finale) | 1,200 |
  Everything is checked on the server from Arc: USDC balance, the wallet's nonce, and its successful
  transactions from the explorer (distinct UTC days; calls to verified apps' published contracts).
- **Levels**: Newcomer 0, Arrival 35, Explorer 110, Voyager 350, Regular 945, Pathfinder 2,145 XP:
  one level per finished tier.
- **Rewards**: XP, badges (one per quest, onchain), season rewards (monthly leaderboard), collectibles
  (coming soon).
- Views: Campaigns, Leaderboard (monthly season and all time, with onchain proof).

## Passport

- **Identity** (`/passport`): card, name, level, XP, apps explored, quests done.
- **Make it yours**: display name, card design (Arc blue and Graphite included; Midnight carbon,
  Dawn contour, Prism, Pearl and Aurora holo unlock with tier finales and quest counts), avatar
  frame (Ring at 4 quests, Halo at 12) and title (First Mover, Arc Explorer, App Hopper, Resident,
  Pathfinder). Each locked piece shows what unlocks it and how far along you are. Saved in the
  browser; a locked style can never be shown even if stored.
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
