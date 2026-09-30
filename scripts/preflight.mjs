#!/usr/bin/env node
/**
 * Pre-flight for a network switch (run before pointing production at mainnet, and after deploying).
 * Reads the same environment variables as the app and checks, onchain, everything the live site
 * relies on. Read-only: it never sends a transaction and never prints a private key.
 *
 *   node --env-file=.env.production.local scripts/preflight.mjs
 *   npm run preflight            (uses the current environment)
 *
 * Exit code 0 = ready, 1 = something required is missing or wrong.
 */
import { createPublicClient, erc20Abi, formatUnits, getAddress, http, isAddress, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const env = process.env;
const network = env.NEXT_PUBLIC_ARC_NETWORK === "mainnet" ? "mainnet" : "testnet";
const DEFAULTS = {
  mainnet: { chainId: 5042, rpc: "https://rpc.mainnet.arc.io", explorer: "https://explorer.arc.io" },
  testnet: { chainId: 5042002, rpc: "https://rpc.testnet.arc.network", explorer: "https://testnet.arcscan.app" }
}[network];
const expectChain = Number(env.PREFLIGHT_EXPECT_CHAIN_ID || DEFAULTS.chainId);
const rpc = env.NEXT_PUBLIC_ARC_RPC_URL || DEFAULTS.rpc;
const usdc = env.NEXT_PUBLIC_ARC_USDC || "0x3600000000000000000000000000000000000000";
const passport = env.NEXT_PUBLIC_PASSPORT_CONTRACT;
const campaigns = env.NEXT_PUBLIC_CAMPAIGNS_CONTRACT;
const LOW_BALANCE = Number(env.PREFLIGHT_MIN_VERIFIER_USDC || 1);

let verifier = env.VERIFIER_ADDRESS;
if (!verifier && env.VERIFIER_PRIVATE_KEY) {
  try { verifier = privateKeyToAccount(env.VERIFIER_PRIVATE_KEY.trim()).address; } catch { verifier = undefined; }
}

const results = [];
const pass = (name, detail = "") => results.push({ level: "ok", name, detail });
const fail = (name, detail = "") => results.push({ level: "fail", name, detail });
const warn = (name, detail = "") => results.push({ level: "warn", name, detail });

const client = createPublicClient({ transport: http(rpc, { timeout: 15_000, retryCount: 1 }) });
const hasCode = async (address) => { const c = await client.getCode({ address }); return Boolean(c && c !== "0x"); };
const verifierAbi = parseAbi(["function verifier(address) view returns (bool)", "function owner() view returns (address)"]);
const campaignsAbi = parseAbi(["function usdc() view returns (address)", "function verifier(address) view returns (bool)"]);

async function main() {
  console.log(`\nArcway pre-flight · ${network} · ${rpc}\n`);

  // 1. Network
  let chainId;
  try {
    chainId = await client.getChainId();
    const block = await client.getBlockNumber();
    chainId === expectChain ? pass("RPC reachable, right chain", `chain ${chainId}, block ${block}`) : fail("Wrong chain", `RPC reports ${chainId}, expected ${expectChain} for ${network}`);
  } catch (e) {
    fail("RPC unreachable", String(e?.shortMessage ?? e?.message ?? e));
    return;
  }

  // 2. USDC
  if (!isAddress(usdc)) fail("USDC address invalid", usdc);
  else {
    try {
      const [symbol, decimals] = await Promise.all([
        client.readContract({ address: usdc, abi: erc20Abi, functionName: "symbol" }),
        client.readContract({ address: usdc, abi: erc20Abi, functionName: "decimals" })
      ]);
      symbol === "USDC" && decimals === 6 ? pass("USDC", `${getAddress(usdc)} · ${symbol}, ${decimals} decimals`) : fail("USDC looks wrong", `${symbol}, ${decimals} decimals at ${usdc}`);
    } catch { fail("USDC not readable", usdc); }
  }

  // 3. Verifier
  if (!verifier || !isAddress(verifier)) fail("Verifier not configured", "set VERIFIER_PRIVATE_KEY (server) or VERIFIER_ADDRESS for this check");
  else {
    try {
      const bal = await client.readContract({ address: usdc, abi: erc20Abi, functionName: "balanceOf", args: [verifier] });
      const n = Number(formatUnits(bal, 6));
      n >= LOW_BALANCE ? pass("Verifier funded", `${getAddress(verifier)} · ${n} USDC`) : fail("Verifier balance low", `${n} USDC, needs at least ${LOW_BALANCE} (each claim costs well under 0.01)`);
    } catch { fail("Verifier balance unreadable", verifier); }
  }

  // 4. Passport (required: quests record here)
  if (!passport || !isAddress(passport)) fail("Passport not configured", "set NEXT_PUBLIC_PASSPORT_CONTRACT");
  else if (!(await hasCode(passport))) fail("Passport has no code on this chain", `${passport} (deployed on another network?)`);
  else {
    pass("Passport deployed", getAddress(passport));
    if (verifier && isAddress(verifier)) {
      const ok = await client.readContract({ address: passport, abi: verifierAbi, functionName: "verifier", args: [verifier] }).catch(() => false);
      ok ? pass("Verifier authorised on Passport") : fail("Verifier not authorised on Passport", "owner must call setVerifier(verifier, true)");
    }
  }

  // 5. Campaigns (optional: without it campaigns stay in preview)
  if (!campaigns) warn("Campaigns not configured", "optional; campaigns stay in preview until NEXT_PUBLIC_CAMPAIGNS_CONTRACT is set");
  else if (!isAddress(campaigns) || !(await hasCode(campaigns))) fail("Campaigns has no code on this chain", campaigns);
  else {
    pass("Campaigns deployed", getAddress(campaigns));
    const token = await client.readContract({ address: campaigns, abi: campaignsAbi, functionName: "usdc" }).catch(() => null);
    token && isAddress(usdc) && getAddress(token) === getAddress(usdc) ? pass("Campaigns escrows the right USDC") : fail("Campaigns USDC mismatch", `contract uses ${token}, app uses ${usdc}`);
    if (verifier && isAddress(verifier)) {
      const ok = await client.readContract({ address: campaigns, abi: campaignsAbi, functionName: "verifier", args: [verifier] }).catch(() => false);
      ok ? pass("Verifier authorised on Campaigns") : fail("Verifier not authorised on Campaigns", "owner must call setVerifier(verifier, true)");
    }
  }

  // 6. Optional services
  env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY ? (env.NEXT_PUBLIC_CIRCLE_CHAIN || network === "testnet" ? pass("Passkey wallets configured") : warn("Passkey wallets", "set NEXT_PUBLIC_CIRCLE_CHAIN to Circle's name for Arc Mainnet")) : warn("Passkey wallets off", "optional; set NEXT_PUBLIC_CIRCLE_CLIENT_KEY to enable");
  if (env.PREFLIGHT_SKIP_EXPLORER !== "1") {
    try {
      const r = await fetch(`${DEFAULTS.explorer}/api/v2/stats`, { signal: AbortSignal.timeout(10_000) });
      r.ok ? pass("Explorer API reachable", DEFAULTS.explorer) : warn("Explorer API", `HTTP ${r.status}; live data pages will show 'unavailable'`);
    } catch { warn("Explorer API unreachable", `${DEFAULTS.explorer}; live data pages will show 'unavailable'`); }
  }
}

main()
  .catch((e) => fail("Pre-flight crashed", String(e?.message ?? e)))
  .finally(() => {
    const icon = { ok: "✓", warn: "!", fail: "✗" };
    for (const r of results) console.log(`  ${icon[r.level]} ${r.name}${r.detail ? `  —  ${r.detail}` : ""}`);
    const failed = results.filter((r) => r.level === "fail").length;
    console.log(failed ? `\n${failed} problem${failed === 1 ? "" : "s"} to fix before going live.\n` : "\nReady.\n");
    process.exit(failed ? 1 : 0);
  });
