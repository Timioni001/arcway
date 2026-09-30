# Deployment

Infrastructure: Vercel (Next.js, deploys `main` on every push), Arc RPC and explorer (public),
optional Envio hosted indexer, and two Foundry-deployed contracts.

## Environment

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_ARC_NETWORK` | public | `testnet` or `mainnet`; one network per deployment |
| `NEXT_PUBLIC_ARC_RPC_URL` | public | Optional RPC override |
| `NEXT_PUBLIC_ARC_USDC` | public | USDC address on that network |
| `NEXT_PUBLIC_PASSPORT_CONTRACT` | public | ArcwayPassport address |
| `NEXT_PUBLIC_CAMPAIGNS_CONTRACT` | public | ArcwayCampaigns address; campaigns stay in preview until set |
| `NEXT_PUBLIC_CIRCLE_CLIENT_KEY` | public | Passkey wallets; off until set |
| `NEXT_PUBLIC_CIRCLE_CLIENT_URL`, `NEXT_PUBLIC_CIRCLE_CHAIN` | public | Optional Circle overrides |
| `NEXT_PUBLIC_BRIDGE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_URL` | public | Optional links |
| `VERIFIER_PRIVATE_KEY` | server, sensitive | Signs passport records, campaign entries and results |
| `EXPLORER_API_KEY` | server | Optional, if the explorer rate-limits |
| `ARCWAY_INDEXER_URL` | server | Optional Envio GraphQL endpoint |

`.env.example` has the same list with comments.

## Deploy Arcway on Vercel

No local Next.js needed. Vercel builds the app from GitHub.

## 1. Import the project

1. Go to https://vercel.com and sign in with GitHub.
2. **Add New… → Project**, then **Import** `Timioni001/arcway`.
   (If it isn't listed, choose **Adjust GitHub App Permissions** and allow the repo.)
3. Leave the defaults: Framework **Next.js**, Root directory `./`, build and install commands empty.

## 2. Add environment variables (before the first deploy)

In the same screen, open **Environment Variables** and add:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_ARC_NETWORK` | `testnet` | `mainnet` later |
| `NEXT_PUBLIC_PASSPORT_CONTRACT` | `0xa8a4A8FdE3fdCe351b9b22ACc3368e3b308b0107` | your deployed passport |
| `VERIFIER_PRIVATE_KEY` | verifier wallet key, with `0x` | mark **Sensitive** |

Optional: `NEXT_PUBLIC_BRIDGE_URL`, `NEXT_PUBLIC_ARC_RPC_URL`, `NEXT_PUBLIC_SUBMIT_APP_URL`.

Never give the verifier key a `NEXT_PUBLIC_` name; that would publish it.

## 3. Deploy

Click **Deploy**. After about a minute you get a URL like `arcway-xxxx.vercel.app`.

## 4. Check it works

1. Open the URL, connect your wallet, switch to Arc Testnet.
2. With at least 1 USDC in the wallet, "Arrive on Arc" should say **Ready to claim**.
3. Claim it. It should end on **XP claimed** with a transaction link.

If claiming says "Claiming opens soon", one of the two passport variables is missing
or misspelled: fix it in **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.

## Updating

Every push to the repo's default branch redeploys automatically. Changing an
environment variable needs a manual **Redeploy**.

## Custom domain (optional)

**Settings → Domains → Add**, then follow the DNS instructions Vercel shows.

---

## Campaigns contract

