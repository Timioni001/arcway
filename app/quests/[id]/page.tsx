import { ChevronRight } from "lucide-react";
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
  const quest = getQuest(id);
  if (!quest) notFound();
  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/quests">Quests</Link><ChevronRight aria-hidden="true" /><span aria-current="page">{quest.title}</span>
      </nav>
      <QuestDetail questId={id} />
    </div>
  );
}
