import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Editorial page header used across the workspace: kicker, title, one line of context. */
export function PageHead({ kicker, title, lead, children }: { icon?: LucideIcon; kicker: string; title: string; lead: ReactNode; children?: ReactNode }) {
  return (
    <header className="phead">
      <div className="phead__kicker">{kicker}</div>
      <h1 className="phead__title">{title}</h1>
      <p className="phead__lead">{lead}</p>
      {children && <div className="phead__actions">{children}</div>}
    </header>
  );
}
