# Brief for the video agent

Paste everything below the line into the agent that will make the video, and attach every PNG in this folder (`cards/`, `app/`, `proof/`, `studio/`, `overlays/`) together with `SCRIPT.md`.

---

You are editing a 2-minute product demo for Arcway, a web app on Arc mainnet. It is a grant submission. Judges check every claim against the blockchain and the code, so accuracy matters more than flair.

Follow `SCRIPT.md` exactly. It gives the image, timing, motion, overlay, voiceover and caption for every scene.

## Hard rules

1. **Use only the attached images.** Do not generate, draw, mock up or "enhance" any app screen, explorer page, wallet, code or chart. Do not add stock footage, coins, people, hands, phones, laptops or 3D objects.
2. **Don't change what an image says.** No retouching, no replaced numbers, no blurring text, no cropping that cuts off an address, amount or the "Success" badge. Pan and zoom are allowed only within the limits below.
3. **Use the voiceover and captions word for word.** Don't add claims, numbers, user counts, partnerships or superlatives.
4. **Motion.**
   - Slow push-ins and pans only, at most 8% scale change per shot.
   - No spins, shakes, glitch effects, whip pans or 3D tilts.
   - Cuts are 0.3 to 0.5 second crossfades.
5. **Overlays.**
   - Place the PNGs from `overlays/` unscaled at their native position, since they are already laid out for 1920×1080.
   - Fade them in over 0.3 seconds and keep each one on screen for at least 4 seconds.
6. **Captions.**
   - Use one line at the bottom center, in Geist or Inter at 44 px or larger.
   - Use white text on a 70% black rounded box.
   - Don't place a caption over an overlay. If they'd overlap, move the caption to the top center.
7. **Voice.**
   - Use one calm, clear, neutral English voice at about 150 words a minute, with no hype.
   - Say "arcway dot world" for the URL. Say each number as written.
8. **Music.**
   - One understated instrumental track, about 20 dB below the voice.
   - No lyrics and no drops.
   - Fade it in over the first 2 seconds and out over the last 3.
9. **Length.** The video runs 1:55 to 2:05. If the voice runs long, slow it by up to 5% or extend holds on cards. Never cut scene 4.
10. **Output.**
    - An MP4 (H.264, 1920×1080, 30 fps, AAC 192 kbps).
    - A matching `.srt` file of the captions.
    - A 1280×720 thumbnail made from `cards/04-mainnet.png`, unchanged.

## What the images are

| File | Shows |
| --- | --- |
| `cards/01` to `cards/07` | Title cards for each scene, in Arcway's colors |
| `app/01-home.png` | The arcway.world home page |
| `app/02-explore.png` | The app directory |
| `app/03-quests-sponsored.png` | The Quests page with the Sponsored quests section and live totals |
| `app/04-quests-paid-tag.png` | Quest cards; the first shows "Pays 0.1 USDC" |
| `app/05-quest-detail.png` | The "Arrive on Arc" quest with its sponsored reward |
| `app/06-sponsor.png` | The Sponsor page form and the "Built with Arc Studio" badge |
| `app/07-sponsor-live.png` | Live totals read from the contract, and the live bounty |
| `app/08-sponsor-payouts-studio.png` | The payout list and the "What Arc Studio built here" card |
| `proof/01-sponsor-live.png` | The owner's tablet right after sponsoring, with the claim button |
| `proof/02-claimed.png` | The bounty after the claim, 4 of 5 left |
| `proof/03-explorer-success.png` | The Arc explorer showing the sponsor transaction succeeded on mainnet |
| `studio/01` to `studio/03` | Arc Studio working on the sponsor tools inside the Arcway repo |
| `overlays/*.png` | Transparent labels for the contract address, both transaction hashes and the Studio project URL |

## Before you deliver

- [ ] Every frame comes from an attached image or a plain color.
- [ ] Scene 4 runs at least 30 seconds and every address and hash is readable when paused.
- [ ] Voiceover and captions match `SCRIPT.md` word for word.
- [ ] Runtime is between 1:55 and 2:05.
