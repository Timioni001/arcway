import { type Address, isAddress, parseUnits } from "viem";
import { CAMPAIGN_LIMITS, type CampaignMeta, type CampaignMode, type CampaignTask, metadataHash } from "./campaigns";
import { SUBMIT_REPO } from "./submit";

export type LaunchForm = {
  project: string;
  app: string;
  title: string;
  summary: string;
  mode: CampaignMode;
  pool: string;
  winners: string;
  /** datetime-local value, in the person's own time zone. */
  start: string;
  durationDays: string;
  claimDays: string;
  tasks: CampaignTask[];
};

export type LaunchPlan = {
  meta: Omit<CampaignMeta, "id">;
  hash: `0x${string}`;
  pool: bigint;
  winners: number;
  start: number;
  end: number;
  claimWindow: number;
};

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/** Every rule the contract enforces, checked before anyone signs anything. */
export function planLaunch(f: LaunchForm, nowSec: number): { plan: LaunchPlan | null; errors: Partial<Record<keyof LaunchForm, string>> } {
  const errors: Partial<Record<keyof LaunchForm, string>> = {};
  if (f.project.trim().length < 2) errors.project = "Name the project running the campaign.";
  if (f.title.trim().length < 4 || f.title.trim().length > 80) errors.title = "A title between 4 and 80 characters.";
  if (f.summary.trim().length < 10 || f.summary.trim().length > 280) errors.summary = "One or two sentences, up to 280 characters.";

  let pool = 0n;
  try { pool = parseUnits(f.pool.trim() || "0", 6); } catch { /* handled below */ }
  const winners = Number(f.winners);
  if (!Number.isInteger(winners) || winners < 1 || winners > CAMPAIGN_LIMITS.maxWinners) errors.winners = `Between 1 and ${CAMPAIGN_LIMITS.maxWinners.toLocaleString("en-US")}.`;
  if (pool <= 0n) errors.pool = "Set the prize pool in USDC.";
  else if (!errors.winners && pool < BigInt(winners)) errors.pool = "The pool is too small to share between that many winners.";
  else if (!errors.winners && f.mode === "first-come" && pool % BigInt(winners) !== 0n) errors.pool = "For first come, the pool must divide evenly by the number of winners.";

  const start = Math.floor(new Date(f.start).getTime() / 1000);
  const days = Number(f.durationDays);
  const claimDays = Number(f.claimDays);
  if (!Number.isFinite(start) || start < nowSec + 5 * 60) errors.start = "Start at least a few minutes from now.";
  else if (start > nowSec + 90 * 86400) errors.start = "Start within the next 90 days.";
  if (!(days * 24 >= CAMPAIGN_LIMITS.minDurationHours && days <= CAMPAIGN_LIMITS.maxDurationDays)) errors.durationDays = `Between 1 hour and ${CAMPAIGN_LIMITS.maxDurationDays} days.`;
  if (!(Number.isInteger(claimDays) && claimDays >= CAMPAIGN_LIMITS.minClaimDays && claimDays <= CAMPAIGN_LIMITS.maxClaimDays)) errors.claimDays = `Between ${CAMPAIGN_LIMITS.minClaimDays} and ${CAMPAIGN_LIMITS.maxClaimDays} days.`;

  const tasks = f.tasks.map((t) => ({ ...t, label: t.label.trim() }));
  if (!tasks.length) errors.tasks = "Add at least one task people must complete.";
  for (const t of tasks) {
    if (!t.label) errors.tasks = "Give every task a short description.";
    if (t.kind === "use-app" && (!t.contracts.length || !t.contracts.every((c) => isAddress(c)))) errors.tasks = "Add the app's contract address (0x…) for the 'Use the app' task.";
    if (t.kind === "hold-usdc" && !(t.minUsdc > 0)) errors.tasks = "Set how much USDC people should hold.";
  }

  if (Object.keys(errors).length) return { plan: null, errors };
  const meta = {
    slug: slugify(`${f.project} ${f.title}`),
    app: f.app || undefined,
    project: f.project.trim(),
    title: f.title.trim(),
    summary: f.summary.trim(),
    tasks: tasks.map((t) => (t.kind === "use-app" ? { ...t, contracts: t.contracts.map((c) => c.toLowerCase() as Address) } : t))
  };
  return {
    plan: { meta, hash: metadataHash(meta), pool, winners, start, end: start + Math.round(days * 86400), claimWindow: claimDays * 86400 },
    errors
  };
}

/** A pre-filled GitHub issue asking for the launched campaign to be listed; the hash ties it to the chain. */
export function listingIssueUrl(plan: LaunchPlan, id: string, txHash: string): string {
  const entry = { id: Number(id), ...plan.meta };
  const body = [
    `**Campaign id:** ${id}`,
    `**Launch transaction:** ${txHash}`,
    `**Description hash:** \`${plan.hash}\``,
    "",
    "Paste into `lib/campaigns.ts` → `CAMPAIGNS` after review:",
    "```json",
    JSON.stringify(entry, null, 2),
    "```"
  ].join("\n");
  const q = new URLSearchParams({ title: `Campaign: ${plan.meta.project} — ${plan.meta.title}`, body, labels: "campaign" });
  return `https://github.com/${SUBMIT_REPO}/issues/new?${q.toString()}`;
}
