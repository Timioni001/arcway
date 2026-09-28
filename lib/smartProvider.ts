import { type Address, type Hex, hexToBigInt, isAddressEqual, numberToHex } from "viem";

export type Call = { to: Address; value: bigint; data: Hex };

/** What a smart account needs to act like an ordinary browser wallet. */
export type SmartAccountDeps = {
  address: Address;
  chainId: number;
  /** Send calls as one sponsored user operation; resolve with the mined transaction hash. */
  sendCalls(calls: Call[]): Promise<Hex>;
  signMessage(raw: Hex): Promise<Hex>;
  signTypedData(data: unknown): Promise<Hex>;
  /** Everything else (reads, receipts, gas) goes to the network. */
  rpc(method: string, params?: unknown): Promise<unknown>;
};

export type Eip1193 = { request(args: { method: string; params?: unknown }): Promise<unknown>; on(): void; removeListener(): void };

class ProviderRpcError extends Error {
  constructor(public code: number, message: string) { super(message); }
}

/**
 * A minimal EIP-1193 provider over a smart account, so wagmi (and every screen that sends a
 * transaction) treats a passkey wallet like any other. Chain switching is refused: it lives on Arc.
 */
export function smartAccountProvider(d: SmartAccountDeps): Eip1193 {
  const own = (a: unknown) => {
    if (typeof a !== "string" || !isAddressEqual(a as Address, d.address)) throw new ProviderRpcError(4100, "This wallet can only sign for its own address.");
  };
  return {
    on() {},
    removeListener() {},
    async request({ method, params }) {
      const p = (Array.isArray(params) ? params : []) as unknown[];
      switch (method) {
        case "eth_accounts":
        case "eth_requestAccounts":
          return [d.address];
        case "eth_chainId":
          return numberToHex(d.chainId);
        case "wallet_switchEthereumChain": {
          const want = (p[0] as { chainId?: Hex } | undefined)?.chainId;
          if (want && hexToBigInt(want) === BigInt(d.chainId)) return null;
          throw new ProviderRpcError(4902, "Passkey wallets work on Arc only.");
        }
        case "personal_sign":
          own(p[1]);
          return d.signMessage(p[0] as Hex);
        case "eth_signTypedData_v4": {
          own(p[0]);
          const data = typeof p[1] === "string" ? JSON.parse(p[1]) : p[1];
          return d.signTypedData(data);
        }
        case "eth_sendTransaction": {
          const tx = p[0] as { from?: Address; to?: Address; value?: Hex; data?: Hex } | undefined;
          if (!tx?.to) throw new ProviderRpcError(-32602, "A transaction needs a recipient.");
          if (tx.from) own(tx.from);
          return d.sendCalls([{ to: tx.to, value: tx.value ? hexToBigInt(tx.value) : 0n, data: tx.data ?? "0x" }]);
        }
        default:
          return d.rpc(method, params);
      }
    }
  };
}
