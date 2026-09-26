import type { CSSProperties } from "react";
import { addressHues } from "../lib/avatar";

export function AddressAvatar({ address, size = "md" }: { address?: string; size?: "md" | "lg" }) {
  const [h1, h2] = addressHues(address ?? "0x0");
  const style = { "--h1": h1, "--h2": h2 } as CSSProperties;
  return <span className={`avatar avatar--addr${size === "lg" ? " avatar--lg" : ""}`} style={style} aria-hidden="true" />;
}
