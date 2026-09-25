'use client';

import { useCallback, useMemo, useState } from "react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { arcChain } from "../config";
import { humanizeError } from "../errors";

/**
 * Wallet actions with user-facing error messages.
 * Network switches only ever happen from an explicit click; never silently.
 */
export function useWallet() {
  const connection = useConnection();
  const connectors = useConnectors();
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();
  const switchMutation = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  // Prefer EIP-6963 announced wallets; hide the generic fallback when a named one exists.
  const available = useMemo(() => {
    const named = connectors.filter((c) => c.id !== "injected");
    return named.length ? named : connectors;
  }, [connectors]);

  const hasBrowserWallet =
    typeof window !== "undefined" && (Boolean((window as { ethereum?: unknown }).ethereum) || available.length > 1);

  const connect = useCallback(
    async (connectorId?: string) => {
      setError(null);
      const connector = available.find((c) => c.id === connectorId) ?? available[0];
      if (!connector || !hasBrowserWallet) {
        setError("No browser wallet found. Install a wallet extension, then reload this page.");
        return;
      }
      try {
        await connectMutation.mutateAsync({ connector });
      } catch (e) {
        setError(humanizeError(e));
      }
    },
    [available, connectMutation, hasBrowserWallet]
  );

  const switchToArc = useCallback(async () => {
    setError(null);
    try {
      await switchMutation.mutateAsync({ chainId: arcChain.id });
    } catch (e) {
      setError(humanizeError(e));
    }
  }, [switchMutation]);

  const disconnect = useCallback(() => {
    setError(null);
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  return {
    connection,
    connectors: available,
    hasBrowserWallet,
    connect,
    disconnect,
    switchToArc,
    connecting: connectMutation.isPending || connection.status === "connecting",
    switching: switchMutation.isPending,
    error,
    clearError: () => setError(null)
  };
}
