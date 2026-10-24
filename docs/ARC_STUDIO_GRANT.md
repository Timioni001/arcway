# Arc Microgrants: Built with Arc Studio — plan and checklist

Program: https://dorahacks.io/hackathon/arc-microgrants-2 · 8 × $500 USDC · **closes 2 Nov 2026, 04:59 UTC**,
reviewed on a rolling basis. Submissions are not audited by Arc or Circle.

## What the round asks for
- Built in Arc Studio. **Proof is the Arc Studio project URL** (`https://studio.arc.io/app/<id>`; the
  CLI's `/open` prints it).
- Smart contracts **tested in Arc Studio** and **deployed to Arc mainnet** at submission time.
- A working app at a public link that calls those contracts.
- **At least one Arc mainnet transaction moving USDC through the contract and the app.**
- A public repo and a video walkthrough.
- Scoring: real USDC movement on mainnet 30%, Arc Studio across the build 25%, working product 25%,
  potential 20%.

## What Arcway builds in Arc Studio
1. **ArcwayBounties — quests that pay** (`arc-studio/03-arcway-bounties.txt`, the headline build).
   Anyone escrows USDC behind an Arcway quest; every wallet whose ArcwayPassport has that quest
   recorded claims one reward, straight from the contract. The live passport contract is the only
   judge: no admin, no backend, no signatures. Sponsors get unclaimed USDC back after expiry.
   Spec Studio must honor: `contracts/src/interfaces/IArcwayBounties.sol`. Studio writes the contract,
   unit + invariant tests, audits it, deploys to testnet and builds a sponsored-quests app.
   arcway.world already has the UI: sponsored rewards and a claim button on quest pages, a
   "Sponsored quests" list on /quests and a sponsor form on /sponsor, all live once
   `NEXT_PUBLIC_BOUNTIES_CONTRACT` is set.
2. **ArcwayPay** (`arc-studio/01-arcway-pay.txt`, optional second contract): pay links that settle
   through a contract with an onchain receipt. Spec: `contracts/src/interfaces/IArcwayPay.sol`.
3. **Audit of the live contracts** (`arc-studio/02-audit.txt`): ArcwayPassport and ArcwayCampaigns.

## Commands (run where ARC_STUDIO_TOKEN is available)
```sh
npm i -g @circle-fin/arc-studio-cli          # or npx @circle-fin/arc-studio-cli
arc-studio whoami                             # must pass
arc-studio run --prompt-file arc-studio/03-arcway-bounties.txt \
  --file contracts/src/interfaces/IArcwayBounties.sol --session arcway-bounties --output json
arc-studio pull --session arcway-bounties --out arc-studio/out/bounties --paths "contracts/**" "test/**" "src/**"
arc-studio run --prompt-file arc-studio/02-audit.txt \
  --file contracts/src/ArcwayPassport.sol --file contracts/src/ArcwayCampaigns.sol \
  --session arcway-audit --output json
arc-studio open --session arcway-bounties     # the studio.arc.io/app/... URL for the submission
```
Then copy `ArcwayBounties.sol` + its tests into `contracts/`, run `forge test`, and review before mainnet.

## Mainnet (the owner does this; keys never leave their machine)
```sh
forge create src/ArcwayBounties.sol:ArcwayBounties --rpc-url https://rpc.mainnet.arc.io \
  --private-key $DEPLOYER_KEY --broadcast \
  --constructor-args 0x3600000000000000000000000000000000000000 0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c
```
Vercel → `NEXT_PUBLIC_BOUNTIES_CONTRACT=<address>` → redeploy → `/api/health` shows
`bounties.deployed`, `usdcMatches` and `passportMatches` all `true`. Then on arcway.world/sponsor put a
small bounty (e.g. 0.10 USDC × 5 people) behind a quest you've completed and claim it from the quest
page: the create and the claim transactions are the "USDC through the contract and app" proof.

## Submission checklist
- [ ] Arc Studio project URL (ArcwayBounties session) — and the audit session URL as extra evidence
- [ ] Live app: https://arcway.world/sponsor and any quest page (and Studio's preview link)
- [ ] ArcwayBounties mainnet address + the create and claim txs on explorer.arc.io
- [ ] Repo: https://github.com/Timioni001/arcway
- [ ] 60–90 s video: sponsor a quest → finish it → claim the USDC → the contract and tests in Studio
- [ ] Short description: what ArcwayBounties does, what Studio built and audited, and that Arcway's
      quests, passport and campaigns are already live on Arc mainnet

## About round 1 staying "Under review"
On DoraHacks a BUIDL stays "Under review" until the organizer accepts it into the event; it does
not change on its own after the deadline. Message the organizers from the event page (or Arc's
Discord) with the BUIDL link and ask whether anything was missing. For this round, make sure every
required field above is filled before submitting.
