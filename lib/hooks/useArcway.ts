'use client';

import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";
import { useConnection, useReadContract, useTransactionCount } from "wagmi";
import { passportAbi } from "../abi";
import { apiFetch, type ProgressResponse } from "../api";
import { PASSPORT_ADDRESS, USDC_ADDRESS, arcChain } from "../config";
import { nextStep, journeyProgress } from "../journey";
import { earnedXp, questViews } from "../quests";

export const progressKey = (address?: string) => ["arcway", "progress", address] as const;

/** Everything the page needs to answer "what should I do next?" for the connected wallet. */
export function useArcway() {
  const connection = useConnection();
  const address = connection.address;
  const enabled = Boolean(address);

  const balance = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: arcChain.id,
    query: { enabled, refetchInterval: 15_000 }
  });

  const txCount = useTransactionCount({
    address,
    chainId: arcChain.id,
    query: { enabled, refetchInterval: 15_000 }
  });

  const profile = useReadContract({
    address: PASSPORT_ADDRESS,
    abi: passportAbi,
    functionName: "profiles",
    args: address ? [address] : undefined,
    chainId: arcChain.id,
    query: { enabled: enabled && Boolean(PASSPORT_ADDRESS) }
  });

  const progress = useQuery({
    queryKey: progressKey(address),
    queryFn: () => apiFetch<ProgressResponse>(`/api/progress?address=${address}`),
    enabled,
    staleTime: 10_000,
    refetchInterval: 30_000
  });

  const quests = questViews({
    completed: new Set(progress.data?.completed ?? []),
    eligible: Object.fromEntries(
      Object.entries(progress.data?.eligibility ?? {}).map(([id, e]) => [id, e.eligible])
    )
  });

  const onArc = connection.status === "connected" && connection.chainId === arcChain.id;
  const recordingEnabled = progress.data?.recordingEnabled ?? false;
  const step = nextStep({
    connection: connection.status,
    onArc,
    usdcBalance: balance.data,
    txCount: txCount.data,
    readError: (balance.isError && balance.data === undefined) || (txCount.isError && txCount.data === undefined),
    quests,
    recordingEnabled
  });

  const onchainXp = profile.data ? Number(profile.data[0]) : undefined;

  return {
    connection,
    address,
    onArc,
    balance,
    txCount,
    progress,
    quests,
    step,
    journey: journeyProgress(quests),
    recordingEnabled,
    xp: onchainXp ?? earnedXp(quests),
    xpSource: onchainXp === undefined ? ("derived" as const) : ("onchain" as const),
    refetchAll: () => {
      balance.refetch();
      txCount.refetch();
      profile.refetch();
      progress.refetch();
    },
    reasons: Object.fromEntries(
      Object.entries(progress.data?.eligibility ?? {}).map(([id, e]) => [id, e.reason])
    ) as Record<string, string | undefined>
  };
}

export type Arcway = ReturnType<typeof useArcway>;
