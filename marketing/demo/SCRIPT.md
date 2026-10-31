# Arcway demo video script

Runtime 2:00. 1920×1080, 30 fps. Each scene lists the image to show, how long, the motion, any overlay, the voiceover and the caption. Images live in this folder. Overlays in `overlays/` are transparent PNGs that sit on top of the image.

The story is getting new people onto Arc. Arcway shows them what to try, and sponsors pay them for real first steps. The passport stays in the background.

## Scene 1. The question (0:00 to 0:08)

| Time | Image | Motion |
| --- | --- | --- |
| 0:00 to 0:08 | `cards/01-hook.png` | Slow push in, 100% to 104% |

**Voiceover:** "You just arrived on Arc. You have some USDC. So what do you try first?"

**Caption:** You just arrived on Arc. What do you try first?

## Scene 2. Arcway (0:08 to 0:24)

| Time | Image | Motion |
| --- | --- | --- |
| 0:08 to 0:12 | `cards/02-arcway.png` | Hold |
| 0:12 to 0:18 | `app/01-home.png` | Slow pan down |
| 0:18 to 0:24 | `app/02-explore.png` | Slow push in |

**Voiceover:** "Arcway is a starting point for Arc. It lists the apps worth trying. Seventeen short quests take you through real first steps, and Arcway checks each one against your activity on chain."

**Caption:** Arcway lists Arc apps and walks you through real first steps.

## Scene 3. Sponsored quests (0:24 to 0:40)

| Time | Image | Motion |
| --- | --- | --- |
| 0:24 to 0:29 | `cards/03-sponsored.png` | Hold |
| 0:29 to 0:34 | `app/04-quests-paid-tag.png` | Push in toward the "Pays 0.1 USDC" tag on the first card |
| 0:34 to 0:40 | `app/06-sponsor.png` | Slow pan down |

**Voiceover:** "Now any app or community can put USDC behind one of those steps. A sponsored quest says how much it pays. The sponsor sets a reward per person and a number of people, and the contract holds the money."

**Caption:** Sponsors put USDC behind a first step. The contract holds it.

## Scene 4. Live on Arc mainnet (0:40 to 1:12)

This scene matters most to the judges. Give it the most time.

| Time | Image | Motion | Overlay |
| --- | --- | --- | --- |
| 0:40 to 0:43 | `cards/04-mainnet.png` | Hold | |
| 0:43 to 0:50 | `proof/01-sponsor-live.png` | Slow push in on the "Claim 0.1 USDC" button | `overlays/sponsor-tx.png` from 0:45 |
| 0:50 to 0:55 | `app/05-quest-detail.png` | Push in on the "Sponsored quest" card at the right | |
| 0:55 to 1:00 | `proof/02-claimed.png` | Hold | |
| 1:00 to 1:07 | `proof/03-explorer-success.png` | Slow push in on the "Success" badge | `overlays/contract-address.png` from 1:01 |
| 1:07 to 1:12 | `app/07-sponsor-live.png` | Push in on the totals row | `overlays/claim-tx.png` from 1:08 |

**Voiceover:** "This is Arc mainnet with real USDC. A sponsor puts up half a dollar, ten cents each for five people, behind the first quest. Someone who completed it taps claim. The contract checks their quest record and pays them directly. Both transactions are public, and the page counts every payout. Whatever nobody claims goes back to the sponsor when the bounty ends."

**Caption:** Arc mainnet. Real USDC. Paid by the contract.

## Scene 5. Built with Arc Studio (1:12 to 1:40)

| Time | Image | Motion | Overlay |
| --- | --- | --- | --- |
| 1:12 to 1:16 | `cards/05-studio.png` | Hold | |
| 1:16 to 1:24 | `studio/01-sponsor-tools-plan.png` | Slow pan down the screenshot | |
| 1:24 to 1:31 | `studio/02-merges-with-main.png` | Slow push in | |
| 1:31 to 1:36 | `studio/03-pushed.png` | Hold | `overlays/studio-project.png` from 1:32 |
| 1:36 to 1:40 | `app/08-sponsor-payouts-studio.png` | Push in on the "Built with Arc Studio" card | |

If the owner supplies more Studio screenshots (the first session's plan, "71/71 pass", the audit table, the testnet deploy cards), render them with `build.mjs` and give them 1:16 to 1:31, moving 01 to 03 later and shortening each.

**Voiceover:** "We built this with Arc Studio. Studio read our repo and wrote the bounty contract and its deploy script. It ran the tests, audited our contracts and deployed everything to testnet first. Then it built the sponsor tools, top up and close and refund, and pushed them to GitHub. We reviewed every change, and the same contract now runs on mainnet."

**Caption:** Written, tested, audited and deployed with Arc Studio.

## Scene 6. Why it matters (1:40 to 1:52)

| Time | Image | Motion |
| --- | --- | --- |
| 1:40 to 1:46 | `cards/06-why.png` | Hold |
| 1:46 to 1:52 | `app/03-quests-sponsored.png` | Slow pan down |

**Voiceover:** "Apps pay only for people who actually used them. New users get a reason to try Arc, and they get paid for it. Next, we're bringing app teams on to sponsor first steps in their own apps."

**Caption:** Apps pay for real users. New users get paid to learn Arc.

## Scene 7. Close (1:52 to 2:00)

| Time | Image | Motion |
| --- | --- | --- |
| 1:52 to 2:00 | `cards/07-close.png` | Hold, fade to black over the last 0.5 s |

**Voiceover:** "Arcway. Find Arc, try it, get paid. arcway dot world."

**Caption:** arcway.world
