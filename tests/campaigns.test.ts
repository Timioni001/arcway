import { describe, expect, it } from "vitest";
import { type Address, keccak256, toBytes } from "viem";
import { allocate, buildResults, drawWinners, leafOf, verifyProof } from "../lib/campaignDraw";
import { canonical, metadataHash, phaseOf, rewardSentence, type CampaignState } from "../lib/campaigns";

const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}` as Address;
const entrants = Array.from({ length: 25 }, (_, i) => addr(i + 1));
const seed = keccak256(toBytes("block 123"));

describe("campaign draw", () => {
  it("is deterministic, ignores entry order and duplicates", () => {
    const a = drawWinners(entrants, seed, 5);
    const b = drawWinners([...entrants].reverse().concat(entrants.slice(0, 3)), seed, 5);
    expect(a).toHaveLength(5);
    expect(b).toEqual(a);
    expect(drawWinners(entrants, keccak256(toBytes("another block")), 5)).not.toEqual(a);
  });
  it("gives each raffle winner an equal share and never more than the pool", () => {
    const alloc = allocate("raffle", 100_000_000n, 3, entrants, seed);
    expect(alloc).toHaveLength(3);
    expect(new Set(alloc.map((a) => a.amount))).toEqual(new Set([33_333_333n]));
    expect(alloc.reduce((s, a) => s + a.amount, 0n)).toBeLessThanOrEqual(100_000_000n);
  });
  it("splits the pool between every entrant, and pays nothing for first-come or no entries", () => {
    expect(allocate("split", 10_000_000n, 100, entrants.slice(0, 4), seed).map((a) => a.amount)).toEqual([2_500_000n, 2_500_000n, 2_500_000n, 2_500_000n]);
    expect(allocate("first-come", 10n, 1, entrants, seed)).toEqual([]);
    expect(allocate("raffle", 10n, 1, [], seed)).toEqual([]);
  });
});

describe("results tree", () => {
  it("gives every winner a proof that the contract's check accepts", () => {
    const alloc = allocate("raffle", 70_000_000n, 7, entrants, seed);
    const tree = buildResults(9n, alloc);
    expect(tree.total).toBe(70_000_000n);
    for (const a of alloc) {
      const p = tree.proofOf(a.address)!;
      expect(verifyProof(tree.root, leafOf(9n, a.address, p.amount), p.proof)).toBe(true);
      // Wrong amount or wrong campaign fails.
      expect(verifyProof(tree.root, leafOf(9n, a.address, p.amount + 1n), p.proof)).toBe(false);
      expect(verifyProof(tree.root, leafOf(8n, a.address, p.amount), p.proof)).toBe(false);
    }
    const loser = entrants.find((e) => !alloc.some((a) => a.address.toLowerCase() === e.toLowerCase()))!;
    expect(tree.proofOf(loser)).toBeNull();
  });
  it("handles a single winner", () => {
    const tree = buildResults(1n, [{ address: addr(1), amount: 5n }]);
    expect(tree.proofOf(addr(1))).toEqual({ amount: 5n, proof: [] });
    expect(tree.root).toBe(leafOf(1n, addr(1), 5n));
  });
});

describe("campaign description and status", () => {
  it("hashes the description the same regardless of key order", () => {
    expect(canonical({ b: 1, a: [2, { d: 1, c: 2 }] })).toBe('{"a":[2,{"c":2,"d":1}],"b":1}');
    const meta = { slug: "s", project: "P", title: "T", summary: "S", tasks: [] };
    expect(metadataHash(meta)).toBe(metadataHash({ tasks: [], summary: "S", title: "T", project: "P", slug: "s" }));
  });
  it("names the phase from on-chain state and time", () => {
    const base: CampaignState = {
      creator: addr(1), mode: "raffle", start: 100, end: 200, claimUntil: 300, maxWinners: 2, entries: 1, refunded: false,
      pool: 10n, paid: 0n, allocated: 0n, resultsRoot: `0x${"0".repeat(64)}`, metadataHash: `0x${"0".repeat(64)}`
    };
    expect(phaseOf(base, 50)).toBe("upcoming");
    expect(phaseOf(base, 150)).toBe("live");
    expect(phaseOf(base, 250)).toBe("drawing");
    expect(phaseOf({ ...base, resultsRoot: `0x${"1".repeat(64)}` }, 250)).toBe("claiming");
    expect(phaseOf(base, 300)).toBe("closed");
    expect(phaseOf({ ...base, mode: "first-come", entries: 2 }, 150)).toBe("closed");
  });
  it("describes the reward in plain words", () => {
    expect(rewardSentence("first-come", 1_000_000_000n, 100)).toBe("10 USDC each for the first 100 people");
    expect(rewardSentence("raffle", 500_000_000n, 10)).toBe("10 winners drawn, 50 USDC each");
    expect(rewardSentence("split", 500_000_000n, 250)).toBe("Shared equally by up to 250 people");
  });
});
