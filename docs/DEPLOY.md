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
