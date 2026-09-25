# ARCWAY UI / VISUAL SYSTEM BRIEF

**Status:** Working design direction  
**Product:** Arcway  
**Network:** Arc Mainnet  
**Document purpose:** UI/UX, visual identity, page composition, component system, and implementation guidance.

---

## 01. Design thesis

Arcway should feel like a **technical product built around a financial network**, not like another generic crypto dashboard.

The reference images establish a clear visual language:

- dark, spacious canvases
- strong geometric typography
- large hero objects
- glass / chrome / translucent surfaces
- deep navy and electric blue
- restrained use of bright accents
- modular dashboard layouts
- large empty areas around important content
- visual hierarchy created through scale rather than excessive decoration
- product screens that look like a designed system rather than a collection of cards

The target feeling is:

> **calm + technical + premium + experimental + trustworthy**

Avoid:

- rainbow crypto gradients
- excessive neon
- crowded dashboards
- generic Web3 rounded-card layouts
- giant gradients behind every section
- excessive glassmorphism
- too many badges
- emoji as UI decoration
- fake financial metrics
- visual noise used to make the product look "Web3"

Arcway should look credible enough for a developer and approachable enough for someone discovering Arc for the first time.

---

# 02. Relationship to Arc

Arcway is an independent application **built on Arc**.

The UI should visually complement Arc without pretending to be an official Circle/Arc product.

Use language such as:

- "Built on Arc"
- "Discover apps on Arc"
- "Arc Mainnet"
- "Powered by USDC gas"
- "Settled on Arc"

Avoid language such as:

- "Official Arc app"
- "Arc's official discovery platform"
- "Circle-powered" unless technically and legally accurate
- wording that implies endorsement or ownership by Circle

Use the official Arc logo only according to Arc/Circle's current brand guidance. Do not redraw or modify the Arc mark.

The Arc brand kit specifies clear space around the Arc logo and a 50px minimum digital height. Treat that as the minimum, not the target size.

---

# 03. Visual direction

## Primary visual reference

The strongest reference combination is:

**Reference 01 — glass pill / stacked forms**

Use this as inspiration for:

- hero backgrounds
- achievement objects
- onboarding illustrations
- section dividers
- abstract Arc-native visualizations

The forms should not become decorative everywhere. One large object is stronger than ten small objects.

---

## Secondary reference

**Reference 02 — bold geometric wordmark**

Use this as inspiration for:

- wordmark exploration
- large section titles
- category labels
- campaign / event screens

The important characteristic is not the exact font. It is the **heavy geometric construction and unusual silhouette**.

---

## Third reference

**Reference 03 — dark blue editorial composition**

This establishes the core color environment:

- deep navy
- electric blue
- soft blue-white
- large empty space
- high contrast
- restrained typography

This should influence the marketing / landing experience more than the internal dashboard.

---

## Fourth reference

**Reference 04 — compact custom wordmark**

This is useful for thinking about Arcway's own visual identity.

Do not copy the construction.

Instead, explore:

- custom letter spacing
- slightly modified geometric forms
- one distinctive letter
- compact wordmark proportions
- strong silhouette at small sizes

---

## Fifth and sixth references

**Reference 05/06 — monochrome dashboard wireframes**

These are particularly useful for product architecture.

They suggest:

- one dominant workspace
- a clear primary content region
- secondary utility panels
- small information blocks
- controlled card density
- visual hierarchy through size
- modular composition

Arcway should follow this principle:

> **One screen, one dominant action.**

---

# 04. Color system

The palette should be Arc-compatible without attempting to become a copy of Arc's identity.

## Core colors

```text
ARCWAY NIGHT
#050A18

ARCWAY NAVY
#07152F

ARCWAY DEEP BLUE
#0B2A63

ARCWAY BLUE
#155EEF

ARCWAY ELECTRIC
#3B82F6

ARCWAY SKY
#8CCBFF

ARCWAY ICE
#EAF5FF

ARCWAY WHITE
#F7FAFF

ARCWAY MUTED
#91A0B8

ARCWAY LINE
#183052
```

