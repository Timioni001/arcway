# Arcway on X: account setup and the first two weeks

Every figure matches the app: 15 apps, 17 quests, 4 tiers, 2,145 XP, 7 card designs, live on Arc Mainnet.
Tag the official Arc account where it says [Arc]. Arcway is independent and not affiliated with Circle, so never
use Arc's or Circle's logo as your own.

## 1. Profile

| Field | Use |
|---|---|
| **Handle** | `@arcwayworld` first choice (matches arcway.world); then `@arcway_world`, `@usearcway` |
| **Display name** | `Arcway` |
| **Profile picture** | `marketing/kit/png/arcway-avatar-400.png` (or the 1000 px version for extra sharpness). The mark sits in the middle, so X's circle crop keeps it whole. |
| **Header** | `marketing/launch/png/arcway-banner-1500x500.png` |
| **Bio** (160 max) | see below |
| **Location** | `Arc Mainnet` |
| **Website** | `arcway.world` |
| **Pinned post** | the launch thread (part 3) |

**Bio**, pick one:
```
The front door to Arc. Find apps, complete quests checked onchain, and build your Passport. Free to claim. Independent, built on Arc.
```
```
Explore Arc. Complete quests. Build your Passport. 17 quests · 2,145 XP · live on Arc Mainnet. Not affiliated with Circle.
```

After the handle exists, set `NEXT_PUBLIC_X_URL=https://x.com/<handle>` in Vercel so the site footer links to it.

### Account hygiene
- Turn on two-factor authentication before posting anything.
- Settings → Your account → Account information → Automation: label the account as a project if you schedule posts.
- Follow [Arc], Circle, Arc builders listed in Arcway, and the DoraHacks account, so your first posts reach people who care.

## 2. Media in this kit

| File | Use for |
|---|---|
| `video/arcway-demo.mp4` (16:9, 1 min 40 s) | Pinned thread, YouTube, DoraHacks |
| `video/arcway-teaser-land.mp4` (16:9, 19 s) | Feed posts on desktop |
| `video/arcway-teaser-square.mp4` (1:1, 19 s) | Feed posts on mobile, replies |
| `video/arcway-teaser-vertical.mp4` (9:16, 19 s) | Full-screen video, also Reels, TikTok and Shorts |
| `png/arcway-launch-*` | Launch-day announcement: 1600 × 900, 1080 × 1080 and 1080 × 1350 (tall, fills the most of a phone feed) |
| `png/arcway-how-*` | How it works |
| `png/arcway-free-*` | Claiming is free |
| `png/arcway-trust-*` | Data with sources |
| `png/arcway-architecture-1600x900.png` | Builder and technical posts |
| `../launch/png/*` | Hero, tiers, cards, features, pay, builders (captions in `../launch/CAPTIONS.md`) |

Use the 1600 × 900 images on desktop-heavy posts and the 1080 × 1080 ones when most viewers are on phones.
All videos are silent, so they autoplay well in the feed. Add a track from X's or YouTube's free library if you want sound.

## 3. Launch thread (pin this)

Use the thread in `../launch/CAPTIONS.md`, with one change: attach `arcway-demo.mp4` to post 1 and
`arcway-teaser-land.mp4` to post 7 if you don't have the older launch videos to hand.

## 4. The first two weeks

One main post a day is plenty. Reply to everyone who replies. Post when your audience is awake; 13:00 to 16:00 UTC
catches both Europe and the Americas.

**Day 1: launch.** Pin the launch thread. Quote-post it from your personal account.

**Day 2: how it works** (attach `arcway-how-1600x900.png`)
```
New to Arc? Arcway is three steps:

1. Explore: find an app by what you want to do
2. Quest: do it on Arc, we check it onchain
3. Passport: claim XP for free and watch your card level up

arcway.world
```

**Day 3: teaser video** (attach `arcway-teaser-square.mp4`)
```
17 quests. Four tiers. Seven card designs.

Your Arc journey, recorded onchain. arcway.world
```

