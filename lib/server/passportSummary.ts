import type { Address } from "viem";
import { passportAbi } from "../abi";
import { PASSPORT_ADDRESS } from "../config";
import { levelFor } from "../levels";
import { QUESTS } from "../quests";
import { publicClient } from "./arc";
import { readCompleted } from "./verify";

/** XP, level and badge count for share images. Never throws; falls back to zeros. */
export async function passportSummary(address: Address, timeoutMs = 2500) {
  const empty = { xp: 0, level: levelFor(0).name, badges: 0, total: QUESTS.length };
  if (!PASSPORT_ADDRESS) return empty;
  const work = (async () => {
    const [profile, completed] = await Promise.all([
      publicClient.readContract({ address: PASSPORT_ADDRESS!, abi: passportAbi, functionName: "profiles", args: [address] }),
      readCompleted(address)
    ]);
    const xp = Number(profile[0]);
    return { xp, level: levelFor(xp).name, badges: completed.size, total: QUESTS.length };
  })();
  const timeout = new Promise<typeof empty>((resolve) => setTimeout(() => resolve(empty), timeoutMs));
  return Promise.race([work.catch(() => empty), timeout]);
}
