# Arcway contracts: audit

Scope: `ArcwayPassport` and `ArcwayCampaigns` (live on Arc mainnet; review only, not changed) and `ArcwayBounties` (new).

How it was done: the first pass ran in Arc Studio, which read the repo, ran the existing suite (28/28), wrote and deployed `ArcwayBounties` to Arc testnet against mock USDC and a mock passport, and reported findings. Each finding was then checked by hand against the source below. Where Studio's severity didn't hold up, the table says so.

Arc testnet deployment from Studio:

| Contract | Address |
| --- | --- |
| MockUSDCToken | `0x5af723538ba705369669504cd03a6a61fd9dad19` |
| MockPassportView | `0x18e766fe595f32cb6ece467ec9e70fd325612da4` |
| ArcwayBounties | `0x37bb537b9c05aa1de01aad3791ea8e71bc0c9fd6` |

## Live contracts (no changes)

| ID | Contract | Finding | Studio said | Verified |
| --- | --- | --- | --- | --- |
| A1 | Passport, Campaigns | `setVerifier(address(0), …)` reverts for both allow and revoke. | Medium | Info. The zero address can never be a verifier, so there is nothing to revoke. |
| A2 | Campaigns | `publishResults` has no `nonReentrant`. | Medium | Info. It makes no external calls and only writes storage, so there is nothing to re-enter. |
| A3 | Campaigns | `ecrecover` returning `address(0)`. | Medium | Not an issue. `_recover` requires 65-byte signatures, low-s, v of 27/28, and a non-zero signer. |
| A4 | Campaigns | Off-chain tools must not hardcode the domain separator. | Medium | Info. `domainSeparator()` rebuilds it on a chain-id change; the app reads it from the contract. |
| A5 | Passport, Campaigns | `transferOwnership` overwrites a pending owner "with no event". | Low | Incorrect. It emits `OwnershipTransferStarted` every time; overwriting a pending offer is intended. |
| A6 | Campaigns | Raffle/Split minimum reward per winner is 1 base unit, not 1 USDC. | Low | Low, accepted. The app's launch form sets sensible minimums. |
| A7 | Passport | `createdAt` is 0 until the first quest. | Info | Info. The app treats 0 as "no activity yet". |
| A8 | Campaigns | `RESULTS_TIMEOUT` (3 days) is shorter than `MIN_CLAIM_WINDOW` (7 days). | Info | Intended and commented in the source: results are always published before claims close. |

No fund-moving issue was found in either live contract.

## ArcwayBounties

Design: anyone escrows `rewardPerClaim × maxClaims` USDC behind a quest. A wallet whose passport has that quest recorded (`completedQuest(user, questId)`) claims one reward. After expiry the sponsor closes the bounty and gets the unclaimed part back. There is no owner, admin, pause, fee or upgrade path; the only external calls are to USDC and the passport's view.

| ID | Severity | Finding | Status |
| --- | --- | --- | --- |
| B1 | Medium | A fee-on-transfer token would leave the escrow short of what it owes. | Fixed: `_pullExact` checks the balance delta and reverts with `FeeOnTransferRejected`. |
| B2 | Medium | A token with transfer hooks could re-enter `claim`. | Fixed: checks-effects-interactions plus a `nonReentrant` guard on every write. |
| B3 | Low | `canClaim(0, user)` and unknown ids. | Returns false and never reverts. |
| B4 | Info | `close` with nothing left emits `BountyClosed(id, 0)` and moves nothing. | Accepted. |
| B5 | Info | Anyone can `fund` a bounty up to 10,000 claims, so a stranger could fill it to the cap. | Accepted. Funding only adds USDC the sponsor gets back on close. |

## Tests

`forge test`: 46 passing.

- `ArcwayPassport.t.sol` 11 and `ArcwayCampaigns.t.sol` 17, unchanged.
- `ArcwayBounties.t.sol` 17: create, claim, fund and close paths; every revert; isolation between bounties; a fee-on-transfer token; a re-entrant token; and a fuzz test of escrow accounting. These run against the real `ArcwayPassport`, not a mock.
- `invariant_escrowMatchesOpenBounties`: 256 runs, 128,000 random create, fund, complete, claim, close and time-warp calls. The contract's USDC balance always equals what open bounties still owe.

## Deploy (mainnet)

Live at `0xd73b798a93497a0e45e2482ad07f7127f00521cf` on Arc mainnet (chain 5042). Its runtime code matches this build, and `usdc()` and `passport()` return the addresses below.

From `contracts/`:

```
USDC_ADDRESS=0x3600000000000000000000000000000000000000 \
PASSPORT_ADDRESS=0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c \
forge script script/DeployBounties.s.sol --rpc-url https://rpc.mainnet.arc.io --broadcast --interactives 1
```
