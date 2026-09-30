import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PageArt, lookFor } from "./PageArt";

/** Page header with the section's own hue and drawing, so every part of Arcway is recognisable at a glance. */
export function PageHead({ icon, kicker, title, lead, children }: { icon?: LucideIcon; kicker: string; title: string; lead: ReactNode; children?: ReactNode }) {
  const { art, hue } = lookFor(kicker);
  const Icon = icon;
  return (
    <header className="phead phead--brand" style={{ "--ph": hue } as React.CSSProperties}>
      <div className="phead__text">
        <div className="phead__kicker">{Icon && <span className="phead__mark" aria-hidden="true"><Icon /></span>}{kicker}</div>
        <h1 className="phead__title">{title}</h1>
        <p className="phead__lead">{lead}</p>
        {children && <div className="phead__actions">{children}</div>}
      </div>
      <PageArt art={art} icon={icon} />
    </header>
  );
}
