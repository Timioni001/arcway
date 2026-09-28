'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnect, useConnection, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { arcChain } from "../config";
import { humanizeError } from "../errors";
import { savedPasskey } from "../passkey";
import { PASSKEY_CONNECTOR_ID } from "../passkeyConnector";

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

  // The passkey wallet is offered on its own, not mixed into the browser-wallet list.
  const passkey = connectors.find((c) => c.id === PASSKEY_CONNECTOR_ID);
  const [hasPasskey, setHasPasskey] = useState(false);
  useEffect(() => setHasPasskey(Boolean(passkey && savedPasskey())), [passkey]);

  // Prefer EIP-6963 announced wallets; hide the generic fallback when a named one exists.
  const available = useMemo(() => {
    const browser = connectors.filter((c) => c.id !== PASSKEY_CONNECTOR_ID);
    const named = browser.filter((c) => c.id !== "injected");
    return named.length ? named : browser;
  }, [connectors]);

  const hasBrowserWallet =
    typeof window !== "undefined" && (Boolean((window as { ethereum?: unknown }).ethereum) || available.length > 1);

  const connect = useCallback(
    async (connectorId?: string) => {
      setError(null);
      const usePasskey = passkey && (connectorId === PASSKEY_CONNECTOR_ID || (!connectorId && !hasBrowserWallet && savedPasskey()));
      const connector = usePasskey ? passkey : available.find((c) => c.id === connectorId) ?? available[0];
      if (!connector || (!usePasskey && !hasBrowserWallet)) {
        setError("No browser wallet found. Create a free wallet on Arcway, or install a wallet app and reload.");
        return;
      }
      try {
        await connectMutation.mutateAsync({ connector });
      } catch (e) {
        setError(humanizeError(e));
      }
    },
    [available, connectMutation, hasBrowserWallet, passkey]
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
    /** A passkey wallet was created or used on this device and can sign in again. */
    hasPasskey,
    passkeyEnabled: Boolean(passkey),
    connect,
    disconnect,
    switchToArc,
    connecting: connectMutation.isPending || connection.status === "connecting",
    switching: switchMutation.isPending,
    error,
    clearError: () => setError(null)
  };
}
