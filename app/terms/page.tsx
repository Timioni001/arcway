import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../../components/Legal";
import { CONTACT_URL } from "../../lib/config";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      summary={
        <ul>
          <li>Arcway helps you find apps on Arc and track your progress. It never holds your money.</li>
          <li>Apps listed here are run by other teams. Check them yourself before you use them.</li>
          <li>XP and badges are for fun and recognition. They have no cash value.</li>
        </ul>
      }
      sections={[
        {
          id: "about",
          title: "About these terms",
          body: <p>These terms apply when you use Arcway (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site you agree to them. If you don&apos;t agree, please don&apos;t use Arcway. Arcway is an independent project built on Arc and is not affiliated with, endorsed by or operated by Circle.</p>
        },
        {
          id: "service",
          title: "What Arcway does",
          body: <p>Arcway lists apps on the Arc network, offers quests, and shows a passport of XP and badges based on your public onchain activity. We may change, pause or stop any part of the service at any time.</p>
        },
        {
          id: "wallet",
          title: "Your wallet and your funds",
          body: (
            <>
              <p>Arcway is non-custodial. We never ask for, see or store your private keys or recovery phrase, and we cannot move your funds. Connecting a wallet only shares your public address.</p>
              <p>You are responsible for your wallet, for every transaction you approve, and for checking the network and amounts in your wallet before you sign. Blockchain transactions cannot be reversed.</p>
            </>
          )
        },
        {
          id: "third-party",
          title: "Apps run by others",
          body: (
            <>
              <p>Apps listed on Arcway are built and run by independent teams. A listing is not a recommendation, and &ldquo;Verified&rdquo; only means we checked the app&apos;s contract addresses against a source the team published. It is not a security audit.</p>
              <p>Your use of any listed app is between you and that app, under its own terms. We are not responsible for losses caused by third-party apps, networks or wallets.</p>
            </>
          )
        },
        {
          id: "xp",
          title: "Quests, XP and badges",
          body: (
            <>
              <p>XP, levels and badges recognise activity on Arc. They are not money, securities or a promise of any future reward, token or airdrop, and they cannot be sold or exchanged through Arcway.</p>
              <p>We decide how quests are checked and may correct or remove XP that was earned by bugs, automation, multiple wallets controlled to game quests, or other abuse.</p>
            </>
          )
        },
        {
          id: "no-advice",
          title: "No financial advice",
          body: <p>Nothing on Arcway is financial, investment, legal or tax advice. Digital assets are risky and their value can fall. Do your own research.</p>
        },
        {
          id: "use",
          title: "Acceptable use",
          body: <p>Don&apos;t use Arcway to break the law, attack or overload the service, scrape it aggressively, get around rate limits, or claim quests you didn&apos;t complete. You may not use Arcway where it is prohibited, including in sanctioned places or by sanctioned persons.</p>
        },
        {
          id: "ip",
          title: "Names and logos",
          body: <p>The Arcway name and design belong to the Arcway team. Arc and Circle names and logos belong to Circle and are used only to say Arcway is built on Arc. App names and logos belong to their owners.</p>
        },
        {
          id: "liability",
          title: "Warranty and liability",
          body: <p>Arcway is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind. To the fullest extent allowed by law, we are not liable for any indirect or consequential loss, or for any loss of funds, data or profits, arising from your use of Arcway.</p>
        },
        {
          id: "changes",
          title: "Changes to these terms",
          body: <p>We may update these terms. The date at the top shows the latest version. If you keep using Arcway after a change, you accept the updated terms.</p>
        },
        {
          id: "contact",
          title: "Contact",
          body: <p>Questions? <a className="link" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Contact the team</a>. See also our <Link className="link" href="/privacy">Privacy Policy</Link>.</p>
        }
      ]}
    />
  );
}
