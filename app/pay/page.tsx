import type { Metadata } from "next";
import { PayCreate } from "../../components/PayCreate";

export const metadata: Metadata = { title: "Pay links", description: "Get paid in USDC on Arc with a link or QR code." };

export default function PayPage() {
  return (
    <div className="container page">
      <div className="label" style={{ color: "var(--link)" }}>Pay links</div>
      <h1 className="h1" style={{ marginTop: 10 }}>Get paid in USDC with a link</h1>
      <p className="lead" style={{ margin: "12px 0 32px", maxWidth: 620 }}>
        Create a link or QR code. Whoever opens it can pay you in a couple of taps, and it settles on Arc in about a second.
      </p>
      <PayCreate />
    </div>
  );
}
