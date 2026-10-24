Build ArcwayBounties: quests that pay, on Arc. Follow every rule below exactly. If a rule conflicts with anything else, the rule wins. Ask me before deviating.

CONTEXT
Arcway (arcway.world) is live on Arc mainnet. Its ArcwayPassport contract records quest completions and exposes:
  function completedQuest(address user, bytes32 questId) external view returns (bool);
questId = keccak256(bytes(<quest id string>)), e.g. keccak256("five-tx").
Mainnet addresses: USDC 0x3600000000000000000000000000000000000000 (6-decimal ERC-20 view of native USDC), ArcwayPassport 0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c.

WHAT IT DOES
Anyone escrows USDC behind an Arcway quest. Every wallet whose passport has that quest recorded can claim exactly one reward, first come first served, until rewards run out or the bounty expires. After expiry the sponsor reclaims the unclaimed remainder. The passport is the only judge.

HARD RULES
1. Implement this interface EXACTLY: same names, argument order, types, struct field order, events and event field order. Do not add, rename or remove public functions or events.

interface IArcwayPassportView {
  function completedQuest(address user, bytes32 questId) external view returns (bool);
}
interface IArcwayBounties {
  struct Bounty { address sponsor; bytes32 questId; uint128 rewardPerClaim; uint32 maxClaims; uint32 claims; uint64 expiresAt; bool closed; string title; }
  event BountyCreated(uint256 indexed id, address indexed sponsor, bytes32 indexed questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string title);
  event BountyFunded(uint256 indexed id, uint256 addedClaims);
  event BountyClaimed(uint256 indexed id, address indexed claimer, uint256 amount);
  event BountyClosed(uint256 indexed id, uint256 refunded);
  function usdc() external view returns (address);
  function passport() external view returns (address);
  function create(bytes32 questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string calldata title) external returns (uint256 id);
  function fund(uint256 id, uint256 extraClaims) external;
  function claim(uint256 id) external;
  function close(uint256 id) external;
  function bounty(uint256 id) external view returns (Bounty memory);
  function bountyCount() external view returns (uint256);
  function hasClaimed(uint256 id, address user) external view returns (bool);
  function canClaim(uint256 id, address user) external view returns (bool);
}

2. Contract name ArcwayBounties, file contracts/ArcwayBounties.sol, Solidity ^0.8.24, OpenZeppelin SafeERC20 and ReentrancyGuard only. constructor(address usdc, address passport): both non-zero, stored immutable.
3. No owner, no admin, no pausing, no fees, no upgradeability or proxies, no selfdestruct, no delegatecall, no receive/fallback, no ETH handling, no external calls other than USDC and the passport's completedQuest.
4. create: rewardPerClaim > 0; 1 <= maxClaims <= 10000; block.timestamp < expiresAt <= block.timestamp + 180 days; bytes(title).length <= 80. Escrow = rewardPerClaim * maxClaims, pulled with safeTransferFrom; verify the balance increased by exactly the escrow (reject fee-on-transfer). Ids start at 1. Emit BountyCreated.
5. fund: anyone may add claims to a bounty that exists, is not closed and not expired; extraClaims >= 1; new maxClaims <= 10000; pull rewardPerClaim * extraClaims with the same exact-balance check; emit BountyFunded.
6. claim: checks-effects-interactions plus nonReentrant. Revert (custom errors) if: unknown id, closed, expired (block.timestamp >= expiresAt), no rewards left, already claimed, passport.completedQuest(msg.sender, questId) is false. Then set claimed, increment claims, transfer rewardPerClaim to msg.sender, emit BountyClaimed.
7. close: only the sponsor; only when block.timestamp >= expiresAt; only once. Set closed, refund rewardPerClaim * (maxClaims - claims) to the sponsor (skip the transfer if zero), emit BountyClosed.
8. canClaim returns true exactly when claim would succeed for that user, never reverts (unknown id -> false).
9. Invariant: USDC balance of the contract == sum over not-closed bounties of rewardPerClaim * (maxClaims - claims). Never pay more than was escrowed for a bounty.
10. Custom errors only (no require strings). NatSpec on every external function. No floating TODOs, no commented-out code, no console logs.

TESTS (Foundry, test/ArcwayBounties.t.sol) — all must pass; show me the forge test output.
Use a mock 6-decimal USDC and a mock passport with setCompleted(user, questId, bool).
- create: pulls exact escrow; every validation revert; ids increment from 1; event fields.
- fund: third party tops up; maxClaims and escrow grow; reverts when closed/expired/over cap.
- claim: pays once per wallet; second claim reverts; wallet without the quest reverts; last reward then "no rewards left"; expired reverts; claim after close reverts.
- close: non-sponsor reverts; before expiry reverts; refunds exactly the unclaimed remainder; second close reverts.
- canClaim matches claim in every case above.
- Fuzz: reward and maxClaims ranges; invariant test (handler with create/fund/claim/close/warp) proving rule 9 and that total paid <= total escrowed.
- Reentrancy: a malicious token that re-enters claim cannot double pay; a fee-on-transfer token is rejected on create.

AUDIT
After tests pass, audit the contract yourself: reentrancy, accounting and rounding, overflow on casts to uint128/uint32, griefing (huge titles, many bounties, dust), timestamp edges, passport trust assumptions, front-running. List findings by severity with the fix applied, then re-run all tests.

DEPLOY AND APP
- Deploy a MockPassport and ArcwayBounties to Arc testnet (with a mock or testnet USDC) and give me the addresses and explorer links.
- App (src/): one clean page, Arc-blue on light: wallet connect on Arc; "Sponsored quests" list (title, quest id, reward each, rewards left, time left, sponsor) with a Claim button that explains why when canClaim is false; a sponsor form (quest id string hashed with keccak256, reward each, number of people, days 1-180, title) that approves exactly the escrow then calls create; every transaction shows a status and an explorer link; a testnet-only toggle to mark my wallet as completed on the MockPassport so the claim can be demoed.
- Do not deploy to mainnet. I deploy mainnet myself with constructor(0x3600000000000000000000000000000000000000, 0xF51812CF4e7f554eFA8ea61A958e8B68B63eD94c).

FINAL REPORT (in this order)
1. Files created. 2. forge test summary (counts, all passing). 3. Audit findings and fixes. 4. Testnet addresses and links. 5. The exact mainnet deploy command. 6. Anything you could not do and why.
