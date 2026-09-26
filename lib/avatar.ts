/** Deterministic two-stop gradient from an address, so every wallet gets its own mark without initials. */
export function addressHues(address: string): [number, number] {
  const hex = address.replace(/^0x/i, "").toLowerCase().padEnd(12, "0");
  const a = parseInt(hex.slice(0, 6), 16) || 0;
  const b = parseInt(hex.slice(6, 12), 16) || 0;
  return [190 + (a % 60), 200 + (b % 70)];
}
