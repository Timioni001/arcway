import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({ title, titleId, action }: { title: ReactNode; titleId: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <h2 id={titleId} className="h2">{title}</h2>
      {action}
    </div>
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