## Accent

Use a warm accent sparingly for actions that deserve attention.

```text
SIGNAL ORANGE
#FF8A3D
```

The orange should represent:

- attention
- new
- external action
- milestone
- special event

It should NOT become the main brand color.

---

# 05. Color ratios

A recommended visual distribution:

```text
70%  deep navy / dark surfaces
20%  white / cool text
8%   Arc-compatible blue
2%   warm signal accent
```

Do not give every component a blue fill.

Blue should create hierarchy.

---

# 06. Background system

## Base

```css
background: #050A18;
```

## Secondary surface

```css
background: #07152F;
```

## Elevated surface

```css
background: rgba(18, 43, 84, 0.55);
```

## Glass surface

```css
background: rgba(255, 255, 255, 0.045);
border: 1px solid rgba(180, 215, 255, 0.10);
backdrop-filter: blur(18px);
```

Glass is a material, not a default component style.

Use it for:

- featured quests
- wallet state
- hero panels
- special achievements

Do not use it for every card.

---

# 07. Typography

The references strongly suggest a modern geometric sans.

## Primary recommendation

**Geist Sans**

Use:

- 400 body
- 500 interface
- 600 headings
- 700 hero / display only

## Technical companion

**Geist Mono**

Use for:

- transaction hashes
- wallet addresses
- chain IDs
- contract addresses
- timestamps
- XP values
- gas values
- technical metadata
- status labels
- developer-facing information

This creates a useful visual split:

```text
Geist Sans  → human-facing product
Geist Mono  → blockchain-facing information
```

## Alternative display font

If a more editorial / geometric personality is required:

**Space Grotesk**

Use it only as a display alternative, not alongside five other fonts.

---

# 08. Type scale

Desktop:

```text
Display XL    72 / 0.96 / 600
Display       56 / 1.00 / 600
H1            44 / 1.05 / 600
H2            32 / 1.10 / 600
H3            24 / 1.20 / 600
Title         20 / 1.25 / 600
Body          16 / 1.50 / 400
Body Small    14 / 1.45 / 400
Label         12 / 1.20 / 600
Mono          12 / 1.30 / 400
```

For large headlines:

```css
letter-spacing: -0.045em;
```

For labels:

```css
letter-spacing: 0.08em;
text-transform: uppercase;
```

Do not overuse uppercase.

---

# 09. Typography behavior

Headlines should be short.

Prefer:

> Discover what is being built on Arc.

over:

> Explore our comprehensive ecosystem of innovative applications built by developers across the Arc blockchain ecosystem.

The UI should communicate in product language.

Examples:

```text
Discover
Complete
Verify
Earn
Build
Ship
Explore
```

Avoid:

```text
Unlock the future
Enter the next era
Revolutionize your journey
Experience Web3 like never before
```

---

# 10. Layout system

Use a 12-column desktop grid.

```text
Max width: 1440px
Content width: 1180–1280px
Outer padding: 32–48px
Column gap: 20–24px
```

Mobile:

```text
Outer padding: 20px
Column gap: 12–16px
```

Vertical rhythm:

```text
8px   micro
12px  compact
16px  default
24px  component
32px  section
48px  major section
72px  page section
120px hero spacing
```

---

# 11. Corner radius

Avoid the "everything is a pill" crypto aesthetic.

Recommended:

```text
Small controls       8px
Cards                14px
Large panels         20px
Hero surfaces        28px
Pills                999px
```

Pills should be reserved for:

- status
- tags
- filters
- small controls

---

# 12. Borders and depth

Use subtle borders rather than heavy shadows.

Default:

```css
border: 1px solid rgba(170, 205, 255, 0.10);
```

Hover:

```css
border-color: rgba(100, 170, 255, 0.30);
```

Active:

```css
border-color: rgba(80, 150, 255, 0.55);
```

Shadow:

```css
box-shadow:
  0 20px 60px rgba(0, 0, 0, 0.25);
```

Never make every card glow.

---

# 13. Hero composition

