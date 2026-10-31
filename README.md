# Arcway

Arcway helps new people get started on Arc. It lists Arc apps worth trying and walks people through their first real steps with short quests. Apps and communities can put USDC behind those steps, and the ArcwayBounties contract pays each person who completes one.

Live at **[arcway.world](https://arcway.world)** on Arc mainnet (chain 5042).

## What you can do

- **Find apps.** Explore lists Arc apps by category, with the contracts each team publishes and how active they are on chain.
- **Take first steps.** 17 quests in 4 tiers walk you from holding USDC to using apps regularly. Arcway checks each step against your onchain activity before it counts, and you claim the XP for free.
- **Get paid for a step.** When a quest has a sponsor, its card shows "Pays X USDC". Finish the quest, tap claim, and the contract sends the USDC to your wallet.
- **Sponsor a step.** On [/sponsor](https://arcway.world/sponsor), escrow a reward per person and a number of people. You can top up while it runs and take back what nobody claimed after it ends.
- **Run a campaign.** Projects can lock a USDC prize pool for a first-come, prize-draw or shared-pool campaign at [/launch](https://arcway.world/launch).
- **Keep a record.** Your passport collects XP, levels and badges, and every wallet has a public page you can share.

## Contracts on Arc mainnet

| Contract | Address | What it does |
| --- | --- | --- |
| ArcwayBounties | [`0xd73b798a93497a0e45e2482ad07f7127f00521cf`](https://explorer.arc.io/address/0xd73b798a93497a0e45e2482ad07f7127f00521cf) | Holds sponsors' USDC and pays each wallet that completed the quest |
| ArcwayPassport | [`0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c`](https://explorer.arc.io/address/0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c) | Records completed quests and XP |
| ArcwayCampaigns | [`0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c`](https://explorer.arc.io/address/0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c) | Holds campaign prize pools |

USDC on Arc is `0x3600000000000000000000000000000000000000`.

ArcwayBounties has no owner, admin, pause, fee or upgrade path. It calls two contracts: USDC, and the passport's `completedQuest` view. Two mainnet transactions show the full loop:

- A sponsor escrows 0.5 USDC for 5 people: [`0xd0516b5f…cc6b`](https://explorer.arc.io/tx/0xd0516b5fbec7016b9b9cf6907fd0c7f18e425e0637f0cb56aae1f500caf2cc6b).
- A wallet that completed the quest claims 0.1 USDC: [`0x018309c1…c0a2`](https://explorer.arc.io/tx/0x018309c1961b3f7b82f7479754a8b0fa1a61af6d8b075fff50d6aa7f848bc0a2).

## Built with Arc Studio

We used [Arc Studio](https://studio.arc.io) on this repo for the sponsored-quest feature ([Studio project](https://studio.arc.io/app/3d0d866c-f38c-4a6a-9c6c-d7c1bbf8f9cf)).

1. Studio read the repo and wrote `contracts/src/ArcwayBounties.sol` and `contracts/script/DeployBounties.s.sol` against our interface, `contracts/src/interfaces/IArcwayBounties.sol` ([its commits](https://github.com/Timioni001/arcway/commits/arc-studio/bounties)).
2. Studio ran the Foundry suite, did a first security pass over ArcwayBounties and the two live contracts, and deployed the stack to Arc testnet with a mock USDC and a mock passport.
3. We checked each finding against the source and wrote up the results in [`contracts/AUDIT.md`](contracts/AUDIT.md). We added tests until the suite reached 46, including an invariant that ran 128,000 random calls and confirmed the contract always holds exactly what open bounties owe.
4. We deployed the same contract to mainnet. Its onchain code matches the tested build byte for byte.
5. Studio then built the sponsor tools on /sponsor, the "Your bounties" panel with top up and close and refund ([its commits](https://github.com/Timioni001/arcway/commits/arc-studio/sponsor-tools)). We fixed three bugs in review before merging.

The /sponsor page shows the same credit, with links to the source, the audit and Studio's commits.

## How a sponsored quest works

1. The sponsor approves USDC and calls `create(questId, rewardPerClaim, maxClaims, expiresAt, title)`. The contract pulls `rewardPerClaim × maxClaims` and rejects tokens that take a fee on transfer.
2. Someone completes the quest. Arcway's verifier checks their onchain activity and records the quest in ArcwayPassport.
3. They call `claim(id)`. The contract checks `completedQuest(user, questId)`, marks the wallet as paid and sends one reward. Each wallet claims once per bounty.
4. After `expiresAt`, the sponsor calls `close(id)` and gets back every unclaimed reward.

The /sponsor page reads totals straight from the contract and lists every create, claim, top-up and close from its events, each linked to its transaction.

## Data

Every number shows where it came from and the period it covers. "Observed" means read from Arc's explorer or RPC, "derived" means calculated from observed data with the method shown, and "project-provided" means it comes from the app's listing. When Arc data can't be reached, the page says so and shows nothing. Arcway does not estimate TVL, volume or user counts.

## Run it

```bash
npm install
cp .env.example .env.local   # defaults to Arc testnet
npm run dev
```

Checks:

```bash
npm run typecheck
npm test                              # unit tests
npm run build && npm run test:e2e     # browser tests at desktop and phone sizes
cd contracts && forge install foundry-rs/forge-std --no-git && forge test
```

CI runs all of these on every push, and also checks that `lib/bountiesBytecode.ts` matches a fresh `forge build`.

Without `NEXT_PUBLIC_PASSPORT_CONTRACT` and `VERIFIER_PRIVATE_KEY`, the app still detects quest progress but doesn't record it, and tells people recording opens soon. On mainnet, the app uses the ArcwayBounties address above unless `NEXT_PUBLIC_BOUNTIES_CONTRACT` overrides it.

## Deploy

`docs/DEPLOYMENT.md` covers Vercel, environment variables and the contracts. To deploy ArcwayBounties without a terminal, open `/deploy/bounties` in a wallet app's browser. The page uses the exact bytecode that `forge test` tested, and after the deploy it reads back the contract's USDC and passport addresses to confirm them.

## Code map

- `contracts/src/` has ArcwayBounties, ArcwayPassport and ArcwayCampaigns, with tests in `contracts/test/`.
- `lib/quests.ts` defines the quests, tiers and XP. `lib/server/verify.ts` checks them on chain.
- `lib/bounties.ts`, `lib/hooks/useBounties.ts` and `components/Bounties.tsx` contain the sponsored-quest logic and UI. `lib/server/bountyActivity.ts` feeds the payout list.
- `lib/registry.ts` lists the apps. Add an entry to list a new one; only list contracts the team publishes.
- `lib/config.ts` holds the chain, USDC, contract addresses and explorer links.
- `docs/` has the architecture, product, data, contracts and UI notes.

## Brand

The Arc logo in `public/brand/arc/` is Circle's official file, used unmodified for "Built on Arc" attribution. See `public/brand/arc/NOTICE.md`. Arcway is independent and not affiliated with Circle.
