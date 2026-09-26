import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PayCheckout } from "../../../components/PayCheckout";
import { shortAddress } from "../../../lib/format";
import { readPayRequest } from "../../../lib/pay";

type Props = { params: Promise<{ address: string }>; searchParams: Promise<{ amount?: string; note?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const req = readPayRequest((await params).address, await searchParams);
  if (!req) return {};
  const what = req.amount?.ok ? `${req.amount.text} USDC` : "USDC";
  return { title: `Pay ${what} to ${shortAddress(req.to)}`, description: req.note || "A pay link on Arc, via Arcway." };
}

export default async function PayLinkPage({ params, searchParams }: Props) {
  const req = readPayRequest((await params).address, await searchParams);
  if (!req) notFound();
  return (
    <div className="container page">
      <div className="checkout-wrap">
        <PayCheckout to={req.to} amount={req.amount?.ok ? req.amount.text : undefined} note={req.note} />
        <p className="xs secondary" style={{ textAlign: "center", marginTop: 16 }}>
          Arcway never holds your money. You approve the payment in your own wallet.
        </p>
      </div>
    </div>
  );
}
