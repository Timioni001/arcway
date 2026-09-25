# Contracts

## ArcwayPassport

Minimal on-chain reputation registry.

### Local test

```bash
forge test -vv
```

### Deploy

Set an RPC URL and private key securely, then:

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $ARC_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

Do not use a valuable wallet for initial deployment testing.

### Verify source on Arcscan (testnet)

Arcscan's `/api` is Etherscan V1 compatible, so use the `custom` verifier
(`--verifier blockscout` fails with "Params 'module' and 'action' are required"):

```bash
forge verify-contract $PASSPORT src/ArcwayPassport.sol:ArcwayPassport \
  --chain 5042002 \
  --verifier custom \
  --verifier-url https://testnet.arcscan.app/api \
  --verifier-api-key empty \
  --watch
```

If the API still refuses, verify in the browser: `forge flatten src/ArcwayPassport.sol > flat.sol`,
then on the contract page choose Contract → Verify & Publish → Solidity (single file),
compiler 0.8.30, optimizer on, 200 runs, and paste `flat.sol`.

After deployment:

1. Verify the contract.
2. Set the verifier.
3. Record the address in the frontend environment.
4. Run a low-value mainnet test.
