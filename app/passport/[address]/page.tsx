import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAddress, isAddress, type Address } from "viem";
import { PublicPassport } from "../../../components/PublicPassport";
import { shortAddress } from "../../../lib/format";

type Props = { params: Promise<{ address: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  if (!isAddress(address)) return {};
  const title = `Passport ${shortAddress(getAddress(address))}`;
  return { title, description: "XP, level and badges on Arc, via Arcway." };
}

export default async function PassportOfPage({ params }: Props) {
  const { address } = await params;
  if (!isAddress(address)) notFound();
  return (
    <div className="container page">
      <PublicPassport address={getAddress(address) as Address} />
    </div>
  );
}
