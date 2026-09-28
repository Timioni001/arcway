# Arcway indexer

An [Envio HyperIndex](https://docs.envio.dev) project that indexes the Arcway Passport
contract on Arc. It turns every `QuestCompleted` and `BadgeAwarded` event into rows the app
can query in one request, instead of re-reading the contract's whole log history from the
explorer each time.

| Entity | What it holds |
|---|---|
| `Completion` | Every quest completion: wallet, quest, XP, time, transaction |
| `Explorer` | Per wallet: total XP, completions, badges, first and last activity |
| `DailyStat` | Per UTC day: completions, XP, first-time explorers |
| `Totals` | Running totals (`id: "global"`) |

Arc Testnet (chain `5042002`) is supported by Envio's HyperSync. Add the mainnet chain to
`config.yaml` once the passport is deployed there.

## Run it

```bash
cd indexer
npm install
cp .env.example .env          # set ENVIO_PASSPORT_ADDRESS (and ENVIO_START_BLOCK)
npm run codegen
npm run dev                   # local Postgres + GraphQL at http://localhost:8080 (needs Docker)
```

## Deploy

Push this folder to Envio's hosted service (free development tier), then set the GraphQL
endpoint it gives you in the web app's environment:

```
ARCWAY_INDEXER_URL=https://indexer.hyperindex.xyz/<id>/v1/graphql
```

The app reads passport stats, the leaderboard and seasons from the indexer when this is set,
and falls back to the Arc explorer when it is not set or not reachable. Every response says
which source it came from.