The homepage hero should NOT look like a normal SaaS hero.

Recommended composition:

```text
┌────────────────────────────────────────────────────────────┐
│ ARCWAY                                    Explore  Connect │
│                                                            │
│                         small label                        │
│                                                            │
│       DISCOVER WHAT'S                                      │
│       BEING BUILT                                          │
│       ON ARC.                                               │
│                                                            │
│       Find apps, quests, experiments and                    │
│       useful things to do on Arc.                           │
│                                                            │
│       [ Explore apps ]   [ Build on Arc ]                   │
│                                                            │
│                              ┌──────────────────────┐       │
│                              │ abstract glass object│       │
│                              │ / ecosystem visual   │       │
│                              └──────────────────────┘       │
└────────────────────────────────────────────────────────────┘
```

The hero should have substantial negative space.

---

# 14. Landing page deck arrangement

The homepage should feel like a deck, not a traditional dashboard.

## Slide 01 — Opening

Purpose:

Explain the product in one sentence.

```text
DISCOVER
WHAT'S BEING
BUILT ON ARC.
```

Small supporting line:

```text
A discovery layer for apps, experiments and
onchain experiences built on Arc.
```

CTA:

```text
Explore apps
```

Secondary:

```text
Build on Arc
```

---

## Slide 02 — The problem

Use a large statement.

```text
ARC IS LIVE.

BUT DISCOVERY IS STILL FRAGMENTED.
```

Then show:

```text
Apps
Quests
Experiments
Builders
Infrastructure
```

as separated visual nodes.

The point is not to attack existing products.

The point is to show the discovery gap.

---

## Slide 03 — The network map

This should be the first highly visual section.

Show:

```text
                  ARC
                   │
       ┌───────────┼───────────┐
       │           │           │
     APPS        QUESTS      BUILDERS
       │           │           │
     DEFI       MISSIONS      REPOS
       │           │           │
    PAYMENTS     XP          PROFILES
```

The final implementation should be more visually sophisticated than a literal diagram.

Use glowing paths and restrained nodes.

---

## Slide 04 — Discover

This becomes the product.

Layout:

```text
┌───────────────────────────────────────────────────────────┐
│ Discover                                                   │
│                                                           │
│ [All] [Apps] [Quests] [Payments] [DeFi] [Tools]          │
│                                                           │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ │
│ │ FEATURED                 │ │ NEW                      │ │
│ │                          │ │                          │ │
│ │ large app visual         │ │ app                      │ │
│ │                          │ │ app                      │ │
│ │ title                    │ │ app                      │ │
│ └──────────────────────────┘ └──────────────────────────┘ │
│                                                           │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│ │ App        │ │ Quest      │ │ Tool       │              │
│ └────────────┘ └────────────┘ └────────────┘              │
└───────────────────────────────────────────────────────────┘
```

---

# 15. App cards

An app card should contain:

```text
visual
category
name
one-line description
Arc usage
status
CTA
```

Example:

```text
PAYMENTS

FlowPay

USDC payment rails for
cross-border settlement.

● Live on Arc

Open →
```

Do not fill cards with meaningless metrics.

---

# 16. Quest cards

Quest cards should feel more like missions than advertisements.

```text
QUEST 01

Make your first Arc transaction

+50 XP

Difficulty
Easy

[ Start quest ]
```

Optional:

```text
Reward
50 XP

Time
2 min
```

---

# 17. User profile

Profile should be a **progress identity**, not a financial portfolio.

Recommended:

```text
┌──────────────────────────────────────────┐
│ BUILDER                                  │
│                                          │
│ 1,240 XP                                 │
│ ████████████████░░░░                    │
│                                          │
│ 12 quests completed                      │
│ 4 badges                                 │
│ 7 apps explored                          │
└──────────────────────────────────────────┘
```

Avoid:

- token price
- fake net worth
- financial ranking
- unnecessary portfolio metrics

---

# 18. Passport / badge visual

The Passport should be visually connected to the stacked-glass reference.

Think:

