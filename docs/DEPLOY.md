# Deploy Arcway on Vercel

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

# Going live on Arc Mainnet

Mainnet uses real USDC and transactions can't be undone. Use fresh wallets that
hold only what they need.

## What it costs (at today's ~20 gwei fee)

| Action | Gas | Cost |
|---|---|---|
| Deploy passport + authorise verifier | ~750k | ~$0.02 |
| Each XP claim (paid by the verifier) | ~116k | ~$0.003 |

5 USDC in the verifier wallet covers well over 1,000 claims.

## 1. Wallets (on your machine)

```bash
cast wallet new            # run twice: one DEPLOYER (owner), one VERIFIER
cast wallet import mainnet-deployer --interactive   # paste the deployer key
```

Fund on Arc Mainnet: deployer ~1 USDC, verifier ~5 USDC
(via https://portal.arc.io, Across, or an exchange withdrawal to Arc).

## 2. Deploy the passport (one command)

```bash
cd contracts
forge install foundry-rs/forge-std --no-git   # once
forge test
export ARC_RPC_URL=https://rpc.mainnet.arc.io
export VERIFIER_ADDRESS=0x...   # the verifier wallet's address
forge script script/Deploy.s.sol:Deploy --rpc-url $ARC_RPC_URL --account mainnet-deployer --broadcast
```

It prints `ArcwayPassport: 0x...`. Check the verifier is authorised:

```bash
cast call <PASSPORT> "verifier(address)(bool)" $VERIFIER_ADDRESS --rpc-url $ARC_RPC_URL   # true
```

Optional: verify the source at https://explorer.arc.io (Contract → Verify & Publish,
Solidity single file from `forge flatten src/ArcwayPassport.sol`, compiler 0.8.30,
optimizer on, 200 runs).

## 3. Point Vercel at mainnet

Vercel → Settings → Environment Variables, **Production** environment:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_ARC_NETWORK` | `mainnet` |
| `NEXT_PUBLIC_PASSPORT_CONTRACT` | the new mainnet passport address |
| `VERIFIER_PRIVATE_KEY` | the new verifier key (Sensitive) |

Tip: keep your testnet values on the **Preview** environment, so preview
deployments stay on testnet and production runs on mainnet.

Then **Deployments → latest production → Redeploy**.

## 4. Check it's live

Open `https://<your-site>/api/health`. You want:

```json
{ "network": "mainnet", "rpc": { "ok": true }, "passport": { "deployed": true },
  "verifier": { "authorized": true, "low": false }, "claimsReady": true }
```

Then a real run-through with small amounts:

1. Connect a wallet holding ≥ 1 USDC on Arc → claim **Arrive on Arc**.
2. Make a pay link and pay 0.10 USDC to it from a second wallet → that wallet can claim **First transaction**.
3. Swap a tiny amount on Uniswap → claim **Explore an app** (Uniswap's contracts are verified on mainnet).
4. Claim **Arc Explorer**, then share your passport link.

## Keeping it safe

- The verifier key is a hot wallet: keep only a few USDC in it and watch `/api/health` (`low: true` means top it up).
- To rotate a leaked verifier: from the deployer, `setVerifier(old, false)` then `setVerifier(new, true)`.
- Ownership moves in two steps (`transferOwnership` → `acceptOwnership`), so a typo can't lock you out.
