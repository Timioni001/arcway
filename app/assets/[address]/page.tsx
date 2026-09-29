import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetView } from "../../../components/Assets";

type Props = { params: Promise<{ address: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  return { title: `Asset ${address.slice(0, 6)}…${address.slice(-4)}`, description: "Holders, supply, recent transfers and related apps for a token on Arc." };
}

export default async function AssetPage({ params }: Props) {
  const { address } = await params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) notFound();
  return (
    <div className="container page">
      <AssetView address={address} />
    </div>
  );
}