**Day 4: claiming is free** (attach `arcway-free-1600x900.png`)
```
Claiming XP on Arcway costs you nothing.

Finish a quest on Arc, come back, tap claim. We check it onchain and pay the fee to record it on your Passport.
```

**Day 5: data you can trust** (attach `arcway-trust-1080x1080.png`)
```
Every number on Arcway shows where it came from:

Observed: read from Arc's explorer
Derived: calculated, with the method shown
Project: supplied by the team, and labelled

No invented TVL. No guessed user counts.
```

**Day 6: builders** (attach `arcway-architecture-1600x900.png`)
```
How a quest lands on your Passport:

You act on Arc → Arcway checks it against the chain → a verifier signs only checks that pass → completeQuest() on Arc Mainnet.

Two contracts, both on Arc. Code is open. [Arc]
```

**Day 7: weekly recap.** Quote-post the launch thread:
```
Week one on Arc Mainnet. If you haven't started your Passport, the Beginner tier takes about 11 minutes.

arcway.world/quests
```

**Day 8: tiers** (attach `../launch/png/arcway-tiers-1600x900.png`)
```
Beginner gets you started. Explorer, Regular and Advanced ask for real habits: more transactions, more days on Arc, more actions in verified apps.

Which tier are you on?
```

**Day 9: card designs** (attach `../launch/png/arcway-cards-1080x1080.png`)
```
Seven Passport designs, from Arc blue to Aurora holo. The rare ones unlock with tier finales.

Show us yours: arcway.world/passport
```

**Day 10: vertical video** (attach `arcway-teaser-vertical.mp4`)
```
Explore Arc. Complete quests. Build your Passport.

arcway.world
```

**Day 11: pay links** (attach `../launch/png/arcway-pay-1600x900.png`)
```
Get paid in USDC with a link.

Make a link or QR code, send it, and it settles on Arc in about a second. arcway.world/pay
```

**Day 12: call for builders** (attach `../launch/png/arcway-builders-1600x900.png`)
```
Built something on Arc Mainnet? List it on Arcway in about two minutes.

Your contracts are checked live, you get an "on Arc" badge for your README, and you can launch a USDC campaign for people who try it.

arcway.world/submit
```

**Day 13: leaderboard**
```
This season's leaderboard is read straight from the Passport contract's events. Nothing is self-reported.

Who's at the top? arcway.world/leaderboard
```

**Day 14: two-week recap.** Share real numbers from `/leaderboard` and `/api/health` only (passports issued, XP recorded). Don't estimate.

## 5. Reply bank

- **What's Arcway?** The easiest way into Arc: find apps, finish quests, build a Passport. arcway.world
- **Is it free?** Yes. Claiming XP is free; Arcway pays the fee.
- **Is this Circle?** No. Arcway is independent and built on Arc.
- **Is there a token or airdrop?** No token. XP and badges record what you did on Arc. (Never hint at rewards that don't exist.)
- **How do quests work?** Do the thing on Arc, come back, claim. We check it onchain and record your XP.
- **My quest didn't count.** Open the quest page: it shows what counts and how far along you are. If it still looks wrong, send the transaction link.

## 6. Alt text for the new images

- **arcway-how**: "Three steps. All on Arc." Cards: Explore (15 apps), Quest (17 quests), Passport (2,145 XP).
- **arcway-free**: "Earn XP. Pay nothing." A receipt: Quest First transaction, +25 XP, badge stamped, you pay 0.00 USDC, recorded on Arc Mainnet.
- **arcway-trust**: "Every number shows its source." Labels Observed, Derived and Project, each with what it means. Never shown: made-up TVL, fake volume, guessed users.
- **arcway-architecture**: Diagram of a quest claim: you, Arcway, the verifier, Arc data sources, and the ArcwayPassport and ArcwayCampaigns contracts on Arc Mainnet.
- **teaser videos**: "Explore Arc. Complete quests. Build your Passport." then 17 quests in four tiers, seven passport card designs, the key numbers, and arcway.world.
