import { formatUnits } from "viem";
import { USDC_DECIMALS } from "./config";

/** "12.34 USDC", rounded down so we never overstate a balance. */
export function formatUsdc(amount: bigint, { symbol = true } = {}): string {
  const suffix = symbol ? " USDC" : "";
  if (amount === 0n) return `0${suffix}`;
  const cents = amount / 10n ** BigInt(USDC_DECIMALS - 2);
  if (cents === 0n) return `<0.01${suffix}`;
  const value = Number(formatUnits(cents, 2));
  return `${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}${suffix}`;
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export function timeAgo(date: Date | string | number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"]
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
}
