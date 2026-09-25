import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestDetail } from "../../../components/QuestDetail";
import { QUESTS, getQuest } from "../../../lib/quests";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return QUESTS.map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quest = getQuest((await params).id);
  return quest ? { title: quest.title, description: quest.description } : {};
}

export default async function QuestPage({ params }: Props) {
  const { id } = await params;
  if (!getQuest(id)) notFound();
  return (
    <div className="container page">
      <Link href="/quests" className="back"><ArrowLeft aria-hidden="true" /> All quests</Link>
      <QuestDetail questId={id} />
    </div>
  );
}
