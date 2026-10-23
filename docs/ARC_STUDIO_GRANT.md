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
1. **ArcwayPay** (`arc-studio/01-arcway-pay.txt`): the contract behind Arcway pay links. Non-custodial:
   USDC moves payer → recipient in one call and every payment emits a `Paid` receipt tied to the link.
   Interface (the spec Studio must honor): `contracts/src/interfaces/IArcwayPay.sol`. Studio writes the
   contract, the Foundry tests (incl. fuzz and permit), audits it, deploys to testnet, and builds a
   small pay app. arcway.world/pay already calls it when `NEXT_PUBLIC_PAY_CONTRACT` is set.
2. **Audit of the live contracts** (`arc-studio/02-audit.txt`): ArcwayPassport and ArcwayCampaigns,
   findings by severity, proving tests, minimal fixes.

## Commands (run where ARC_STUDIO_TOKEN is available)
```sh
npm i -g @circle-fin/arc-studio-cli          # or npx @circle-fin/arc-studio-cli
arc-studio whoami                             # must pass
arc-studio run --prompt-file arc-studio/01-arcway-pay.txt \
  --file contracts/src/interfaces/IArcwayPay.sol --session arcway-pay --output json
arc-studio pull --session arcway-pay --out arc-studio/out/pay --paths "contracts/**" "test/**" "src/**"
arc-studio run --prompt-file arc-studio/02-audit.txt \
  --file contracts/src/ArcwayPassport.sol --file contracts/src/ArcwayCampaigns.sol \
  --session arcway-audit --output json
arc-studio open --session arcway-pay          # the studio.arc.io/app/... URL for the submission
```
Then copy `ArcwayPay.sol` + its tests into `contracts/`, run `forge test`, and review before mainnet.

## Mainnet (the owner does this; keys never leave their machine)
```sh
forge create src/ArcwayPay.sol:ArcwayPay --rpc-url https://rpc.mainnet.arc.io \
  --private-key $DEPLOYER_KEY --broadcast --constructor-args 0x3600000000000000000000000000000000000000
```
Vercel → `NEXT_PUBLIC_PAY_CONTRACT=<address>` → redeploy → `/api/health` shows `pay.deployed: true`,
`pay.usdcMatches: true`. Then pay a small amount (e.g. 0.10 USDC) through a link on arcway.world/pay:
that transaction hash is the "USDC through the contract and app" proof.

## Submission checklist
- [ ] Arc Studio project URL (ArcwayPay session) — and the audit session URL as extra evidence
- [ ] Live app: https://arcway.world/pay (and Studio's preview link)
- [ ] ArcwayPay mainnet address + the example payment tx on explorer.arc.io
- [ ] Repo: https://github.com/Timioni001/arcway
- [ ] 60–90 s video: open a pay link → approve → pay → onchain receipt → the contract in Studio
- [ ] Short description: what ArcwayPay does, what Studio built and audited, and that Arcway's
      quests, passport and campaigns are already live on Arc mainnet

## About round 1 staying "Under review"
On DoraHacks a BUIDL stays "Under review" until the organizer accepts it into the event; it does
not change on its own after the deadline. Message the organizers from the event page (or Arc's
Discord) with the BUIDL link and ask whether anything was missing. For this round, make sure every
required field above is filled before submitting.
