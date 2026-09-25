# Arcway UX: flows and states

The product question is **"I just arrived on Arc. What should I do next?"**
Every screen state below exists to answer that with one clear action.

## The next-step engine

`lib/journey.ts` → `nextStep()` returns exactly one step. Order:

| # | Condition | Step | Action |
|---|-----------|------|--------|
| 1 | No wallet connected | Connect a wallet | Connect |
| 2 | Connecting / restoring session | Loading | – |
| 3 | Arc RPC reads failed | Arc is not responding | Retry (+ explorer link) |
| 4 | Balance / nonce still loading | Loading | – |
| 5 | A quest is done but not yet recorded (and recording is on) | Record it | Record +XP |
| 6 | 0 USDC and 0 transactions | Bring USDC | Scroll to onboarding |
| 7 | Next step needs a transaction and wallet is on another network | Switch to Arc | Explicit switch |
| 8 | No transactions yet | Make your first transaction | Discover |
| 9 | No verified-app interaction yet | Use a verified app | Discover |
| 10 | Everything done | Starter path complete | Discover more |

Rules baked in:

- **Never silently switch networks.** Switching only happens on a click, and we
  only ask when the next step needs an Arc transaction. Reading balances and
  recording quests work from any network.
- **Recording costs the user nothing.** The verifier signs and pays gas, so the
  claim step comes before any wallet action.
- **Mainnet is called out.** On mainnet a notice says transactions use real USDC.

## Quest states

`lib/quests.ts` → `questViews()`:

- `locked` – prerequisites aren't recorded yet ("Unlocks after: …").
- `todo` – not done; shows the server's reason or a how-to.
- `claimable` – done on Arc; ready to record.
- `completed` – recorded on the passport.

Eligibility comes from the server (`/api/progress`), never from the browser.

## Claim lifecycle

`lib/hooks/claims.tsx`: `idle → verifying → confirming (tx link) → recorded`
or `error` with a plain-language message. Double clicks are ignored, and a retry
while a claim is still pending returns the same transaction instead of sending
a new one. When the receipt lands, balance, passport and progress all refresh.

Server errors map to user copy:

| Code | Meaning to the user |
|------|---------------------|
| `recording_unavailable` | Passport recording opens soon; progress still counts |
| `not_eligible` | Specific reason, e.g. "No transactions from this wallet on Arc yet." |
| `rate_limited` | Try again in N seconds |
| `arc_unavailable` / `submit_failed` | Temporary; nothing lost; retry |

## Wallet errors

`lib/errors.ts` → `humanizeError()` walks viem/wagmi cause chains and returns one
actionable sentence: cancelled in wallet, request already open, no wallet
installed, chain unknown to wallet, wallet can't switch, insufficient USDC for
fees, Arc unreachable.

## Discovery

- Search by intent ("pay", "swap", "yield") plus category filters with counts;
  empty categories are hidden.
- Verified listings rank first, then unverified, then sample placeholders.
- Sample listings have no link; unverified listings say their interactions
  don't count for quests.
- Opening an app remembers the visit (localStorage, safe when blocked) and
  progress refetches when the tab regains focus, so returning feels live.

## Loading, empty and failure states

Every data surface has all three: balance (`…` / `unavailable`), passport
(`Retry`), activity (loading / "No transactions yet" / retry), discovery
("No apps match" + clear filters). RPC calls fail fast (1 retry, 8s timeout)
so outages become a retry step, not an endless spinner.

## Accessibility

Skip link, labelled sections, `aria-live` status and `role="alert"` errors,
`aria-busy` on pending buttons, `aria-pressed` filters, visible focus rings,
focus moves to the target section when the journey scrolls you there, and
reduced-motion is respected.
