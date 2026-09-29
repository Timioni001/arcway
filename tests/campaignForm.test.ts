import { describe, expect, it } from "vitest";
import { type LaunchForm, listingIssueUrl, planLaunch, slugify } from "../lib/campaignForm";
import { metadataHash } from "../lib/campaigns";

const now = Math.floor(Date.parse("2026-10-01T12:00:00Z") / 1000);
const local = (sec: number) => {
  const d = new Date(sec * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const base: LaunchForm = {
  project: "Tipjar", app: "", title: "First tip week", summary: "Send one tip on Arc and share the pool.", mode: "first-come",
  pool: "500", winners: "100", start: local(now + 2 * 86400), durationDays: "14", claimDays: "14",
  tasks: [{ kind: "use-app", label: "Send a tip", contracts: ["0x00000000000000000000000000000000000000AB"] }]
};

describe("campaign launch plan", () => {
  it("turns a valid form into exactly what the contract expects", () => {
    const { plan, errors } = planLaunch(base, now);
    expect(errors).toEqual({});
    expect(plan!.pool).toBe(500_000_000n);
    expect(plan!.winners).toBe(100);
    expect(plan!.end - plan!.start).toBe(14 * 86400);
    expect(plan!.claimWindow).toBe(14 * 86400);
    expect(plan!.meta.slug).toBe("tipjar-first-tip-week");
    expect(plan!.meta.tasks[0]).toMatchObject({ contracts: ["0x00000000000000000000000000000000000000ab"] });
    expect(plan!.hash).toBe(metadataHash(plan!.meta));
  });
  it("applies the contract's rules before anyone signs", () => {
    expect(planLaunch({ ...base, pool: "100.000001", winners: "3" }, now).errors.pool).toMatch(/divide evenly/);
    expect(planLaunch({ ...base, mode: "raffle", pool: "0.000002", winners: "3" }, now).errors.pool).toMatch(/too small/);
    expect(planLaunch({ ...base, winners: "0" }, now).errors.winners).toBeTruthy();
    expect(planLaunch({ ...base, start: local(now - 60) }, now).errors.start).toBeTruthy();
    expect(planLaunch({ ...base, durationDays: "120" }, now).errors.durationDays).toBeTruthy();
    expect(planLaunch({ ...base, claimDays: "3" }, now).errors.claimDays).toBeTruthy();
    expect(planLaunch({ ...base, tasks: [] }, now).errors.tasks).toBeTruthy();
    expect(planLaunch({ ...base, tasks: [{ kind: "use-app", label: "x", contracts: ["nope" as `0x${string}`] }] }, now).errors.tasks).toMatch(/contract address/);
  });
  it("makes a listing request that carries the on-chain id and description hash", () => {
    const { plan } = planLaunch(base, now);
    const url = new URL(listingIssueUrl(plan!, "7", "0xabc"));
    const body = url.searchParams.get("body")!;
    expect(url.searchParams.get("title")).toBe("Campaign: Tipjar — First tip week");
    expect(body).toContain("**Campaign id:** 7");
    expect(body).toContain(plan!.hash);
    const json = JSON.parse(body.slice(body.indexOf("```json") + 7, body.lastIndexOf("```")));
    expect(json.id).toBe(7);
    const { id: _id, ...meta } = json;
    expect(metadataHash(meta)).toBe(plan!.hash);
  });
  it("slugs names safely", () => {
    expect(slugify("  Café Swap — Week #1! ")).toBe("cafe-swap-week-1");
  });
});
