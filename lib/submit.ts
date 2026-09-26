import { isAddress } from "viem";
import { CATEGORIES, type Category } from "./registry";

/** Where listing requests land: a GitHub issue in this repo, reviewed before the app is listed. */
export const SUBMIT_REPO = process.env.NEXT_PUBLIC_SUBMIT_REPO || "Timioni001/arcway";

export type Submission = {
  name: string;
  url: string;
  category: Category | "";
  tagline: string;
  contracts: string;
  repo: string;
  profile: string;
  notes: string;
};

export const EMPTY_SUBMISSION: Submission = { name: "", url: "", category: "", tagline: "", contracts: "", repo: "", profile: "", notes: "" };

const isUrl = (v: string) => /^https:\/\/[^\s]+\.[^\s]+$/i.test(v.trim());

export function parseContracts(value: string): string[] {
  return [...new Set(value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))];
}

/** Field-level problems, in plain words. Empty object means ready to submit. */
export function validateSubmission(s: Submission): Partial<Record<keyof Submission, string>> {
  const e: Partial<Record<keyof Submission, string>> = {};
  if (s.name.trim().length < 2) e.name = "Add your project's name.";
  if (!isUrl(s.url)) e.url = "Add a live https link people can open.";
  if (!CATEGORIES.includes(s.category as Category)) e.category = "Pick the closest category.";
  if (s.tagline.trim().length < 10 || s.tagline.trim().length > 120) e.tagline = "One line, 10–120 characters.";
  const contracts = parseContracts(s.contracts);
  if (!contracts.length) e.contracts = "Add at least one contract address on Arc mainnet.";
  else if (contracts.some((c) => !isAddress(c))) e.contracts = "One of these isn't a valid address.";
  if (!/^https:\/\/(github\.com|gitlab\.com|codeberg\.org)\/[^\s]+$/i.test(s.repo.trim())) e.repo = "Add a public repo link (GitHub, GitLab or Codeberg).";
  if (!/^https:\/\/(github\.com|x\.com|twitter\.com|warpcast\.com|farcaster\.xyz)\/[^\s]+$/i.test(s.profile.trim())) e.profile = "Add a GitHub, X or Farcaster profile link.";
  return e;
}

/** A pre-filled GitHub issue with everything a reviewer needs. */
export function submissionIssueUrl(s: Submission, checks: Record<string, string> = {}): string {
  const contracts = parseContracts(s.contracts);
  const body = [
    `**Project:** ${s.name.trim()}`,
    `**Live app:** ${s.url.trim()}`,
    `**Category:** ${s.category}`,
    `**One line:** ${s.tagline.trim()}`,
    "",
    "**Contracts on Arc mainnet:**",
    ...contracts.map((c) => `- \`${c}\`${checks[c.toLowerCase()] ? ` (${checks[c.toLowerCase()]})` : ""}`),
    "",
    `**Repo:** ${s.repo.trim()}`,
    `**Builder profile:** ${s.profile.trim()}`,
    ...(s.notes.trim() ? ["", `**Notes:** ${s.notes.trim()}`] : []),
    "",
    "_Submitted from Arcway. Listed as Community until reviewed._"
  ].join("\n");
  const q = new URLSearchParams({ title: `Listing: ${s.name.trim()}`, body, labels: "listing" });
  return `https://github.com/${SUBMIT_REPO}/issues/new?${q.toString()}`;
}
