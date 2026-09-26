import { NextResponse } from "next/server";
import { erc20Abi, formatUnits } from "viem";
import { passportAbi } from "../../../lib/abi";
import { ARC_NETWORK, PASSPORT_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arcChain } from "../../../lib/config";
import { publicClient, verifierClient } from "../../../lib/server/arc";

export const dynamic = "force-dynamic";

/** Below this, claims will start failing soon. Each claim costs well under 0.01 USDC. */
const LOW_BALANCE_USDC = 1;

/**
 * Launch/ops check: is the network reachable, is the passport deployed,
 * is the verifier authorised and funded? Exposes only public information.
 */
export async function GET() {
  const wallet = verifierClient();
  const verifierAddress = wallet?.account.address;
  const result = {
    network: ARC_NETWORK,
    chainId: arcChain.id,
    rpc: { ok: false, block: null as string | null },
    passport: { configured: Boolean(PASSPORT_ADDRESS), address: PASSPORT_ADDRESS ?? null, deployed: false },
    verifier: { configured: Boolean(wallet), address: verifierAddress ?? null, authorized: false, balanceUsdc: null as string | null, low: false },
    claimsReady: false
  };

  try {
    result.rpc.block = (await publicClient.getBlockNumber()).toString();
    result.rpc.ok = true;
  } catch {
    return NextResponse.json(result, { status: 503, headers: { "cache-control": "no-store" } });
  }

  const checks: Promise<void>[] = [];
  if (PASSPORT_ADDRESS) {
    checks.push(publicClient.getCode({ address: PASSPORT_ADDRESS }).then((code) => { result.passport.deployed = Boolean(code && code !== "0x"); }).catch(() => {}));
  }
  if (verifierAddress) {
    checks.push(
      publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [verifierAddress] })
        .then((b) => {
          result.verifier.balanceUsdc = formatUnits(b, USDC_DECIMALS);
          result.verifier.low = Number(result.verifier.balanceUsdc) < LOW_BALANCE_USDC;
        }).catch(() => {})
    );
    if (PASSPORT_ADDRESS) {
      checks.push(
        publicClient.readContract({ address: PASSPORT_ADDRESS, abi: passportAbi, functionName: "verifier", args: [verifierAddress] })
          .then((ok) => { result.verifier.authorized = ok; }).catch(() => {})
      );
    }
  }
  await Promise.all(checks);
  result.claimsReady = result.passport.deployed && result.verifier.authorized && !result.verifier.low;

  return NextResponse.json(result, { status: result.claimsReady ? 200 : 503, headers: { "cache-control": "no-store" } });
}
