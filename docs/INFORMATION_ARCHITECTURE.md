# Information architecture

Navigation is organised around user jobs, not features. The source of truth is `lib/nav.ts`.

## Primary navigation

```text
Overview

DISCOVER
  Ecosystem      /ecosystem
  Apps           /apps
  Builders       /builders
  Assets         /assets

INTELLIGENCE
  Pulse          /pulse
  Radar          /radar
  Signals        /signals

PARTICIPATE
  Quests         /quests
  Watchlist      /watchlist

Search           ⌘K palette, /search
Settings         /settings
```

## Views inside sections

Features that do not need their own navigation item live inside a section. On a section's pages a
tab row ("Views in this section") switches between them, and the sidebar keeps the section
highlighted.

| Section | Views |
|---|---|
| Builders | Directory, Submit a project (`/submit`), Launch a campaign (`/launch`), Badges (`/widgets`) |
| Radar | Changes, Arc today (`/digest`) |
| Quests | Quests, Campaigns (`/campaigns`), Leaderboard (`/leaderboard`), Passport (`/passport`) |
| Apps | Trails (`/trails/*`) open from the Apps page |

Personal pages (Your Arc `/overview`, Your activity, Pay links, Get a wallet) are in the account
menu, not the sidebar.

## Layouts

| Width | Navigation |
|---|---|
| Desktop (1200px and up) | Persistent left sidebar, collapsible; the choice is remembered |
| Tablet (768–1199px) | Collapsed icon sidebar that expands on demand |
| Mobile (below 768px) | Top bar: Logo, Search, Connect, Menu. Bottom tabs: Overview, Explore, Pulse, Radar, Watchlist |

On mobile, Explore is active on every Discover page. Menu (`/more`) lists the complete information
architecture, including views inside sections.

## Entities

New information attaches to an existing entity or view before it becomes a new destination.

| Entity | Page | Views |
|---|---|---|
| App / Protocol | `/apps/[slug]` | Overview, Activity, Contracts, Related apps |
| Builder | `/builders/[id]` | Overview, Projects, Activity, Contracts |
| Asset | `/assets/[address]` | Overview, Activity, Markets, Related apps |
| Contract, Transaction, Address | Explorer | Linked from every entity row |
| Signal | `/signals` | Type, detection period, evidence |
| Quest | `/quests/[id]` | Steps, status, XP |
| Campaign | `/campaigns/[slug]` | Pool, tasks, entry, results |
| Watchlist | `/watchlist` | Apps, builders, assets, categories, related signals |

## Overview (home)

In order, all readable without a wallet:

1. Hero
2. Intent paths
3. Arc at a glance
4. Arc right now
5. Ecosystem preview (the full map lives in Ecosystem)
6. What changed
7. Application discovery
8. Builder discovery
9. Live activity preview
10. Quests

## Universal search

One palette (⌘K, `/`) across Apps, Builders, Assets, Contracts, Transactions, Addresses, Signals,
Quests, Trails and pages. Every result is labelled with its entity type before it opens. Pasting an
address or transaction hash offers the matching app, asset, passport or explorer page.
