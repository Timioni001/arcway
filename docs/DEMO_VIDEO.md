# Demo video: "Paid onboarding for Arc"

Length: about 2:00 (hard stop at 2:30). Format: 16:9 landscape, 1080p. Voiceover plus big captions, since many judges watch muted.

**The story in one line:** new users come to Arc and don't know what to try, and apps can't reach them. With Arcway, any app or community can put USDC behind a real first step on Arc, and the contract pays each person who completes it. It was built with Arc Studio and is live on mainnet.

Order the video by what the judges score: USDC moving on mainnet (30%), Arc Studio (25%), a working product (25%), potential (20%). The live mainnet payout sits in the middle of the video and gets the most screen time.

---

## Before you record

1. **A second wallet for the claim.** A stranger getting paid is far more convincing than paying yourself.
   - Bounty #1 still has 4 rewards left, on the "Arrive on Arc" quest.
   - Any wallet holding at least 1 USDC on Arc can complete that quest on Arcway and then claim.
   - If you'd rather not, sponsor a fresh small bounty from wallet A and claim it from wallet B.
2. **Tablet setup:**
   - Turn on Do Not Disturb and charge to above 50%.
   - Hold the tablet in landscape and use light mode.
   - Use Android's built-in screen recorder with sound off. Record the voiceover separately; it comes out cleaner.
3. **Have these open in tabs, in this order:**
   - arcway.world
   - arcway.world/quests
   - arcway.world/sponsor
   - your Studio project, `studio.arc.io/app/3d0d866c-f38c-4a6a-9c6c-d7c1bbf8f9cf`
   - github.com/Timioni001/arcway/commits/arc-studio/bounties
   - the explorer page for the claim transaction
4. **Record each scene as its own clip.** Re-take any clip with a stutter. Stitch the clips in CapCut, add the captions below, and lay a low, steady music track under the voice at about 15% volume.
5. **Studio footage:** if Studio's chat history doesn't scroll back far enough, use the screenshots you already took. Zoom slowly over each one (the "Ken Burns" effect) so it doesn't look static.

---

## Script

### 1. Hook (0:00 to 0:12)

**Screen:** the arcway.world home page, scrolling slowly.

**Voiceover:**
> Every new chain has the same problem. People show up, don't know what to try, and leave. Apps pay for attention and get bots.

**Caption:** `New users arrive on Arc. Most leave without doing anything.`

### 2. What Arcway is (0:12 to 0:30)

**Screen:** tap through Explore (the app directory), then Quests (the tiers and quest cards).

**Voiceover:**
> Arcway is the front door to Arc. You find apps worth trying, and short quests walk you through real first steps: hold USDC, send a transaction, use an app. Every step is checked on chain.

**Caption:** `Arcway: find Arc apps, take real first steps`

### 3. The new piece: sponsored quests (0:30 to 0:50)

**Screen:** /sponsor, the form and "How it works".

**Voiceover:**
> Now any app, or anyone who wants Arc to grow, can put USDC behind one of those steps. It's an onboarding budget that only pays out for people who actually did the thing, paid by a contract, with no middleman.

**Caption:** `Sponsored quests: USDC for real first steps on Arc`

### 4. Live on mainnet (0:50 to 1:25). This scene matters most.

**Screen, in order:**
1. **Wallet A sponsors** (or show the existing bounty #1). Show the escrow amount, then the wallet confirmation.
2. **The bounty appears** under "Live bounties", and the quest card now says **"Pays 0.1 USDC"**.
3. **Wallet B completes "Arrive on Arc" and taps Claim 0.1 USDC.** Show the wallet confirmation, then the success toast.
4. **The explorer page for the claim:** "Success", USDC moving from `0xd73b…21Cf` to wallet B, Arc Mainnet.
5. **Back on /sponsor:** the totals update (USDC paid out, rewards claimed), and the new claim sits at the top of "Latest payouts".

**Voiceover:**
> This is Arc mainnet, with real USDC. A sponsor escrows the reward. A new user completes the quest, and Arcway records it on chain. They tap claim, and the contract checks the record and pays them directly. Every payout is public, and anything unclaimed goes back to the sponsor when the bounty ends.

**Caption:** `Arc mainnet · real USDC · paid by the contract`

On screen, overlay the contract address `0xd73b798a93497a0e45e2482ad07f7127f00521cf`.

### 5. Built with Arc Studio (1:25 to 1:50)

**Screen, in order:**
1. **The Studio project:** the 10-step plan.
2. Studio's report: **"71/71 pass"**, then the audit table.
3. **The testnet deploy cards** for MockUSDC, MockPassport and ArcwayBounties.
4. **GitHub, the `arc-studio/bounties` commits:** "feat: add ArcwayBounties contract".
5. **The "Built with Arc Studio" card** on /sponsor.

**Voiceover:**
> The contract was built in Arc Studio. Studio read our repo and wrote ArcwayBounties and its deploy script. It ran the test suite, did a first security audit of all three contracts, and deployed the whole stack to Arc testnet. We checked every finding and extended the tests to 46, including an invariant that ran 128,000 random actions. Then we deployed that same code to mainnet.

**Caption:** `Written, tested, audited and deployed with Arc Studio`

### 6. Why it matters (1:50 to 2:05)

**Screen:** the Quests page, with the paid tag visible on a quest card.

**Voiceover:**
> For apps, it's a way to pay for users who really tried them. For new users, it's a reason to take a first step on Arc and get paid for learning. Next, we want app teams to sponsor quests for their own apps, so every app listed on Arcway can bring in users who stick.

**Caption:** `Apps pay for real users. New users get paid to learn Arc.`

### 7. Close (2:05 to 2:10)

**Screen:** the arcway.world logo or the home hero.

**Voiceover:**
> Arcway. Find Arc, try it, get paid. arcway.world.

**Caption:** `arcway.world · built with Arc Studio · live on Arc mainnet`

---

## Edit notes

- Put the address and the transaction hash on screen as text overlays while the explorer is showing; judges pause on those frames.
- Speed up wallet loading and page loads 2× or cut them out. Never cut the "Success" moment.
- Keep the passport to one second in the background. The story is getting new users onto Arc, not their profile.
- Every claim in the voiceover is true and checkable. Don't add numbers we don't have, such as user counts.
- Upload to YouTube as Unlisted or Public, and check it plays while signed out before you paste the link.
