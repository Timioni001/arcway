import type { MetadataRoute } from "next";
import { buildersFrom } from "../lib/builders";
import { QUESTS } from "../lib/quests";
import { APPS } from "../lib/registry";
import { SITE_URL } from "../lib/site";

const PAGES = ["", "/apps", "/quests", "/passport", "/leaderboard", "/pulse", "/radar", "/signals", "/builders", "/submit", "/digest", "/campaigns", "/wallet", "/terms", "/privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE_URL}${path}`, priority });
  return [
    ...PAGES.map((p) => at(p, p === "" ? 1 : 0.7)),
    ...APPS.map((a) => at(`/apps/${a.slug}`, 0.6)),
    ...QUESTS.map((q) => at(`/quests/${q.id}`, 0.6)),
    ...buildersFrom().map((b) => at(`/builders/${b.id}`, 0.4))
  ];
}
