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

After deployment:

1. Verify the contract.
2. Set the verifier.
3. Record the address in the frontend environment.
4. Run a low-value mainnet test.