```text
┌─────────────────────────────┐
│                             │
│        ARCWAY               │
│                             │
│          ◉                  │
│                             │
│       EXPLORER              │
│                             │
│      050 XP                 │
│                             │
└─────────────────────────────┘
```

Badges should feel collectible but not like NFT profile pictures.

Use:

- abstract geometry
- translucent layers
- blue light
- thin outlines
- small technical metadata

---

# 19. Navigation

Desktop:

```text
ARCWAY

Discover
Quests
Builders

──────────

My Passport

──────────

[ Connect wallet ]
```

Top utility:

```text
Search
Network: Arc
Wallet
```

Avoid a navigation bar with 12 destinations.

The initial product should have approximately 4–6 primary destinations.

---

# 20. Dashboard composition

The main dashboard should follow the reference wireframes:

```text
┌──────────┬────────────────────────────────────┬───────────┐
│          │                                    │           │
│ NAV      │ MAIN CONTENT                       │ ACTIVITY  │
│          │                                    │           │
│          │ large feature                      │ latest    │
│          │                                    │ events    │
│          │────────────────────────────────────│           │
│          │ cards / quests / apps              │           │
│          │                                    │           │
└──────────┴────────────────────────────────────┴───────────┘
```

The right panel should be optional.

On mobile:

```text
Header
Hero
Featured
Filters
Cards
Activity
Bottom navigation
```

---

# 21. Search

Search is strategically important.

It should allow:

```text
app name
builder
quest
category
contract
chain feature
```

Example:

```text
Search Arcway

Try:
"payments"
"USDC"
"lending"
"quests"
"builder"
```

Results should be grouped:

```text
Apps
Builders
Quests
```

---

# 22. Filters

Use compact horizontal controls:

```text
All
Apps
Quests
DeFi
Payments
Infrastructure
Tools
```

Selected state:

```text
background: rgba(59,130,246,.16)
border: rgba(100,170,255,.35)
color: #EAF5FF
```

Do not use large colorful filter cards.

---

# 23. Motion

Motion should communicate state.

Use:

```text
150ms  micro interaction
220ms  component transition
350ms  panel transition
600ms  hero entrance
```

Preferred easing:

```text
cubic-bezier(0.22, 1, 0.36, 1)
```

Good motion:

- glass object drifting slowly
- card entering
- node activating
- quest completion
- XP increment
- badge reveal

Bad motion:

- constant spinning
- excessive parallax
- bouncing buttons
- every card floating
- animated gradients everywhere

Respect:

```text
prefers-reduced-motion
```

---

# 24. Glass / 3D object rules

The first reference image is useful for the brand language.

Use the object as a **hero primitive**.

Characteristics:

- vertically elongated rounded rectangles
- progressively brighter blue
- thin white-blue rim
- deep internal shadow
- subtle bloom
- black/navy environment
- overlapping layers

Possible semantic interpretation:

```text
Layer 1 → Arc
Layer 2 → Apps
Layer 3 → Builders
Layer 4 → Quests
Layer 5 → Users
Layer 6 → Activity
```

Do not literally label each glass object.

The abstraction should communicate a connected system.

---

# 25. Iconography

Use one icon family.

Recommended:

- Lucide
- custom simple line icons

Stroke:

```text
1.5px
```

Avoid:

- cartoon icons
- emoji
- inconsistent filled/outlined icons
- giant decorative icons

Icons should support navigation and comprehension.

---

# 26. Buttons

Primary:

```text
background: #EAF5FF
color: #07152F
```

This creates a premium contrast against the navy UI.

Secondary:

```text
background: rgba(255,255,255,.05)
border: 1px solid rgba(255,255,255,.12)
color: #F7FAFF
```

Blue action:

```text
background: #155EEF
color: #FFFFFF
```

Use the blue action when the action is explicitly Arc/onchain related.

---

# 27. Wallet connection

The connect flow should not dominate the interface.

Initial state:

```text
Connect wallet
```

Connected:

```text
0xA91...7F2
Arc
```

Expanded:

