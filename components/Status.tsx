import type { ReactNode } from "react";

/** Announces progress politely and errors assertively to assistive tech. */
export function Status({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  if (!children) return null;
  return (
    <div role={tone === "error" ? "alert" : "status"} className="small muted" style={{ marginTop: 10 }}>
      {children}
    </div>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
