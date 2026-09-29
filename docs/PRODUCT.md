# Arcway product

## Purpose

Arcway is an intelligence and discovery layer for the Arc ecosystem. It helps people:

- discover applications and builders
- understand network activity
- inspect protocols, contracts, assets and transactions
- monitor changes and signals
- take part through quests, campaigns and watchlists

## Boundary

```text
Arc → Arc Portal: use Arc → Arcway: understand and inspect Arc
```

Arcway does not replace Arc Portal for wallet creation, funding, swapping, sending, earning or agent
execution. Where a user needs to act, Arcway links to the app or portal that does it.

Wallet features are supporting infrastructure only:

- wallet connection (wagmi)
- passkey onboarding where configured (Circle Modular Wallets, `/wallet`)
- sponsored transactions where configured

Every transaction is explicit and signed by the user. Arcway never holds user funds; campaign pools
sit in the campaign contract, separate from Arcway's own funds.

## Users and jobs

| User | Job | Where |
|---|---|---|
| Newcomer | Understand what Arc is and what to try | Overview, Apps, Quests |
| Explorer | Find apps, builders and assets | Discover |
| Analyst | See what changed and what is active, with evidence | Pulse, Radar, Signals |
| Participant | Follow things and earn XP or rewards | Watchlist, Quests, Campaigns |
| Builder | Get listed, show activity, reward users | Builders views: Submit, Launch a campaign, Badges |

## Principles

- Works without a wallet. Connecting is only needed to record progress or join a campaign.
- Never guess. A number without a source shows "coming soon" or "unavailable".
- Observation, not advice. Radar and Signals describe what happened; they never recommend.
