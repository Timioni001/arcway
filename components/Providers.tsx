'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { ArcwayProvider } from "../lib/hooks/context";
import { ToastProvider } from "../lib/hooks/toast";
import { wagmiConfig } from "../lib/wagmi";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Refetch when the user comes back from an app tab, so progress feels live.
            refetchOnWindowFocus: true,
            retry: (count, error) => count < 1 && !(error instanceof Error && error.name === "ApiRequestError"),
            staleTime: 5_000
          }
        }
      })
  );
  // Marks the page interactive (children's effects have run); used by tests and CSS.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.hydrated = "true";
    // iOS Safari only shows :active press states when a touch listener exists.
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    // The opening animation plays once per visit; later page changes are instant (frequent actions stay still).
    const id = setTimeout(() => { delete root.dataset.intro; }, 1400);
    return () => { clearTimeout(id); document.removeEventListener("touchstart", noop); };
  }, []);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ArcwayProvider>{children}</ArcwayProvider>
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
