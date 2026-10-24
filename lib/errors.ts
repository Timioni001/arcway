import { arcChain } from "./config";

type ErrorLike = {
  name?: string;
  code?: number | string;
  shortMessage?: string;
  message?: string;
  cause?: unknown;
  data?: { errorName?: string };
};

/** ArcwayBounties reverts, in words. */
const CONTRACT_ERRORS: Record<string, string> = {
  QuestNotCompleted: "Your passport doesn't have this quest recorded yet. Finish it, then claim.",
  AlreadyClaimed: "This wallet already claimed this bounty.",
  NoneLeft: "Every reward in this bounty has been claimed.",
  BountyExpiredErr: "This bounty has ended.",
  BountyClosedErr: "This bounty is closed.",
  UnknownBounty: "That bounty doesn't exist.",
  NotSponsor: "Only the sponsor can close this bounty.",
  NotExpiredYet: "You can close this bounty and take back what's left once it ends.",
  AlreadyClosedErr: "This bounty is already closed.",
  BadExpiry: "The end date must be within the next 180 days.",
  BadMaxClaims: "Pick between 1 and 10,000 people.",
  MaxClaimsExceeded: "A bounty can pay at most 10,000 people.",
  ZeroReward: "The reward must be more than zero.",
  RewardOverflow: "That reward is too large.",
  TitleTooLong: "Keep the title to 80 characters.",
  ExtraClaimsZero: "Add at least one more reward.",
  FeeOnTransferRejected: "This token can't be escrowed.",
  Reentrant: "Something went wrong. Please try again."
};

/** Walks `cause` chains (viem/wagmi wrap errors several levels deep). */
function chain(error: unknown): ErrorLike[] {
  const out: ErrorLike[] = [];
  let current: unknown = error;
  while (current && typeof current === "object" && out.length < 10) {
    out.push(current as ErrorLike);
    current = (current as ErrorLike).cause;
  }
  return out;
}

/** Turns wallet/RPC/API errors into one sentence a first-time user can act on. */
export function humanizeError(error: unknown): string {
  const errors = chain(error);
  const has = (predicate: (e: ErrorLike) => boolean) => errors.some(predicate);
  const text = errors.map((e) => `${e.name ?? ""} ${e.shortMessage ?? ""} ${e.message ?? ""}`).join(" ").toLowerCase();

  if (has((e) => e.code === 4001 || e.name === "UserRejectedRequestError") || text.includes("user rejected") || text.includes("user denied")) {
    return "You cancelled the request in your wallet. Nothing was changed.";
  }
  if (has((e) => e.code === -32002) || text.includes("already pending")) {
    return "Your wallet already has a request open. Check your wallet window.";
  }
  if (has((e) => e.name === "ConnectorNotFoundError" || e.name === "ProviderNotFoundError")) {
    return "No browser wallet found. Create a free wallet on Arcway, or install a wallet app and reload.";
  }
  if (has((e) => e.code === 4902) || text.includes("unrecognized chain")) {
    return `Your wallet doesn't know ${arcChain.name} yet. Approve adding it when your wallet asks.`;
  }
  if (has((e) => e.name === "SwitchChainNotSupportedError")) {
    return `This wallet can't switch networks from a website. Switch to ${arcChain.name} (chain ${arcChain.id}) in your wallet.`;
  }
  if (has((e) => e.name === "InsufficientFundsError") || text.includes("insufficient funds")) {
    return `Not enough USDC to pay the network fee on ${arcChain.name}.`;
  }
  if (has((e) => e.name === "HttpRequestError" || e.name === "TimeoutError") || text.includes("failed to fetch")) {
    return "We couldn't reach Arc. Check your connection and try again.";
  }
  const reverted = errors.find((e) => e.data?.errorName && CONTRACT_ERRORS[e.data.errorName]);
  if (reverted) return CONTRACT_ERRORS[reverted.data!.errorName!];
  const first = errors.find((e) => e.shortMessage || e.message);
  return first?.shortMessage ?? first?.message ?? "Something went wrong. Please try again.";
}
