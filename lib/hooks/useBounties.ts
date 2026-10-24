'use client';

import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { BOUNTIES_CONTRACT, arcChain } from "../config";
import { bountiesAbi } from "../bountiesAbi";
import { viewBounty, type BountyView, type RawBounty } from "../bounties";

const MAX = 200;

/** Every bounty on ArcwayBounties (newest first), and for a connected wallet which ones it can claim now. */
export function useBounties(user?: `0x${string}`) {
  const enabled = Boolean(BOUNTIES_CONTRACT);
  const count = useReadContract({ address: BOUNTIES_CONTRACT, abi: bountiesAbi, functionName: "bountyCount", chainId: arcChain.id, query: { enabled, refetchInterval: 30_000 } });
  const n = Math.min(Number(count.data ?? 0n), MAX);
  const ids = Array.from({ length: n }, (_, i) => n - i);
  const reads = useReadContracts({
    contracts: ids.flatMap((id) => [
      { address: BOUNTIES_CONTRACT!, abi: bountiesAbi, functionName: "bounty" as const, args: [BigInt(id)] as const, chainId: arcChain.id },
      ...(user ? [{ address: BOUNTIES_CONTRACT!, abi: bountiesAbi, functionName: "canClaim" as const, args: [BigInt(id), user] as const, chainId: arcChain.id }] : [])
    ]),
    query: { enabled: enabled && n > 0, refetchInterval: 30_000 }
  });
  const nowSec = Math.floor(Date.now() / 1000);
  const step = user ? 2 : 1;
  const bounties: BountyView[] = useMemo(() => ids.flatMap((id, i) => {
    const raw = reads.data?.[i * step]?.result as RawBounty | undefined;
    return raw ? [viewBounty(id, raw, nowSec)] : [];
  }), [reads.data, n, user]); // eslint-disable-line react-hooks/exhaustive-deps
  const claimable = useMemo(() => new Set(user ? ids.filter((_, i) => reads.data?.[i * 2 + 1]?.result === true) : []), [reads.data, n, user]); // eslint-disable-line react-hooks/exhaustive-deps
  return { enabled, loading: count.isLoading || reads.isLoading, error: count.isError || reads.isError, bounties, claimable, refetch: () => { count.refetch(); reads.refetch(); } };
}