```bash
cd contracts
VERIFIER_ADDRESS=0xYourVerifier forge script script/DeployCampaigns.s.sol:DeployCampaigns \
  --rpc-url $ARC_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

Set `NEXT_PUBLIC_CAMPAIGNS_CONTRACT` to the printed address and redeploy. `VERIFIER_ADDRESS` must be
the address of `VERIFIER_PRIVATE_KEY`, so the same key can sign entries and publish results.

## Indexer (optional)

See `indexer/README.md`. Deploy to Envio's hosted service, then set `ARCWAY_INDEXER_URL` to its
GraphQL endpoint. Without it, passport stats come from the explorer.

---

# Going live on Arc Mainnet

Mainnet uses real USDC and transactions can't be undone. Use fresh wallets that hold only what they
need, and never paste a private key anywhere except your own terminal and Vercel's Sensitive
variables.

## Launch checklist

1. [ ] Two fresh wallets: a **deployer** (owns the contracts) and a **verifier** (signs claims)
2. [ ] Fund on Arc Mainnet: deployer ~2 USDC, verifier ~5 USDC
3. [ ] `forge test` passes
4. [ ] Deploy ArcwayPassport (and optionally ArcwayCampaigns) with the verifier authorised
5. [ ] `npm run preflight` against mainnet says **Ready.**
6. [ ] Vercel Production variables switched to mainnet; Preview keeps testnet
7. [ ] Redeploy, then `/api/health` returns `"claimsReady": true`
8. [ ] Claim "Arrive on Arc" with a real wallet holding 1 USDC, and see it on the leaderboard

## What it costs (at today's ~20 gwei fee)

| Action | Gas | Cost |
|---|---|---|
| Deploy passport + authorise verifier | ~750k | ~$0.02 |
| Deploy campaigns + authorise verifier | ~2.5M | ~$0.06 |
| Each XP claim (paid by the verifier) | ~116k | ~$0.003 |

5 USDC in the verifier wallet covers well over 1,000 claims.

## 1. Wallets (on your machine)

```bash
cast wallet new            # run twice: one DEPLOYER (owner), one VERIFIER
cast wallet import mainnet-deployer --interactive   # paste the deployer key
```

Fund on Arc Mainnet via https://portal.arc.io, a bridge, or an exchange withdrawal to Arc.

## 2. Deploy the contracts

```bash
cd contracts
forge install foundry-rs/forge-std --no-git   # once
forge test
export ARC_RPC_URL=https://rpc.mainnet.arc.io
export VERIFIER_ADDRESS=0x...   # the verifier wallet's address

forge script script/Deploy.s.sol:Deploy --rpc-url $ARC_RPC_URL --account mainnet-deployer --broadcast
# prints ArcwayPassport: 0x...

# optional, for live campaigns:
forge script script/DeployCampaigns.s.sol:DeployCampaigns --rpc-url $ARC_RPC_URL --account mainnet-deployer --broadcast
# prints ArcwayCampaigns: 0x...
```

Optional: verify the source at https://explorer.arc.io (Contract → Verify & Publish, Solidity single
file from `forge flatten src/ArcwayPassport.sol`, compiler 0.8.30, optimizer on, 200 runs).

## 3. Pre-flight (read-only, from your machine)

```bash
NEXT_PUBLIC_ARC_NETWORK=mainnet \
NEXT_PUBLIC_PASSPORT_CONTRACT=0x... \
NEXT_PUBLIC_CAMPAIGNS_CONTRACT=0x... \
VERIFIER_ADDRESS=0x... \
npm run preflight
```

It checks the chain id (5042), USDC (symbol and decimals), that each contract has code on mainnet,
that the verifier is authorised on each and holds at least 1 USDC, that the campaigns escrow uses the
same USDC as the app, and that the explorer API answers. It never sends a transaction. Fix anything
marked ✗ before switching.

## 4. Point Vercel at mainnet

Vercel → Settings → Environment Variables, **Production** environment:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_ARC_NETWORK` | `mainnet` |
| `NEXT_PUBLIC_PASSPORT_CONTRACT` | the mainnet passport address |
| `NEXT_PUBLIC_CAMPAIGNS_CONTRACT` | the mainnet campaigns address (optional) |
| `VERIFIER_PRIVATE_KEY` | the verifier key (Sensitive) |
| `NEXT_PUBLIC_ARC_RPC_URL` | optional: a dedicated mainnet RPC |
| `EXPLORER_API_KEY` | optional: explorer API key for higher rate limits |
| `ARCWAY_INDEXER_URL` | optional: a mainnet indexer (chain id 5042), never the testnet one |

Keep your testnet values on the **Preview** environment, so preview deployments stay on testnet and
production runs on mainnet. Passkey wallets stay off on mainnet until `NEXT_PUBLIC_CIRCLE_CLIENT_KEY`
and Circle's mainnet chain name (`NEXT_PUBLIC_CIRCLE_CHAIN`) are set.

Then **Deployments → latest production → Redeploy**.

## 5. Check it's live

Open `https://<your-site>/api/health`. You want:

```json
{ "network": "mainnet", "chainId": 5042, "rpc": { "ok": true }, "passport": { "deployed": true },
  "verifier": { "authorized": true, "low": false }, "claimsReady": true, "campaignsReady": true }
```

`campaignsReady` is only true when a campaigns contract is configured; it never fails the check.

## Rollback

Set `NEXT_PUBLIC_ARC_NETWORK` back to `testnet` (with the testnet passport address and verifier) and
redeploy. Contracts stay where they are; nothing onchain needs undoing.

## Keeping it safe


- The verifier key is a hot wallet: keep only a few USDC in it and watch `/api/health` (`low: true` means top it up).
- To rotate a leaked verifier: from the deployer, `setVerifier(old, false)` then `setVerifier(new, true)`.
- Ownership moves in two steps (`transferOwnership` → `acceptOwnership`), so a typo can't lock you out.
