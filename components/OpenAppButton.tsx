'use client';

import { ArrowUpRight } from "lucide-react";
import { markVisited } from "../lib/visited";

export function OpenAppButton({ appId, href, name }: { appId: string; href: string; name: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn--primary" onClick={() => markVisited(appId)}>
      Open {name} <ArrowUpRight aria-hidden="true" />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
