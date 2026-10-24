Work on my existing project Arcway (live on Arc mainnet). Do two things inside it: (A) audit the live contracts, (B) build ArcwayBounties as a new part of the same project. Follow every rule exactly; ask me before deviating.

SETUP
- Clone https://github.com/Timioni001/arcway (public). It lands in ./arcway.
- Work ONLY inside arcway/contracts. It is a Foundry project: solc 0.8.30, src/, test/, script/, lib/forge-std. Run every forge command from arcway/contracts.
- Do NOT touch anything outside arcway/contracts (the Next.js app is already wired to the ArcwayBounties interface). Do NOT add dependencies (no OpenZeppelin, no npm or forge installs).
- First run `forge test` and show me the result: the existing ArcwayPassport and ArcwayCampaigns tests must pass before and after your changes.

PART A: AUDIT (report only)
ArcwayPassport.sol and ArcwayCampaigns.sol in contracts/src are deployed on mainnet, so do NOT modify them.
Audit both: access control and two-step ownership, verifier key compromise, signature replay (chain id, contract address, nonces, expiry), USDC transfer handling, refund/cancel paths, reentrancy, prize-split rounding, events, gas griefing.
Write contracts/AUDIT.md: findings by severity (critical/high/medium/low/info) with file, function, line, impact and recommended fix. For each medium-or-higher finding add a test in contracts/test/Audit.t.sol that demonstrates the behaviour (it must pass, documenting current behaviour).

PART B: BUILD ArcwayBounties ("quests that pay")
Anyone escrows USDC behind an Arcway quest. Every wallet whose ArcwayPassport has that quest recorded (completedQuest(user, questId) == true; questId = keccak256(bytes("<quest id>"))) claims exactly one reward, first come first served, until rewards run out or it expires. After expiry the sponsor reclaims the rest. The passport is the only judge.

Rules:
1. Implement contracts/src/interfaces/IArcwayBounties.sol EXACTLY (it already exists in the repo; also uses IArcwayPassportView from the same file). Do not change the interface.
2. New file contracts/src/ArcwayBounties.sol, pragma ^0.8.30, contract ArcwayBounties is IArcwayBounties. constructor(address usdc, address passport): both non-zero, immutable.
3. Match ArcwayCampaigns.sol's style: minimal ERC-20 interface, low-level transfer/transferFrom calls that accept empty or true return data, a simple nonReentrant lock. Use custom errors (no require strings) and NatSpec on every external function.
4. No owner, admin, pause, fees, proxies, upgradeability, selfdestruct, delegatecall, receive/fallback or ETH. External calls only to USDC and passport.completedQuest.
5. create: rewardPerClaim > 0 and fits uint128; 1 <= maxClaims <= 10000; block.timestamp < expiresAt <= block.timestamp + 180 days; bytes(title).length <= 80. Pull rewardPerClaim * maxClaims and require the contract balance grew by exactly that (reject fee-on-transfer). Ids start at 1. Emit BountyCreated.
6. fund: anyone; bounty exists, not closed, not expired; extraClaims >= 1; new maxClaims <= 10000; same exact pull; emit BountyFunded.
7. claim: nonReentrant, checks-effects-interactions. Revert if unknown, closed, expired (block.timestamp >= expiresAt), none left, already claimed, or passport says not completed. Mark claimed, increment claims, transfer rewardPerClaim, emit BountyClaimed.
8. close: sponsor only, block.timestamp >= expiresAt, once. Mark closed, refund rewardPerClaim * (maxClaims - claims) (skip if zero), emit BountyClosed.
9. canClaim: true exactly when claim would succeed; never reverts (unknown id -> false).
10. Invariant: contract USDC balance == sum over open bounties of rewardPerClaim * (maxClaims - claims); total paid never exceeds total escrowed.

Tests: contracts/test/ArcwayBounties.t.sol with a mock 6-decimal USDC and a mock passport (setCompleted). Cover every validation revert, exact escrow on create and fund, one claim per wallet, wallet without the quest, last reward, expiry, claim after close, close permissions and exact refund, canClaim == claim in every case, fuzzing of amounts, an invariant test (create/fund/claim/close/warp handler) proving rule 10, a re-entering token that cannot double pay, and a fee-on-transfer token rejected on create.
Then audit ArcwayBounties the same way as Part A, fix what you find, and add the findings to AUDIT.md.

Deploy script: contracts/script/DeployBounties.s.sol, constructor args from env USDC_ADDRESS and PASSPORT_ADDRESS, using vm.startBroadcast() (no private keys in code).
Testnet demo: deploy a mock USDC, a mock passport and ArcwayBounties to Arc testnet, run one create and one claim, give me addresses and explorer links. Build a small demo page in the sandbox app (outside the arcway folder) that lists bounties, claims, and sponsors against that testnet deployment. Do NOT deploy to mainnet; I will, with USDC 0x3600000000000000000000000000000000000000 and ArcwayPassport 0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c.

DELIVER
Push only the new and changed files under arcway/contracts (ArcwayBounties.sol, its tests, Audit.t.sol, AUDIT.md, DeployBounties.s.sol) to a new branch arc-studio/bounties on Timioni001/arcway. If you cannot push, show me each file in full.

FINAL REPORT (in order): 1. files created; 2. forge test summary, all passing (old and new); 3. audit findings and fixes; 4. testnet addresses and transactions; 5. exact mainnet deploy command; 6. anything you could not do and why.
