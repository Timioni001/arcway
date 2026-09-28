import { describe, expect, it, vi } from "vitest";
import { smartAccountProvider } from "../lib/smartProvider";

const ME = "0x1111111111111111111111111111111111111111";
const OTHER = "0x2222222222222222222222222222222222222222";

function make() {
  const deps = {
    address: ME as `0x${string}`,
    chainId: 5042002,
    sendCalls: vi.fn(async () => "0xtxhash" as `0x${string}`),
    signMessage: vi.fn(async () => "0xsig" as `0x${string}`),
    signTypedData: vi.fn(async () => "0xtyped" as `0x${string}`),
    rpc: vi.fn(async () => "0xrpc")
  };
  return { deps, p: smartAccountProvider(deps) };
}

describe("passkey wallet provider (EIP-1193 over a smart account)", () => {
  it("reports its own account and Arc as the chain", async () => {
    const { p } = make();
    expect(await p.request({ method: "eth_requestAccounts" })).toEqual([ME]);
    expect(await p.request({ method: "eth_chainId" })).toBe("0x4cef52");
  });
  it("sends a transaction as one sponsored call and returns the transaction hash", async () => {
    const { p, deps } = make();
    const hash = await p.request({ method: "eth_sendTransaction", params: [{ from: ME, to: OTHER, value: "0x2a", data: "0xabcd" }] });
    expect(hash).toBe("0xtxhash");
    expect(deps.sendCalls).toHaveBeenCalledWith([{ to: OTHER, value: 42n, data: "0xabcd" }]);
  });
  it("only signs for its own address", async () => {
    const { p, deps } = make();
    expect(await p.request({ method: "personal_sign", params: ["0x68656c6c6f", ME] })).toBe("0xsig");
    await expect(p.request({ method: "personal_sign", params: ["0x68656c6c6f", OTHER] })).rejects.toThrow(/own address/);
    await expect(p.request({ method: "eth_sendTransaction", params: [{ from: OTHER, to: ME }] })).rejects.toThrow(/own address/);
    expect(await p.request({ method: "eth_signTypedData_v4", params: [ME, JSON.stringify({ primaryType: "X" })] })).toBe("0xtyped");
    expect(deps.signTypedData).toHaveBeenCalledWith({ primaryType: "X" });
  });
  it("stays on Arc and forwards reads to the network", async () => {
    const { p, deps } = make();
    expect(await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x4cef52" }] })).toBeNull();
    await expect(p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x1" }] })).rejects.toThrow(/Arc only/);
    expect(await p.request({ method: "eth_getBalance", params: [ME, "latest"] })).toBe("0xrpc");
    expect(deps.rpc).toHaveBeenCalledWith("eth_getBalance", [ME, "latest"]);
  });
});
