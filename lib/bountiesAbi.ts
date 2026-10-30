import { parseAbi } from "viem";

/** ArcwayBounties, per contracts/src/interfaces/IArcwayBounties.sol. */
export const bountiesAbi = parseAbi([
  "constructor(address usdc_, address passport_)",
  "struct Bounty { address sponsor; bytes32 questId; uint128 rewardPerClaim; uint32 maxClaims; uint32 claims; uint64 expiresAt; bool closed; string title; }",
  "event BountyCreated(uint256 indexed id, address indexed sponsor, bytes32 indexed questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string title)",
  "event BountyClaimed(uint256 indexed id, address indexed claimer, uint256 amount)",
  "function usdc() view returns (address)",
  "function passport() view returns (address)",
  "function create(bytes32 questId, uint256 rewardPerClaim, uint256 maxClaims, uint64 expiresAt, string title) returns (uint256)",
  "function fund(uint256 id, uint256 extraClaims)",
  "function claim(uint256 id)",
  "function close(uint256 id)",
  "function bounty(uint256 id) view returns (Bounty)",
  "function bountyCount() view returns (uint256)",
  "function hasClaimed(uint256 id, address user) view returns (bool)",
  "function canClaim(uint256 id, address user) view returns (bool)",
  "error ZeroReward()", "error RewardOverflow()", "error BadMaxClaims()", "error BadExpiry()", "error TitleTooLong()",
  "error FeeOnTransferRejected()", "error UnknownBounty()", "error BountyClosedErr()", "error BountyExpiredErr()",
  "error NoneLeft()", "error AlreadyClaimed()", "error QuestNotCompleted()", "error NotExpiredYet()",
  "error AlreadyClosedErr()", "error NotSponsor()", "error ExtraClaimsZero()", "error MaxClaimsExceeded()", "error Reentrant()"
]);
