import { type Address, type Hex, concat, encodeAbiParameters, encodePacked, getAddress, keccak256 } from "viem";
import type { CampaignMode } from "./campaigns";

/**
 * Results for prize draws and shared pools, computed only from public data so anyone can re-run them:
 * the entries emitted on chain (in order), and the hash of the first Arc block at or after the end time,
 * which nobody could know while the campaign was open.
 */

export type Allocation = { address: Address; amount: bigint };

/** Each entrant's ticket: keccak256(seed, address). The lowest tickets win. */
export function ticket(seed: Hex, address: Address): Hex {
  return keccak256(encodePacked(["bytes32", "address"], [seed, getAddress(address)]));
}

export function drawWinners(entrants: Address[], seed: Hex, count: number): Address[] {
  const unique = [...new Map(entrants.map((a) => [a.toLowerCase(), getAddress(a)])).values()];
  return unique
    .map((address) => ({ address, t: BigInt(ticket(seed, address)) }))
    .sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0))
    .slice(0, Math.max(0, count))
    .map((x) => x.address);
}

/** Equal shares, rounded down to the smallest USDC unit; the remainder stays refundable to the project. */
export function allocate(mode: CampaignMode, pool: bigint, maxWinners: number, entrants: Address[], seed: Hex): Allocation[] {
  if (mode === "first-come" || entrants.length === 0) return [];
  const winners = mode === "raffle" ? drawWinners(entrants, seed, maxWinners) : drawWinners(entrants, seed, entrants.length).slice(0, maxWinners);
  if (!winners.length) return [];
  const each = pool / BigInt(winners.length);
  if (each === 0n) return [];
  return winners.map((address) => ({ address, amount: each })).sort((a, b) => a.address.localeCompare(b.address));
}

// ---------------------------------------------------------------- Merkle tree (matches ArcwayCampaigns._verify)

export function leafOf(campaignId: bigint, address: Address, amount: bigint): Hex {
  return keccak256(concat([keccak256(encodeAbiParameters([{ type: "uint256" }, { type: "address" }, { type: "uint256" }], [campaignId, getAddress(address), amount]))]));
}

const hashPair = (a: Hex, b: Hex): Hex => (BigInt(a) < BigInt(b) ? keccak256(concat([a, b])) : keccak256(concat([b, a])));

export type ResultsTree = { root: Hex; total: bigint; allocations: Allocation[]; proofOf(address: Address): { amount: bigint; proof: Hex[] } | null };

export function buildResults(campaignId: bigint, allocations: Allocation[]): ResultsTree {
  const leaves = allocations.map((a) => ({ a, leaf: leafOf(campaignId, a.address, a.amount) })).sort((x, y) => (BigInt(x.leaf) < BigInt(y.leaf) ? -1 : 1));
  const layers: Hex[][] = [leaves.map((l) => l.leaf)];
  while (layers[layers.length - 1].length > 1) {
    const prev = layers[layers.length - 1];
    const next: Hex[] = [];
    for (let i = 0; i < prev.length; i += 2) next.push(i + 1 < prev.length ? hashPair(prev[i], prev[i + 1]) : prev[i]);
    layers.push(next);
  }
  const root = layers[layers.length - 1][0] ?? (`0x${"0".repeat(64)}` as Hex);
  return {
    root,
    total: allocations.reduce((s, a) => s + a.amount, 0n),
    allocations,
    proofOf(address) {
      let index = leaves.findIndex((l) => l.a.address.toLowerCase() === address.toLowerCase());
      if (index < 0) return null;
      const amount = leaves[index].a.amount;
      const proof: Hex[] = [];
      for (let depth = 0; depth < layers.length - 1; depth++) {
        const layer = layers[depth];
        const sibling = index % 2 === 0 ? index + 1 : index - 1;
        if (sibling < layer.length) proof.push(layer[sibling]);
        index = Math.floor(index / 2);
      }
      return { amount, proof };
    }
  };
}

/** The same check the contract runs. */
export function verifyProof(root: Hex, leaf: Hex, proof: Hex[]): boolean {
  return proof.reduce((h, p) => hashPair(h, p), leaf) === root;
}
