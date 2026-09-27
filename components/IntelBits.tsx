import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SOURCE_HELP, SOURCE_LABEL, type Source } from "../lib/intel";

/** Shared by server and client components: no hooks, no browser APIs. */

/** Where a number came from and the period it covers. Text, never colour alone. */
export function SourceTag({ source, period }: { source: Source; period?: string }) {
  return (
    <span className="src" data-source={source} title={SOURCE_HELP[source]}>
      <span className="src__kind">{SOURCE_LABEL[source]}</span>
      {period && <span className="src__period">{period}</span>}
    </span>
  );
}

/** One-line section heading used across intelligence pages: title, meta on the right. */
export function PanelHead({ title, id, children }: { icon?: LucideIcon; title: string; id: string; children?: ReactNode }) {
  return (
    <div className="panel__head">
      <h2 id={id} className="panel__title">{title}</h2>
      {children && <div className="panel__meta">{children}</div>}
    </div>
  );
}
