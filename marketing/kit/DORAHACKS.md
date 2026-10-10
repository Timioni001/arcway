# Arc Microgrants on DoraHacks: ready-to-paste answers

Form: dorahacks.io/hackathon/arc-microgrants → **Create a new Build and submit**.
Deadline: **October 15, 2026, 09:29 IST (03:59 UTC)**. Reviews are rolling, so earlier is better.
Decisions by October 21, 2026.

## Before you submit (eligibility)

The program asks for three things. Arcway has the first; the other two need you.

| Requirement | Status |
|---|---|
| Live, working project on Arc Mainnet | ✅ ArcwayPassport and ArcwayCampaigns deployed October 1, 2026 |
| **Public** code repository | ⚠️ `Timioni001/arcway` is **private** today. Make it public (GitHub → Settings → General → Danger Zone → Change visibility). Check that no `.env` file or key was ever committed first. |
| A wallet that can receive USDC on Arc | ⚠️ Have the address ready for the Contact or Submission step |

Also make sure **arcway.world** opens the live site (the repo's GitHub homepage still points at `arcway-gold.vercel.app`).

---

## Step 1: Profile

**Build (project) name**
```
Arcway
```

**Build logo** (JPEG or PNG, under 2 MB, 480 × 480)
`marketing/kit/png/arcway-logo-480.png`

**Vision** (the problem it solves)
```
Arc is new, and most people don't know which apps are real, what to try first, or whether what they did counted. Arcway is the front door to Arc: it lists every app with its contracts checked onchain, turns first steps into 17 quests verified against Arc, and records progress on a free onchain Passport.
```

**Category**
`Crypto / Web3`

**GitHub**
```
https://github.com/Timioni001/arcway
```

**Project website**
```
https://arcway.world
```

**Demo video**
Upload `marketing/kit/video/arcway-demo.mp4` to YouTube (title and description below), then paste the link. DoraHacks embeds YouTube links as a player.

**Social links** (up to 3)
```
https://x.com/<your handle>
https://arcway.world/digest
https://github.com/Timioni001/arcway
```
The digest page is Arcway's daily "Arc today" summary with an RSS feed, so it counts as a newsletter link. Swap in Farcaster or Discord if you have them.

---

## Step 2: Details

Paste this into the description field. It is Markdown; DoraHacks renders it.

```markdown
## Arcway: Explore Arc. Complete quests. Build your Passport.

**Live on Arc Mainnet: [arcway.world](https://arcway.world)**

### The problem
Arc is new. People arriving on it don't know which apps are real, what to try first, or whether what they did "counted". Builders launching on Arc have no shared place to be discovered. Explorers show raw transactions, not a path.

### What Arcway does
- **Explore**: every app on Arc, grouped by goal (get set up, earn on USDC, swap stablecoins, try an AI agent) and by category, with each app's published contracts checked live against the Arc explorer.
- **Quests**: 17 quests across four tiers (Beginner, Explorer, Regular, Advanced; 2,145 XP in total). Each quest is checked on the server against real Arc activity: holding USDC, making transactions, acting in verified apps, being active on several days. Unmet quests show progress ("3 of 5 transactions so far").
- **Passport**: XP, levels and badges recorded on Arc by the ArcwayPassport contract. Claiming is free: Arcway's verifier pays the fee. Seven card designs unlock as you finish tiers, and every wallet gets a public, shareable passport page.
- **Leaderboard and seasons**: read directly from the contract's events.
- **Pay links**: a link or QR code to get paid in USDC on Arc.
- **For builders**: submit an app in about two minutes (contracts checked live), add a live "on Arc" badge to a README, and launch a USDC prize-pool campaign held in escrow by the ArcwayCampaigns contract.
- **Live Arc data with sources**: activity, what changed in the last 24 hours, a daily digest and RSS. Every number is labelled Observed, Derived or Project-provided. Arcway never invents TVL, volume or user counts.

### Onchain (Arc Mainnet)
| Contract | Address |
|---|---|
| ArcwayPassport (XP, badges, quest completion) | `0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c` |
| ArcwayCampaigns (USDC prize-pool escrow) | `0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c` |

A verifier key signs a quest completion only after the server has checked it against Arc, then calls `completeQuest` and `awardBadge` on the Passport contract. Campaign entries are EIP-712 signed; results are published as a Merkle root and winners claim from escrow; unclaimed funds can be refunded to the creator.

### How it's built
- Next.js (App Router) + TypeScript, wagmi and viem for wallets
- Solidity contracts with Foundry tests
- Arc data from the Blockscout API, with Arc RPC as a fallback, and an Envio HyperIndex indexer for passport events
- Circle Modular Wallets (passkeys) wired in and waiting on a Client Key
- Unit tests (Vitest) and browser tests (Playwright) in CI

### Progress so far
- Built and launched in about two weeks: first commit September 25, mainnet October 1, 2026
- Both contracts deployed on Arc Mainnet, verifier authorised and funded
- 15 apps listed across 8 categories, 17 quests, 4 tiers, 7 passport designs

### What the grant would fund
1. Hosting and indexer costs, so live data and the leaderboard stay fast
2. Verifier gas, so claiming stays free for every new Arc user
3. Passkey wallets (Circle Modular Wallets plus a Gas Station policy), so people with no wallet can start in one tap
4. Partner quests: Arc teams publish their own quests, checked the same way

Arcway is independent and not affiliated with Circle.
```

If the Details step has separate boxes, split the same text this way:
- **Tech stack**: the "How it's built" list
- **Progress / what you built**: "What Arcway does" and "Progress so far"
- **Fundraising status**: `Not raised. Self-funded so far.` (change this if it isn't true)
- **Next steps / use of funds**: "What the grant would fund"

Images to add if the step accepts them: `marketing/launch/png/arcway-hero-1600x900.png`, `marketing/kit/png/arcway-how-1600x900.png`, `marketing/kit/png/arcway-architecture-1600x900.png`.

---

## Step 3: Team

Fill in from your own profile. Suggested role line:
```
Timi: founder and full-stack developer. Designed and built Arcway end to end: Next.js app, Solidity contracts, indexer and launch.
```
Add your GitHub (`https://github.com/Timioni001`) and X profile.

## Step 4: Contact

Your email, plus Telegram or Discord if you use them. Have the Arc wallet address for the grant ready here too.

## Step 5: Submission

Choose **Arc Microgrants** as the hackathon or track, check the preview, and submit. One submission per project.

---

## YouTube upload for the demo video

**File**: `marketing/kit/video/arcway-demo.mp4` (1920 × 1080, 1 min 40 s, silent; YouTube's free audio library works if you want music)
**Thumbnail**: `marketing/launch/png/arcway-hero-1600x900.png`
**Visibility**: Public or Unlisted (both embed on DoraHacks)

**Title**
```
Arcway: Explore Arc. Complete quests. Build your Passport. (Arc Mainnet demo)
```

**Description**
```
Arcway is the front door to Arc. Find every app with its contracts checked onchain, complete 17 quests verified against Arc, and build a free onchain Passport.

Live on Arc Mainnet: https://arcway.world

00:00 Intro
00:10 Home and Explore
00:26 Quests
00:41 Passport
00:52 Pay links and builder tools
01:14 Search and dark mode
01:26 Onchain on Arc Mainnet

Contracts on Arc Mainnet
ArcwayPassport 0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c
ArcwayCampaigns 0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c

Code: https://github.com/Timioni001/arcway
Arcway is independent and not affiliated with Circle.
```