```text
Wallet
0xA91...7F2

Network
Arc Mainnet

USDC
12.40

[ Disconnect ]
```

Use monospace for addresses and technical values.

---

# 28. Transaction states

Every onchain action should have clear states.

```text
Ready
↓
Waiting for wallet
↓
Submitting
↓
Confirming
↓
Confirmed
```

Example:

```text
Confirming on Arc

Your transaction has been submitted.
Waiting for network confirmation.

View transaction →
```

Never show a fake "success" before confirmation.

---

# 29. Empty states

Empty states should be useful.

Bad:

```text
Nothing here.
```

Better:

```text
No quests yet.

New Arc quests will appear here
as builders publish them.

[ Explore apps ]
```

---

# 30. Error states

Use direct language.

```text
Transaction failed

The transaction was rejected or could not
be confirmed.

[ Try again ]   [ View details ]
```

Technical detail can be expandable.

---

# 31. Loading states

Avoid skeleton overload.

Use:

- subtle shimmer
- simple blocks
- progressive content loading

For important network activity:

```text
Connecting to Arc...
```

For indexing:

```text
Syncing activity...
```

---

# 32. Data density

The product should be intentionally less dense than a block explorer.

Arcway is a discovery product.

Therefore prioritize:

```text
What is this?
Why should I care?
What can I do?
```

over:

```text
gasUsed
nonce
blockNumber
calldata
```

Technical information remains accessible, but secondary.

---

# 33. Mobile strategy

Mobile is not a shrunk desktop.

Primary mobile flow:

```text
Discover
  ↓
Open app
  ↓
Understand
  ↓
Connect
  ↓
Complete action
  ↓
Receive verification
  ↓
Progress
```

Bottom navigation:

```text
Discover
Quests
Passport
```

Keep the primary action reachable with one thumb.

---

# 34. Responsive breakpoints

```text
Mobile:   < 640px
Tablet:   640–1024px
Desktop:  > 1024px
Wide:     > 1440px
```

At tablet width:

- reduce columns
- collapse right utility panel
- keep the primary content dominant

At mobile:

- one column
- bottom navigation
- stacked cards
- horizontal filter scrolling
- no desktop-style sidebars

---

# 35. Component inventory

Initial component library:

```text
AppShell
Navbar
Sidebar
MobileNav

Button
IconButton
Badge
Tag
StatusPill

Search
FilterBar
Tabs

AppCard
FeaturedApp
QuestCard
BuilderCard
BadgeCard

PassportCard
XPProgress
ActivityList

WalletButton
WalletPanel
TransactionStatus

HeroObject
NetworkMap
SectionHeader

EmptyState
ErrorState
LoadingState
Toast
Modal
Drawer
```

---

# 36. Design tokens

Recommended CSS variables:

```css
:root {
  --aw-night: #050A18;
  --aw-navy: #07152F;
  --aw-deep: #0B2A63;

  --aw-blue: #155EEF;
  --aw-electric: #3B82F6;
  --aw-sky: #8CCBFF;

  --aw-ice: #EAF5FF;
  --aw-white: #F7FAFF;

  --aw-muted: #91A0B8;
  --aw-line: #183052;

  --aw-signal: #FF8A3D;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 72px;
  --space-9: 120px;
}
```

---

# 37. Page architecture

Initial routes:

```text
/
    Landing / Discover

/apps
    App discovery

/apps/[slug]
    App detail

/quests
    Quest discovery

/quests/[id]
    Quest detail

/builders
    Builder discovery

/builders/[address]
    Builder profile

/passport
    User progress / Passport

/activity
    User activity

/search
    Global search
```

Do not build every route before the MVP works.

---

# 38. MVP screen priority

Build in this order:

## P0

1. Landing / Discover
2. App detail
3. Quest detail
4. Wallet connection
5. Transaction status
6. Passport

## P1

7. Search
8. Filters
9. Builder profiles
10. Activity
11. Badge detail

## P2

12. Leaderboards
13. Social discovery
14. Recommendations
15. Advanced analytics

