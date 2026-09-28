import type { Address } from "viem";
import { createConnector } from "wagmi";
import { arcChain } from "./config";
import { forgetPasskey, passkeyProvider, savedPasskey } from "./passkey";
import type { Eip1193 } from "./smartProvider";

export const PASSKEY_CONNECTOR_ID = "circle-passkey";
const CONNECTED = "arcway:passkey:connected";

const flag = {
  get: () => { try { return localStorage.getItem(CONNECTED) === "1"; } catch { return false; } },
  set: (on: boolean) => { try { if (on) localStorage.setItem(CONNECTED, "1"); else localStorage.removeItem(CONNECTED); } catch { /* not persisted */ } }
};

/** A wagmi connector for the passkey smart wallet, so it signs in and reconnects like any wallet. */
export function passkeyConnector() {
  let provider: Eip1193 | null = null;
  const ensure = async () => {
    if (provider) return provider;
    const saved = savedPasskey();
    if (!saved) throw new Error("No passkey wallet on this device yet. Create one first.");
    provider = await passkeyProvider(saved);
    return provider;
  };
  return createConnector<Eip1193>((config) => ({
    id: PASSKEY_CONNECTOR_ID,
    name: "Passkey wallet",
    type: "circlePasskey",
    async connect({ withCapabilities } = {}) {
      const p = await ensure();
      const accounts = (await p.request({ method: "eth_accounts" })) as Address[];
      flag.set(true);
      return { accounts: (withCapabilities ? accounts.map((address) => ({ address, capabilities: {} })) : accounts) as never, chainId: arcChain.id };
    },
    async disconnect() {
      provider = null;
      flag.set(false);
    },
    async getAccounts() {
      return (await (await ensure()).request({ method: "eth_accounts" })) as Address[];
    },
    async getChainId() {
      return arcChain.id;
    },
    getProvider: ensure,
    async isAuthorized() {
      return flag.get() && Boolean(savedPasskey());
    },
    onAccountsChanged() {},
    onChainChanged() {},
    onDisconnect() {
      config.emitter.emit("disconnect");
    }
  }));
}

/** Sign out and remove this device's link to the passkey wallet (the passkey itself stays in the keychain). */
export function forgetPasskeyWallet() {
  flag.set(false);
  forgetPasskey();
}
