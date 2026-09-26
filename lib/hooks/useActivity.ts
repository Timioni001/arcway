'use client';

import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ActivityItem } from "../api";
import { useArcwayState } from "./context";

/** Recent transactions for the connected wallet (shared cache across the page). */
export function useActivity() {
  const { address } = useArcwayState();
  return useQuery({
    queryKey: ["arcway", "activity", address],
    queryFn: () => apiFetch<{ items: ActivityItem[] }>(`/api/activity?address=${address}`),
    enabled: Boolean(address),
    refetchInterval: 30_000
  });
}
