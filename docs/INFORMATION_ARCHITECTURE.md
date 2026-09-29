# Information architecture

People first. The source of truth is `lib/nav.ts`.

## Primary navigation

```text
Home        /
Explore     /apps
Quests      /quests
Passport    /passport
More        sidebar group (desktop), /more (mobile)
```

Global utilities: Search (⌘K palette, `/search`), Connect (top bar), Settings (under More).

## More

```text
Activity       /pulse      See what is happening on Arc
What's New     /radar      See what changed
Insights       /signals    Notable patterns, with evidence
Builders       /builders
Watchlist      /watchlist
For Builders   /submit     Submit a project, launch a campaign, badges
Settings       /settings
```

Routes keep their technical names; the interface uses the plain ones.

## Views inside sections

A tab row ("Views in this section") switches between views on a section's pages, and the section
stays highlighted.

| Section | Views |
|---|---|
| Explore | Apps, Categories (`/ecosystem`), Assets, Builders, What's New, Activity |
| Quests | Quests, Campaigns (`/campaigns`), Leaderboard (`/leaderboard`) |
| For Builders | Submit a project, Launch a campaign (`/launch`), Badges (`/widgets`) |

Trails (`/trails/*`) and today's summary (`/digest`) belong to Explore. Personal pages (Your Arc,
Your activity, Pay links, Get a wallet) are in the account menu.

## Layouts

| Width | Navigation |
|---|---|
| Desktop | Sidebar: Home, Explore, Quests, Passport, then More (expands in place; open on its own pages), then Search |
| Tablet | Same sidebar, collapsed to icons, expands on demand |
| Mobile | Top bar: Logo, Search, Connect. Bottom tabs: Home, Explore, Quests, Passport, More |

## Home

For the general public. Answers: what can I do here, why should I care, what can I earn, where do I start.

1. Hero: "Explore Arc. Complete quests. Build your Passport." with Explore Arc and Start a Quest
2. Popular right now: three quests, ranked by completions recorded on Arc
3. Rewards: XP, Badges, Collectibles (coming soon), Season rewards
4. Explore Arc: Payments, Trading, Lending, Assets, Apps, Builders
5. What's new: plain-language updates (new apps, verified contracts, activity changes)
6. Your Passport: level, XP, badges, current style, recent achievements
7. How Arc works: three short points and a link to learn more

Home does not show transactions, contract counts, raw metrics or technical graphs.

## Entities

| Entity | Page | Views |
|---|---|---|
| App | `/apps/[slug]` | Overview, Activity, Contracts, Related apps |
| Builder | `/builders/[id]` | Overview, Projects, Activity, Contracts |
| Asset | `/assets/[address]` | Overview, Activity, Markets, Related apps |
| Quest | `/quests/[id]` | Steps, status, reward |
| Campaign | `/campaigns/[slug]` | Pool, tasks, entry, results |
| Passport | `/passport`, `/passport/[address]` | Identity, style, rewards, quest history, activity summary |
| Contract, Transaction, Address | Explorer | Linked from entity pages |

People reach entity pages from Explore, Quests, Passport or Search.

## Search

Apps, quests, builders, assets, badges, insights, categories, trails, contracts, transactions and
addresses. Every result is labelled with its type.
