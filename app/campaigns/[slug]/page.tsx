import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignDetail } from "../../../components/Campaigns";
import { CAMPAIGNS, getCampaignMeta } from "../../../lib/campaigns";

export const dynamicParams = false;

export function generateStaticParams() {
  return CAMPAIGNS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const meta = getCampaignMeta((await params).slug);
  return meta ? { title: `${meta.title} · ${meta.project}`, description: meta.summary } : {};
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const meta = getCampaignMeta((await params).slug);
  if (!meta) notFound();
  return (
    <div className="container page">
      <CampaignDetail meta={meta} />
    </div>
  );
}
