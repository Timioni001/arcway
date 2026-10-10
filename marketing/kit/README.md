# Arcway submission and social kit

Everything for the Arc Microgrants submission on DoraHacks and for the Arcway X account.

| File | What it is |
|---|---|
| [DORAHACKS.md](DORAHACKS.md) | Ready-to-paste answers for every step of the DoraHacks form, plus the YouTube title and description |
| [X_ACCOUNT.md](X_ACCOUNT.md) | Profile setup, two weeks of posts, a reply bank and alt text |
| `png/arcway-logo-480.png` | DoraHacks build logo (480 × 480) |
| `png/arcway-avatar-400.png`, `png/arcway-avatar-1000.png` | X profile picture |
| `png/arcway-launch-*` | Launch-day announcement, 1600 × 900, 1080 × 1080 and 1080 × 1350 |
| `png/arcway-how-*`, `png/arcway-free-*`, `png/arcway-trust-*` | Post images, 1600 × 900 and 1080 × 1080 |
| `png/arcway-architecture-1600x900.png` | How a quest gets on your Passport |
| `video/arcway-demo.mp4` | Demo walkthrough of the real app (1920 × 1080) |
| `video/arcway-teaser-{land,square,vertical}.mp4` | 19-second teasers for 16:9, 1:1 and 9:16 |

The X header and the first launch graphics live in `../launch/png/`, with captions in `../launch/CAPTIONS.md`.

## Re-rendering

Sources are in `src/` (HTML plus two Playwright scripts). Run from the repository root after `npm ci`:

```bash
# Stills
node marketing/kit/src/render.mjs

# Teasers (no app needed)
node marketing/kit/src/video.mjs teaser-land
node marketing/kit/src/video.mjs teaser-square
node marketing/kit/src/video.mjs teaser-vertical

# Demo: records the real app, so build and start it in mainnet mode first
printf 'NEXT_PUBLIC_ARC_NETWORK=mainnet\nNEXT_PUBLIC_PASSPORT_CONTRACT=0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c\nNEXT_PUBLIC_CAMPAIGNS_CONTRACT=0x229f7A3bbd861149bfF05EAACa186e7ffaEEc26c\n' > .env.local
npx next build && npx next start -p 3100 &
node marketing/kit/src/video.mjs demo        # or APP_URL=https://arcway.world node … to record production
```

Videos are rendered frame by frame at 30 fps, so they come out smooth however slow the machine is. They need
`ffmpeg` on the path. To change a caption or the order of scenes in the demo, edit the `demo` block at the
bottom of `src/video.mjs`; title cards are in `src/card.html`.
