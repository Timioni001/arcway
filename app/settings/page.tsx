import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { PageHead } from "../../components/PageHead";
import { SettingsView } from "../../components/SettingsView";

export const metadata: Metadata = { title: "Settings", description: "Theme, network details, how Arcway measures data, and data kept in your browser." };

export default function SettingsPage() {
  return (
    <div className="container page">
      <PageHead icon={Settings} kicker="Settings" title="Settings" lead="Appearance, network details, how we measure, and the data kept in this browser." />
      <SettingsView />
    </div>
  );
}
