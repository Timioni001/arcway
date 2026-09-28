import type { Address, Hex } from "viem";
import { CIRCLE_CHAIN, CIRCLE_CLIENT_KEY, CIRCLE_CLIENT_URL, arcChain } from "./config";
import { smartAccountProvider, type Eip1193 } from "./smartProvider";

/**
 * Passkey wallets (Circle Modular Wallets on Arc). The passkey itself lives in the device's
 * keychain (iCloud Keychain, Google Password Manager, a security key); this device only remembers
 * the public credential so it can rebuild the smart account without asking again.
 * The SDK is loaded on demand, so pages that never use it don't pay for it.
 */
const KEY = "arcway:passkey";

export type SavedPasskey = { id: string; publicKey: Hex; username: string; address?: Address };

export function savedPasskey(): SavedPasskey | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as SavedPasskey;
    return typeof v?.id === "string" && typeof v?.publicKey === "string" ? v : null;
  } catch {
    return null;
  }
}

function save(v: SavedPasskey) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode: works for this visit only */ }
}

export function forgetPasskey() {
  try { localStorage.removeItem(KEY); } catch { /* nothing stored */ }
}

export function passkeySupported(): boolean {
  return typeof window !== "undefined" && window.isSecureContext && typeof window.PublicKeyCredential === "function";
}

/** Create a new passkey (mode "register") or use one this person already has (mode "login"). */
export async function passkeySignIn(mode: "register" | "login", username?: string): Promise<SavedPasskey> {
  const core = await import("@circle-fin/modular-wallets-core");
  const transport = core.toPasskeyTransport(CIRCLE_CLIENT_URL, CIRCLE_CLIENT_KEY);
  const credential = await core.toWebAuthnCredential({
    transport,
    mode: mode === "register" ? core.WebAuthnMode.Register : core.WebAuthnMode.Login,
    username: mode === "register" ? username : undefined
  });
  const saved: SavedPasskey = { id: credential.id, publicKey: credential.publicKey as Hex, username: username ?? "" };
  const provider = await passkeyProvider(saved);
  const [address] = (await provider.request({ method: "eth_accounts" })) as Address[];
  const withAddress = { ...saved, address };
  save(withAddress);
  return withAddress;
}

/** Rebuild the smart account for a saved passkey and wrap it as a standard wallet provider. */
export async function passkeyProvider(saved: SavedPasskey): Promise<Eip1193> {
  const [core, viem, aa] = await Promise.all([import("@circle-fin/modular-wallets-core"), import("viem"), import("viem/account-abstraction")]);
  const transport = core.toModularTransport(`${CIRCLE_CLIENT_URL}/${CIRCLE_CHAIN}`, CIRCLE_CLIENT_KEY);
  const client = viem.createPublicClient({ chain: arcChain, transport });
  const owner = aa.toWebAuthnAccount({ credential: { id: saved.id, publicKey: saved.publicKey } });
  const account = await core.toCircleSmartAccount({ client, owner });
  const bundler = aa.createBundlerClient({ account, chain: arcChain, client, transport });
  return smartAccountProvider({
    address: account.address,
    chainId: arcChain.id,
    async sendCalls(calls) {
      // `paymaster: true` asks Circle's Gas Station to cover the fee, so a new wallet needs no USDC to start.
      const hash = await bundler.sendUserOperation({ calls, paymaster: true });
      const { receipt } = await bundler.waitForUserOperationReceipt({ hash });
      return receipt.transactionHash;
    },
    signMessage: (raw) => account.signMessage({ message: { raw } }),
    signTypedData: (data) => account.signTypedData(data as Parameters<typeof account.signTypedData>[0]),
    rpc: (method, params) => client.request({ method, params } as never)
  });
}
