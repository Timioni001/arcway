'use client';

import { Compass } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useActivity } from "../lib/hooks/useActivity";
import { appForContract, type ArcApp } from "../lib/registry";
import { AppMark } from "./CategoryIcon";

/** Apps this wallet has actually used, counted from its own transactions. */
export function ActivityApps() {
  const activity = useActivity();
  const used = useMemo(() => {
    const map = new Map<string, { app: ArcApp; count: number }>();
    for (const tx of activity.data?.items ?? []) {
      const app = appForContract(tx.to);
      if (!app || !tx.success) continue;
      const entry = map.get(app.id) ?? { app, count: 0 };
      entry.count += 1;
      map.set(app.id, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [activity.data]);

  return (
    <section className="card pad" aria-labelledby="used-title">
      <h2 id="used-title" className="h4">Apps you&apos;ve used</h2>
      {used.length === 0 ? (
        <div className="small secondary" style={{ marginTop: 12 }}>
          Use a listed app and it shows up here.
          <div style={{ marginTop: 14 }}><Link href="/apps" className="btn btn--secondary btn--sm"><Compass aria-hidden="true" />Explore apps</Link></div>
        </div>
      ) : (
        <ul style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {used.map(({ app, count }) => (
            <li key={app.id}>
              <Link href={`/apps/${app.slug}`} className="row" style={{ gap: 12, color: "inherit" }}>
                <AppMark app={app} size="sm" />
                <span style={{ fontWeight: 600 }}>{app.name}</span>
                <span className="xs secondary mono" style={{ marginLeft: "auto" }}>{count} tx</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
