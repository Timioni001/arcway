import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/** Section intro on the left, optional action on the right; aligned to the same grid everywhere. */
export function SectionHeader({ label, title, titleId, sub, action }: { label?: string; title: ReactNode; titleId: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <Reveal className="section-head">
      <div className="section-intro">
        {label && <div className="label" style={{ color: "var(--link)", marginBottom: 10 }}>{label}</div>}
        <h2 id={titleId} className="h2">{title}</h2>
        {sub && <p className="secondary">{sub}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/** Empty / error state with a way forward. */
export function StateBlock({
  icon: Icon,
  title,
  children,
  actions,
  tone = "info"
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "info" | "error";
}) {
  return (
    <div className="state card" data-tone={tone} role={tone === "error" ? "alert" : undefined}>
      <span className="state__icon"><Icon aria-hidden="true" /></span>
      <div className="h4">{title}</div>
      {children && <p className="small secondary" style={{ maxWidth: 420 }}>{children}</p>}
      {actions && <div className="row" style={{ marginTop: 6 }}>{actions}</div>}
    </div>
  );
}
