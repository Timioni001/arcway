import { NextResponse } from "next/server";
import type { Address } from "viem";
import { passportAbi } from "../../../../lib/abi";
import type { ClaimResponse } from "../../../../lib/api";
import { PASSPORT_ADDRESS } from "../../../../lib/config";
import { getQuest, questHash } from "../../../../lib/quests";
import { publicClient, verifierClient } from "../../../../lib/server/arc";
import { apiError, clientIp, parseAddress } from "../../../../lib/server/http";
import { createRateLimiter } from "../../../../lib/server/rateLimit";
import { checkQuest, snapshot } from "../../../../lib/server/verify";

const perAddress = createRateLimiter({ limit: 5, windowMs: 60_000 });
const perIp = createRateLimiter({ limit: 20, windowMs: 60_000 });

/** Claims submitted but maybe not mined yet: a retry or refresh gets the same tx back. */
const pending = new Map<string, { txHash: string; expiresAt: number }>();
const PENDING_TTL_MS = 2 * 60_000;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { address?: unknown; questId?: unknown };
  const user = parseAddress(body.address);
  const quest = typeof body.questId === "string" ? getQuest(body.questId) : undefined;
  if (!user || !quest) return apiError(400, "invalid_request", "Unknown wallet or quest.");

  const wallet = verifierClient();
  if (!PASSPORT_ADDRESS || !wallet) {
    return apiError(503, "recording_unavailable", "Claiming opens soon. Your progress is saved.");
  }

  for (const rate of [perIp(clientIp(req)), perAddress(user)]) {
    if (!rate.ok) return apiError(429, "rate_limited", `Too many attempts. Try again in ${rate.retryAfterSeconds}s.`, rate);
  }

  const key = `${user}:${quest.id}`;
  const inFlight = pending.get(key);
  if (inFlight && inFlight.expiresAt > Date.now()) {
    return NextResponse.json({ status: "submitted", txHash: inFlight.txHash } satisfies ClaimResponse);
  }

  let snap;
  try {
    snap = await snapshot(user);
  } catch {
    return apiError(502, "arc_unavailable", "We couldn't reach Arc. Try again in a moment.");
  }
  if (snap.completed.has(quest.id)) {
    return NextResponse.json({ status: "already_recorded" } satisfies ClaimResponse);
  }

  const result = await checkQuest(quest, snap).catch(() => undefined);
  if (!result) return apiError(502, "arc_unavailable", "We couldn't check this quest. Try again in a moment.");
  if (!result.eligible) return apiError(422, "not_eligible", result.reason ?? "This quest isn't complete yet.");

  try {
    const { request } = await publicClient.simulateContract({
      account: wallet.account,
      address: PASSPORT_ADDRESS,
      abi: passportAbi,
      functionName: "completeQuest",
      args: [user as Address, questHash(quest.id), BigInt(quest.xp)]
    });
    const txHash = await wallet.writeContract(request);
    pending.set(key, { txHash, expiresAt: Date.now() + PENDING_TTL_MS });
    console.info("[verifier] quest recorded", { user, quest: quest.id, txHash });
    return NextResponse.json({ status: "submitted", txHash } satisfies ClaimResponse);
  } catch (error) {
    console.error("[verifier] submit failed", { user, quest: quest.id, error });
    return apiError(502, "submit_failed", "Claiming didn't go through. Nothing was lost; try again.");
  }
}
