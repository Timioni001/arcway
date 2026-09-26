'use client';

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../api";
import type { Intel, PassportStats, ProtocolIntel, PulseEvent, Radar, Signal, Snapshot } from "../intel";

type Paths = {
  snapshot: Snapshot;
  pulse: PulseEvent[];
  radar: Radar;
  signals: Signal[];
  passport: PassportStats;
};

const REFRESH: Record<keyof Paths, number> = { snapshot: 60_000, pulse: 15_000, radar: 120_000, signals: 60_000, passport: 60_000 };

/** Live intelligence from /api/intel/*, shared across the page and refreshed on a sensible cadence. */
export function useIntel<K extends keyof Paths>(kind: K) {
  return useQuery({
    queryKey: ["arcway", "intel", kind],
    queryFn: () => apiFetch<Intel<Paths[K]>>(`/api/intel/${kind}`),
    refetchInterval: REFRESH[kind],
    staleTime: REFRESH[kind] / 2,
    retry: 1
  });
}

export function useProtocolIntel(slug: string, enabled = true) {
  return useQuery({
    queryKey: ["arcway", "intel", "protocol", slug],
    queryFn: () => apiFetch<Intel<ProtocolIntel>>(`/api/intel/protocol/${slug}`),
    refetchInterval: 60_000,
    enabled,
    retry: 1
  });
}
