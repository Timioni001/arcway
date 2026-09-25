import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "Arcway",
  description: "Enter Arc. Discover what to do next."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
