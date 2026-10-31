# DoraHacks submission: Arc Microgrants, Built with Arc Studio

Copy each block into the matching field. Every claim below is checkable from the links.

---

**Project name**
Arcway

**Tagline** (one line)
Paid onboarding for Arc. Apps put USDC behind real first steps, and a contract pays each new user who completes one.

**Links**
- Live app: https://arcway.world (sponsored quests: https://arcway.world/sponsor)
- Arc Studio project: https://studio.arc.io/app/3d0d866c-f38c-4a6a-9c6c-d7c1bbf8f9cf
- Repo: https://github.com/Timioni001/arcway
- Contract: ArcwayBounties on Arc mainnet, `0xd73b798a93497a0e45e2482ad07f7127f00521cf`, https://explorer.arc.io/address/0xd73b798a93497a0e45e2482ad07f7127f00521cf
- Video: <YouTube link>
- Studio's commits: https://github.com/Timioni001/arcway/commits/arc-studio/bounties and https://github.com/Timioni001/arcway/commits/arc-studio/sponsor-tools

---

## Description

### The problem
New users reach Arc and don't know what to try, so most leave without doing anything. Apps want those users, but paid attention mostly buys bots and one-click farmers.

### What Arcway does
Arcway is a front door to Arc. People find apps worth trying, and short quests walk them through real first steps: holding USDC, making a transaction, using an app. Each step is checked on chain before it counts.

**New in this build: sponsored quests (ArcwayBounties).** Anyone, whether an app team, a community or Arc supporters, can escrow USDC behind a quest. Every wallet that completes the quest claims one reward, paid directly by the contract, first come first served until the pool runs out. Unclaimed USDC returns to the sponsor when the bounty ends.

- Apps get an onboarding budget that pays only for people who completed the step.
- New users get a reason to take their first steps on Arc, and get paid for it.
- The payout has no admin, fee or backend in the way. The contract checks Arcway's onchain quest record and pays.

### USDC on Arc mainnet
Both transactions went through the contract and the live app:
- **Sponsor:** 0.10 USDC × 5 people escrowed (0.5 USDC), https://explorer.arc.io/tx/0xd0516b5fbec7016b9b9cf6907fd0c7f18e425e0637f0cb56aae1f500caf2cc6b
- **Claim:** 0.10 USDC paid by the contract to a wallet that completed the quest, https://explorer.arc.io/tx/0x018309c1961b3f7b82f7479754a8b0fa1a61af6d8b075fff50d6aa7f848bc0a2

The Sponsor page shows live totals read from the contract (USDC paid out, rewards claimed, USDC put up), plus a "Latest payouts" feed linking every transaction.

### How we used Arc Studio
- **Built in Studio:** Studio worked inside our existing repo and wrote `ArcwayBounties.sol` and its deploy script against our interface. Its commits are on the `arc-studio/bounties` branch, merged into main.
- **Tested and audited in Studio:**
  - Studio ran the full Foundry suite (71/71 passing in its sandbox, including an escrow invariant).
  - It ran a first security audit across ArcwayBounties and our two live mainnet contracts.
  - It deployed the stack to Arc testnet: MockUSDC `0x5af7…dad19`, MockPassport `0x18e7…2da4`, ArcwayBounties `0x37bb…c9fd6`.
- **Built the sponsor tools:** Studio wrote the "Your bounties" panel on /sponsor, which lets sponsors top up a bounty or close it and take back what's unclaimed. Its commits are on `arc-studio/sponsor-tools`. We fixed three bugs in review and merged it.
- **Verified, then shipped:**
  - We checked each audit finding against the source. The report is in `contracts/AUDIT.md`.
  - We extended the repo's test suite to 46 tests, including a 128,000-call invariant showing the contract always holds exactly what it owes.
  - We deployed the same contract to mainnet unchanged; its on-chain code matches the tested build.
- On the live site, the Sponsor page carries a "Built with Arc Studio" card linking the source, the audit and Studio's commits.

### Working product
Everything is live at arcway.world:
- the app directory and quests
- sponsored quests on the Quests page, with a "Pays X USDC" tag on quest cards
- the sponsor form, claiming from quest pages, live totals and the payout feed
- sponsor tools to top up a bounty or close it and get the rest back

The app is mobile-first and works in wallet browsers.

### What's next
- App teams sponsor quests for their own apps, so every app listed on Arcway has a paid first step.
- Quest templates per app, so a team can launch a sponsored quest in a minute.
- Reminders for sponsors when a bounty is about to run out or end.

The microgrant goes to seeding the first sponsored quests with USDC and onboarding the first app teams as sponsors.

---

## Short version (if a field is limited to about 280 characters)
Arcway is paid onboarding for Arc. Apps escrow USDC behind real first steps on Arc, and the ArcwayBounties contract pays each new user who completes one. Built, tested and audited in Arc Studio, live on mainnet with real USDC payouts. arcway.world

---

## Before you press submit
- [ ] Video uploaded and plays while signed out.
- [ ] The Studio project link opens for someone else (check Studio's share or visibility setting, and open it in a private tab).
- [ ] Every link above opens.
- [ ] Submit **at least a day before** 2 Nov, 04:59 UTC. Then check that the BUIDL status moves past "Under review"; if it hasn't within a day, message the organizers with the BUIDL link straight away.
