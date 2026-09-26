import { getAddress, isAddress, parseUnits, type Address } from "viem";
import { USDC_DECIMALS } from "./config";

export const MAX_PAY = 1_000_000;
export const NOTE_MAX = 80;

export type AmountResult = { ok: true; value: bigint; text: string } | { ok: false; error: string };

/** Parse a human USDC amount ("12.5") into 6-decimal units, with a friendly error. */
export function parseAmount(input: string): AmountResult {
  const text = input.trim().replace(/,/g, "");
  if (!text) return { ok: false, error: "Enter an amount." };
  if (!/^\d*\.?\d*$/.test(text) || text === ".") return { ok: false, error: "Use numbers only, like 10 or 2.50." };
  const [, decimals = ""] = text.split(".");
  if (decimals.length > USDC_DECIMALS) return { ok: false, error: "USDC has at most 6 decimal places." };
  const value = parseUnits(text, USDC_DECIMALS);
  if (value <= 0n) return { ok: false, error: "Amount must be more than 0." };
  if (value > parseUnits(String(MAX_PAY), USDC_DECIMALS)) return { ok: false, error: `Keep it under ${MAX_PAY.toLocaleString("en-US")} USDC.` };
  return { ok: true, value, text: normalise(text) };
}

function normalise(text: string) {
  const [i, d = ""] = text.split(".");
  const int = i.replace(/^0+(?=\d)/, "") || "0";
  const dec = d.replace(/0+$/, "");
  return dec ? `${int}.${dec}` : int;
}

/** Keep notes short and printable; they end up in a URL and on screen. */
export function cleanNote(note: string): string {
  return note.replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, NOTE_MAX);
}

export function buildPayPath(to: Address, amount?: string, note?: string): string {
  const params = new URLSearchParams();
  if (amount) params.set("amount", amount);
  const n = note ? cleanNote(note) : "";
  if (n) params.set("note", n);
  const q = params.toString();
  return `/pay/${getAddress(to)}${q ? `?${q}` : ""}`;
}

export type PayRequest = { to: Address; amount?: AmountResult; note: string };

/** Read a pay link safely: bad params are dropped, never trusted. */
export function readPayRequest(to: string, params: { amount?: string | null; note?: string | null }): PayRequest | null {
  if (!isAddress(to)) return null;
  const amount = params.amount ? parseAmount(params.amount) : undefined;
  return { to: getAddress(to), amount: amount?.ok ? amount : undefined, note: cleanNote(params.note ?? "") };
}
