import { Wallet } from "lucide-react";
import type { Metadata } from "next";
import { GetWallet } from "../../components/GetWallet";
import { PageHead } from "../../components/PageHead";

export const metadata: Metadata = { title: "Get a wallet", description: "Create a free Arc wallet with a passkey in seconds, or set up a wallet app. No seed phrase needed." };

export default function WalletPage() {
  return (
    <div className="container page">
      <PageHead icon={Wallet} kicker="Get a wallet" title="Your first Arc wallet" lead="A wallet is your account on Arc. It holds your USDC and your passport, and only you can use it. Pick the way that suits you." />
      <GetWallet />
    </div>
  );
}