---

# 39. First screen implementation

The first usable page should contain:

```text
NAV
↓
HERO
↓
FEATURED ARC APPS
↓
QUESTS
↓
BUILDERS
↓
RECENT ACTIVITY
↓
FOOTER
```

Do not build the entire ecosystem before this page works.

---

# 40. UI content model

Every app should eventually have:

```ts
type ArcApp = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  url: string
  logo?: string
  cover?: string
  status: "live" | "beta" | "experimental"
  arcContracts?: string[]
  features: string[]
  builderId?: string
}
```

Quest:

```ts
type Quest = {
  id: string
  title: string
  description: string
  xp: number
  difficulty: "easy" | "medium" | "hard"
  appId?: string
  actionType: string
  verifier: string
  active: boolean
}
```

Builder:

```ts
type Builder = {
  id: string
  name: string
  handle?: string
  github?: string
  farcaster?: string
  x?: string
  avatar?: string
  apps: string[]
}
```

---

# 41. Discovery ranking

Do not make the first version dependent on a complicated algorithm.

Initial ordering:

```text
1. Featured
2. New
3. Verified
4. Recently active
5. Category
```

Later:

```text
personalized recommendations
```

The ranking system should remain explainable.

---

# 42. Trust signals

Because Arcway introduces users to unfamiliar applications, trust is a product feature.

Possible labels:

```text
LIVE
VERIFIED
EXPERIMENTAL
NEW
COMMUNITY
```

Avoid:

```text
SAFE
GUARANTEED
TRUSTED
SECURE
```

unless there is a clearly defined verification process supporting the claim.

A verified badge should have an actual verification meaning.

---

# 43. Verification UI

Example:

```text
ARCWAY VERIFIED

Contract
0x123...abc

Verified deployment
✓ Arc Mainnet

Source
✓ Public repository

Last checked
2h ago
```

Verification should be factual, not promotional.

---

# 44. Arc-native visual language

Arc's current positioning emphasizes:

- USDC-native gas
- sub-second finality
- financial applications
- payments
- FX
- tokenized value
- agentic economic activity
- institutional-grade infrastructure

Arcway should translate those properties into product categories rather than merely repeating them in marketing copy.

Example categories:

```text
PAYMENTS
TRADING
DEFI
FX
ASSETS
TOOLS
AGENTS
INFRASTRUCTURE
EXPERIMENTS
```

---

# 45. What makes the UI feel Arc-native

Do not rely on the word "Arc" everywhere.

Instead, make the interface naturally communicate:

```text
dollar-native
fast
financial
connected
technical
open
```

Visual translation:

```text
USDC     → clean numeric presentation
Speed    → responsive interaction
Finance  → precision
Network  → connected visual structures
Technical→ mono metadata
```

---

# 46. Design anti-patterns

Never let the product become:

### Crypto casino

Avoid:

- red/green price walls
- huge token numbers
- speculative language
- flashing rewards

### SaaS template

Avoid:

- generic purple gradient
- oversized rounded white cards
- stock illustrations
- "10x your productivity" copy

### Block explorer clone

Avoid:

- giant transaction tables
- raw data as the homepage
- technical information dominating discovery

### NFT gallery

Avoid:

- excessive collectible framing
- artificial rarity
- floor-price style UI

Arcway is a **discovery and participation layer**.

---

# 47. Marketing page vs application

Use two related but distinct densities.

## Marketing

```text
large type
large objects
large whitespace
few controls
strong narrative
```

## Application

```text
smaller type
higher information density
clear controls
functional cards
technical metadata
```

Do not make the entire app look like a landing page.

---

# 48. Deck-like transitions

If the homepage becomes a scroll narrative, use section transitions like slides:

```text
01 / INTRO
02 / PROBLEM
03 / NETWORK
04 / DISCOVER
05 / QUESTS
06 / PASSPORT
07 / BUILD
08 / CTA
```

A tiny mono page marker can reinforce this:

```text
01 / 08
```

Use it sparingly.

---

# 49. Visual hierarchy formula

