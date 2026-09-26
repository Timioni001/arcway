'use client';

import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { useReadContract, useTransactionCount } from "wagmi";
import { passportAbi } from "../abi";
import { apiFetch, type ProgressResponse } from "../api";
import { PASSPORT_ADDRESS, arcChain } from "../config";
import { earnedXp, questViews } from "../quests";
import { progressKey } from "./useArcway";

/** Read-only passport for any address (used by the public, shareable page). */
export function usePassportOf(address: Address) {
  const progress = useQuery({
    queryKey: progressKey(address),
    queryFn: () => apiFetch<ProgressResponse>(`/api/progress?address=${address}`),
    staleTime: 30_000
  });
  const profile = useReadContract({
    address: PASSPORT_ADDRESS,
    abi: passportAbi,
    functionName: "profiles",
    args: [address],
    chainId: arcChain.id,
    query: { enabled: Boolean(PASSPORT_ADDRESS) }
  });
  const txCount = useTransactionCount({ address, chainId: arcChain.id });
  const quests = questViews({
    completed: new Set(progress.data?.completed ?? []),
    eligible: Object.fromEntries(Object.entries(progress.data?.eligibility ?? {}).map(([id, e]) => [id, e.eligible]))
  });
  const xp = profile.data ? Number(profile.data[0]) : earnedXp(quests);
  return { progress, quests, xp, txCount, loading: progress.isPending };
}
