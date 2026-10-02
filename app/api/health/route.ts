import { NextResponse } from "next/server";
import { erc20Abi, formatUnits, parseAbi } from "viem";
import { passportAbi } from "../../../lib/abi";
import { ARC_NETWORK, CAMPAIGNS_ADDRESS, PASSPORT_ADDRESS, USDC_ADDRESS, USDC_DECIMALS, arcChain } from "../../../lib/config";
import { publicClient, verifierClient } from "../../../lib/server/arc";
import { explorerRequest, explorerSources } from "../../../lib/server/explorer";

export const dynamic = "force-dynamic";

const campaignsHealthAbi = parseAbi(["function usdc() view returns (address)", "function verifier(address) view returns (bool)"]);

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
    campaigns: { configured: Boolean(CAMPAIGNS_ADDRESS), address: CAMPAIGNS_ADDRESS ?? null, deployed: false, verifierAuthorized: false, usdcMatches: false },
    claimsReady: false,
    campaignsReady: false,
    /** Where live Arc data comes from. The explorer feeds activity, assets and wallet history. */
    data: {
      explorer: { sources: explorerSources().map((s) => s.name), ok: false, via: null as string | null, error: null as string | null },
      proKey: Boolean(process.env.EXPLORER_API_KEY?.trim().startsWith("proapi_"))
    }
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
  if (CAMPAIGNS_ADDRESS) {
    checks.push(publicClient.getCode({ address: CAMPAIGNS_ADDRESS }).then((code) => { result.campaigns.deployed = Boolean(code && code !== "0x"); }).catch(() => {}));
    checks.push(
      publicClient.readContract({ address: CAMPAIGNS_ADDRESS, abi: campaignsHealthAbi, functionName: "usdc" })
        .then((token) => { result.campaigns.usdcMatches = String(token).toLowerCase() === USDC_ADDRESS.toLowerCase(); }).catch(() => {})
    );
    if (verifierAddress) {
      checks.push(
        publicClient.readContract({ address: CAMPAIGNS_ADDRESS, abi: campaignsHealthAbi, functionName: "verifier", args: [verifierAddress] })
          .then((ok) => { result.campaigns.verifierAuthorized = Boolean(ok); }).catch(() => {})
      );
    }
  }
  checks.push(
    explorerRequest("/stats", { cache: "no-store" })
      .then((res) => { result.data.explorer.ok = res.ok; result.data.explorer.via = res.url.includes("api.blockscout.com") ? "blockscout-pro" : new URL(res.url || "http://x").host || null; })
      .catch((e) => { result.data.explorer.error = e instanceof Error ? e.message.slice(0, 160) : "unreachable"; })
  );
  await Promise.all(checks);
  // Campaigns are optional: they never fail the health check, they only report whether they're ready.
  result.campaignsReady = result.campaigns.deployed && result.campaigns.usdcMatches && result.campaigns.verifierAuthorized && !result.verifier.low;
  result.claimsReady = result.passport.deployed && result.verifier.authorized && !result.verifier.low;

  return NextResponse.json(result, { status: result.claimsReady ? 200 : 503, headers: { "cache-control": "no-store" } });
}
