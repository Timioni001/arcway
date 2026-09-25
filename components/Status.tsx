import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/** Announces progress politely and errors assertively to assistive tech. */
export function Status({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  if (!children) return null;
  return (
    <div role={tone === "error" ? "alert" : "status"} className="body-sm" style={{ marginTop: 10, color: tone === "error" ? "var(--aw-danger)" : "var(--aw-muted)" }}>
      {children}
    </div>
  );
}

export function ExternalLink({ href, children, className = "link" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <ArrowUpRight aria-hidden="true" />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
