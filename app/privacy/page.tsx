import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "../../components/Legal";
import { CONTACT_URL } from "../../lib/config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary={
        <ul>
          <li>No accounts, no email, no names. We only see your public wallet address when you connect.</li>
          <li>No advertising or tracking cookies.</li>
          <li>Preferences like dark mode and saved apps stay in your browser.</li>
        </ul>
      }
      sections={[
        {
          id: "collect",
          title: "What we collect",
          body: (
            <>
              <p><b>Wallet address.</b> When you connect a wallet, your public address is used to read your balance, activity and quest progress from the Arc network.</p>
              <p><b>Quest claims.</b> When you claim XP, we record the address, the quest and the transaction on Arc. This is public on the blockchain by design.</p>
              <p><b>Basic server logs.</b> Our hosting provider keeps standard request logs (such as IP address, browser and time) to run and protect the service. We use IP addresses briefly to limit abuse.</p>
            </>
          )
        },
        {
          id: "not-collect",
          title: "What we don't collect",
          body: <p>We don&apos;t ask for your name, email or phone number. We never see your private keys or recovery phrase. We don&apos;t use advertising, analytics profiles or tracking cookies.</p>
        },
        {
          id: "browser",
          title: "Stored in your browser",
          body: <p>Your theme choice, saved apps, the apps you&apos;ve opened and which wallet you last connected are kept in your browser&apos;s local storage. They never leave your device, and you can clear them any time from your browser settings.</p>
        },
        {
          id: "public",
          title: "Blockchain data is public",
          body: <p>Anything recorded on Arc, including XP and badges on your passport, is public and permanent. Anyone can view a passport by its address, and we can&apos;t delete information from the blockchain.</p>
        },
        {
          id: "providers",
          title: "Services we rely on",
          body: <p>To show your activity we query the Arc network and its block explorer with your public address. The site is hosted on Vercel. These providers process data under their own privacy policies. Apps you open from Arcway are run by others and have their own policies.</p>
        },
        {
          id: "retention",
          title: "How long we keep data",
          body: <p>Server logs are kept only as long as our hosting provider retains them. Rate-limit records are held in memory for about a minute. Onchain records are permanent by nature.</p>
        },
        {
          id: "rights",
          title: "Your choices",
          body: <p>You can use most of Arcway without connecting a wallet, and you can disconnect at any time. Depending on where you live, you may have rights to access or delete personal data we hold; contact us and we&apos;ll help where we can.</p>
        },
        {
          id: "children",
          title: "Children",
          body: <p>Arcway is not meant for anyone under 18.</p>
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we change this policy, we&apos;ll update the date at the top.</p>
        },
        {
          id: "contact",
          title: "Contact",
          body: <p>Questions about privacy? <a className="link" href={CONTACT_URL} target="_blank" rel="noopener noreferrer">Contact the team</a>. See also our <Link className="link" href="/terms">Terms of Use</Link>.</p>
        }
      ]}
    />
  );
}
