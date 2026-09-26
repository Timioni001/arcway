import type { LucideIcon } from "lucide-react";

export type OrbHue = "blue" | "teal" | "green" | "violet" | "amber" | "pink" | "sky";

/**
 * A bright, dimensional icon badge: gradient disc, glossy highlight, soft ring and coloured shadow.
 * `glass` is the variant for blue sections: frosted disc with a tinted icon.
 */
export function IconOrb({ icon: Icon, hue = "blue", size = "md", glass = false }: { icon: LucideIcon; hue?: OrbHue; size?: "sm" | "md" | "lg"; glass?: boolean }) {
  return (
    <span className={`orb orb--${size}${glass ? " orb--glass" : ""}`} data-hue={hue} aria-hidden="true">
      <Icon />
    </span>
  );
}
