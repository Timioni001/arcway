import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  marker,
  label,
  title,
  titleId,
  lede,
  action
}: {
  marker?: string;
  label: string;
  title: ReactNode;
  titleId: string;
  lede?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {marker && <span className="section-head__marker mono">{marker}</span>}
        <div className="label">{label}</div>
        <h2 id={titleId} className="h1" style={{ marginTop: 12, maxWidth: 720 }}>{title}</h2>
        {lede && <p className="lede" style={{ marginTop: 12 }}>{lede}</p>}
      </div>
      {action}
    </div>
  );
}

/** Empty / error / info state with a way forward (§29, §30). */
export function StateBlock({
  icon: Icon,
  title,
  children,
  actions,
  tone = "info",
  center = false
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "info" | "error";
  center?: boolean;
}) {
  return (
    <div className={`state surface surface--lg${center ? " state--center" : ""}`} role={tone === "error" ? "alert" : undefined}>
      <span className="state__icon" style={tone === "error" ? { color: "var(--aw-danger)" } : undefined}>
        <Icon aria-hidden="true" />
      </span>
      <div className="title">{title}</div>
      {children && <div className="body-sm muted" style={{ maxWidth: 420 }}>{children}</div>}
      {actions && <div className="row" style={{ marginTop: 4 }}>{actions}</div>}
    </div>
  );
}