Every page should answer:

```text
1. Where am I?
2. What matters here?
3. What can I do?
4. What happened?
5. What happens next?
```

If a screen cannot answer those questions quickly, reduce its complexity.

---

# 50. Accessibility

Minimum targets:

```text
Body contrast: WCAG AA
Interactive target: 44px+
Keyboard focus: visible
Reduced motion: supported
Color: never the only status indicator
```

For blue-on-dark combinations, test actual contrast instead of assuming the color is accessible.

---

# 51. Implementation stack

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
Geist / Geist Mono
Lucide
Framer Motion
wagmi
viem
```

For 3D hero elements:

```text
CSS first
SVG second
Three.js only if necessary
```

Do not introduce Three.js just to create a decorative blob.

---

# 52. Image and asset strategy

Use three asset categories:

```text
1. Product screenshots
2. Abstract Arcway visual primitives
3. Builder/app logos
```

Builder logos should not determine the entire UI palette.

Put logos inside controlled containers.

---

# 53. Logo handling

Arcway needs its own identity.

The wordmark should be:

- geometric
- compact
- readable at small sizes
- strong in monochrome
- suitable for favicon/app icon
- visually compatible with Arc's dark/blue environment

Do not imitate the Arc logo.

Possible exploration:

```text
ARCWAY
ARC / WAY
ARCWAY.
ARCWAY_
```

These are explorations, not final naming recommendations.

---

# 54. Suggested logo direction

The name should be represented primarily through typography.

The symbol can be derived from:

- a path
- a route
- an arch
- a connected node
- a directional transition

Avoid creating a literal "A" from the Arc logo.

The symbol should belong to Arcway.

---

# 55. Visual QA checklist

Before shipping a page:

### Hierarchy

- Is there one obvious primary element?
- Is the CTA obvious?
- Is the page title clear?

### Typography

- Are headings too long?
- Is tracking appropriate?
- Is mono used only where useful?

### Color

- Is blue being overused?
- Is orange actually necessary?
- Are surfaces distinguishable?

### Density

- Is there too much information?
- Can a user scan the page in 3 seconds?

### Motion

- Does animation explain something?
- Does the page remain usable with motion disabled?

### Trust

- Are verification claims factual?
- Are transaction states accurate?

---

# 56. Recommended first design pass

Build only these screens first:

```text
01  Discover
02  App detail
03  Quest detail
04  Passport
05  Wallet / transaction modal
```

The visual system should be validated across those five screens before expanding.

---

# 57. The visual north star

The product should feel like:

> **A dark, precise discovery interface for a new financial network.**

Not:

> "another Web3 dashboard."

The reference images are strongest when they use **large form + typography + negative space + controlled information density**.

That combination should define Arcway.

---

# 58. Sources / brand reference

Use the current official Arc/Circle materials as the source of truth for Arc branding and network claims.

Relevant official material reviewed for this brief:

- Circle — Arc Mainnet launch announcement
- Circle — Arc and Circle Infrastructure report
- Circle — Circle Brand Kit / Arc logo guidance
- Circle — Introducing Arc
- Circle — Arc public testnet announcement

Important current Arc facts reflected in the architecture:

- Arc is an EVM-compatible Layer 1.
- Arc uses USDC for network gas.
- Arc's public mainnet launched in September 2026.
- Arc is positioned around financial markets, payments, real-time money movement and agentic economic activity.
- Circle provides native infrastructure integrations around Arc.

The product should use current official documentation for exact network configuration and branding rather than hard-coding assumptions from older Arc testnet material.

---

# 59. Final build principle

Do not attempt to design the entire ecosystem at once.

Ship the visual language through one complete loop:

```text
DISCOVER
   ↓
OPEN APP
   ↓
CONNECT WALLET
   ↓
COMPLETE ACTION
   ↓
VERIFY
   ↓
EARN XP
   ↓
UPDATE PASSPORT
```

If this loop feels excellent, the rest of Arcway can grow around it.

**Build the system, not a collection of screens.**
