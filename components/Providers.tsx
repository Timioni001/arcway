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
  useEffect(() => { document.documentElement.dataset.hydrated = "true"; }, []);
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
