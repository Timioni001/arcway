import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { arcChain } from "./config";

export const wagmiConfig = createConfig({
  chains: [arcChain],
  // EIP-6963 discovery lists every installed wallet; `injected` is the fallback.
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  // Fail fast so an RPC outage turns into a clear "retry" step instead of a long spinner.
  transports: { [arcChain.id]: http(undefined, { retryCount: 1, timeout: 8_000 }) },
  ssr: true
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
