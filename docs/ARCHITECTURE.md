# Arcway: Intensive Architecture & Infrastructure Brief

> Version: 0.1
> Date: September 25, 2026
> Target: Arc Mainnet
> Status: MVP architecture

## 1. Product thesis

Arcway is not another Arc directory.

It is an **onboarding + discovery + verified activity layer**:

**External USDC → Arc → Discover → Act → Verify → XP/Badge → Discover again**

The product should make Arc useful to a first-time visitor within minutes.

The core loop is:

1. User arrives with or without USDC on Arc.
2. Arcway explains what can be done on Arc.
3. User chooses a concrete path.
4. Arcway routes the user to an Arc application.
5. The resulting on-chain action is observed.
6. A verifier confirms the quest.
7. Arcway updates the user's passport.
8. The user gets a reason to explore the next Arc application.

This is the key distinction from a static ecosystem directory.

---

## 2. Why Arc is technically relevant

Arc Mainnet is an EVM-compatible Layer 1 with native USDC gas. Circle describes Arc as infrastructure for financial markets, real-time value movement and agentic economic activity.

Current mainnet facts used by this architecture:

- Chain ID: `5042`
- Native gas asset: USDC
- Mainnet RPC: `https://rpc.mainnet.arc.io`
- EVM-compatible
- Arc uses USDC for network fees.
- Circle's public mainnet launch was September 16, 2026.
- Circle says Arc has sub-second finality and interoperability with 20+ chains through CCTP and Gateway.

Do not hard-code undocumented assumptions. Treat the Arc developer docs and Circle documentation as the source of truth before deployment.

---

## 3. High-level system

```text
                         ┌──────────────────────┐
                         │      USER / WALLET    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      ARCWAY WEB       │
                         │ Next.js + wagmi/viem │
                         └───────┬───────┬──────┘
                                 │       │
                 ┌───────────────┘       └────────────────┐
                 ▼                                        ▼
       ┌─────────────────┐                       ┌─────────────────┐
       │ Discovery API   │                       │ Circle Cross-   │
       │ App registry    │                       │ chain tooling   │
       │ Quest metadata  │                       │ CCTP / Gateway  │
       └────────┬────────┘                       └────────┬────────┘
                │                                         │
                ▼                                         ▼
       ┌─────────────────┐                       ┌─────────────────┐
       │ Indexer / RPC   │                       │ Other chains    │
       │ Arc activity    │                       │ Base/Eth/etc.   │
       └────────┬────────┘                       └─────────────────┘
                │
                ▼
       ┌─────────────────┐
       │ Quest Verifier  │
       │ validates proof │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │ Arcway Passport │
       │ Solidity        │
       │ XP + badges     │
       └─────────────────┘
```

---

## 4. Frontend

### Recommended stack

- Next.js
- TypeScript
- wagmi
- viem
- React Query
- Circle App Kit where it materially reduces wallet/payment/cross-chain complexity

### Responsibilities

The frontend should:

- Connect EVM wallets.
- Detect Arc.
- Display Arc USDC balance.
- Display curated apps.
- Display quest state.
- Generate transaction links.
- Read passport state.
- Initiate eligible Arc transactions.
- Provide the cross-chain entry path.

The frontend should **never contain private keys, verifier secrets, Circle entity secrets, or server credentials**.

---

## 5. Wallet layer

For MVP:

**Self-custodial EVM wallet → wagmi/viem → Arc**

Supported wallet UX can later be expanded using Circle's wallet tooling.

Important:

- Arc uses chain ID `5042`.
- Mainnet uses real USDC.
- Never silently switch networks.
- Always show the destination chain before a transaction.
- Display transaction hash immediately after submission.
- Link to a reliable Arc explorer.

---

## 6. Arc connection layer

Use viem/wagmi for:

- `eth_chainId`
- `eth_getBalance`
- ERC-20 `balanceOf`
- transaction submission
- receipt polling
- event logs
- contract reads/writes

Arc is EVM-compatible, so standard Solidity/EVM tooling is appropriate.

The current Circle developer material lists Foundry, Hardhat, viem and wagmi as compatible tooling.

---

## 7. USDC model

Arc has an important distinction:

- Arc's native gas representation is USDC with native-value semantics.
- The ERC-20 USDC interface uses its normal token decimals.
- Keep all application-level money values in a clear decimal/token representation.
- Never mix native gas units and ERC-20 USDC units in application code.

The current Arc builder material reports:

- Chain ID: `5042`
- USDC predeploy: `0x3600000000000000000000000000000000000000`
- ERC-20 USDC view: 6 decimals
- Native gas representation: 18 decimals

Centralize these constants in one chain configuration file.

---

## 8. Cross-chain onboarding

There are two distinct concepts:

### CCTP

Use when the product needs a native USDC transfer:

**Chain A → Arc**

CCTP burns native USDC on the source chain and mints native USDC on the destination.

### Gateway

Use when the desired UX is a unified USDC balance that can be accessed across supported chains.

Gateway's documented flow is:

1. Deposit USDC into a Gateway Wallet.
2. Sign a burn intent.
3. Gateway API returns an attestation.
4. Submit the attestation to Gateway Minter.
5. USDC becomes available on the destination flow.

Gateway is therefore more than a conventional bridge UI.

### MVP decision

Start with **Circle's supported bridge/App Kit path** for a simple onboarding flow.

Add Gateway only after the basic Arc onboarding loop works.

Do not build our own bridge.

---

## 9. Discovery registry

The discovery system should be a curated registry, not a scraper.

Suggested schema:

```text
App
- id
- name
- description
- category
- logo
- website
- arcUrl
- contractAddresses[]
- verified
- active
- questIds[]
- createdAt
- updatedAt
```

Categories:

- Payments
- Trading
- DeFi
- Infrastructure
- Wallets
- RWA
- AI / Agents
- Developer tools

Each listed application should have a verification status.

Never present an unverified contract address as official.

---

## 10. Quest architecture

The quest system has three layers.

### Layer A: Quest definition

Off-chain metadata:

```text
questId
name
description
category
targetContract
eventSignature
expectedAction
xp
badge
```

### Layer B: Verification

A backend/indexer checks whether the user's wallet actually completed the required action.

Examples:

- First Arc transaction
- Send USDC
- Interact with a specific contract
- Swap
- Deposit
- Complete a payment
- Use an Arc application

### Layer C: On-chain record

The verified completion is written to `ArcwayPassport`.

This avoids trusting the browser to tell us:

> "I completed the quest."

---

## 11. Passport contract

The MVP contract in `contracts/src/ArcwayPassport.sol` stores:

- XP
- completion count
- quest completion
- badges
- authorized verifier

The user does not need to pay for every read.

Writes happen only when a verified achievement is recorded.

### Why use a verifier?

A contract cannot automatically know that an external application interaction happened unless:

- the target application exposes a contract/event we can verify, or
- an oracle/attestation system provides proof.

Therefore:

**Index → verify → attest → write**

is the initial architecture.

---

## 12. Verifier security

The verifier is a privileged role.

Controls:

- Use a dedicated signer.
- Store the private key in a secret manager.
- Never place it in the frontend.
- Rate-limit verification.
- Make quest IDs unique.
- Prevent duplicate completions on-chain.
- Log every verification decision.
- Provide an emergency verifier rotation.
- Keep XP values controlled by trusted configuration.

For a later production version, use EIP-712 signed attestations rather than giving a backend hot wallet arbitrary XP-writing authority.

---

## 13. Better production design: EIP-712

Future flow:

```text
User transaction
      ↓
Arc event
      ↓
Indexer
      ↓
Quest verifier
      ↓
EIP-712 signed attestation
      ↓
User submits claim
      ↓
Passport verifies signature
      ↓
XP / badge recorded
```

Benefits:

- User can submit their own claim.
- Verifier does not need to broadcast every transaction.
- Better separation of authority.
- Easier scaling.
- Easier integration with multiple verifiers.

---

## 14. Indexing

For MVP, avoid building a full custom indexer immediately.

Start with:

- Arc RPC
- event filters
- explorer/API where appropriate
- small server-side verification jobs

As activity grows, move to a dedicated indexed event store.

Potential data model:

```text
transactions
- hash
- blockNumber
- from
- to
- value
- gasUsed
- timestamp

quest_events
- user
- questId
- txHash
- status
- verifiedAt

apps
- appId
- contract
- category
- verified

users
- wallet
- xp
- level
- firstSeen
```

---

## 15. Database

Recommended for MVP:

Postgres/Supabase or another managed Postgres.

Off-chain data:

- app descriptions
- logos
- categories
- quest metadata
- verification records
- cached activity
- analytics

On-chain data:

- XP
- quest completion
- badges
- ownership

Do not put bulky metadata on-chain.

---

## 16. Anti-Sybil considerations

Do not make XP directly redeemable for money in v0.1.

Otherwise users can immediately optimize for farming.

MVP should use:

- activity-based XP
- one-time quests
- wallet-level history
- duplicate prevention
- optional cooldowns
- meaningful actions rather than arbitrary transactions

Later:

- proof-of-personhood options
- account age
- transaction diversity
- capital/time-weighted reputation
- app diversity
- attestation systems

Avoid promising monetary rewards until the anti-Sybil model is strong.

---

## 17. Gas economics

Arc uses USDC for gas, which makes the UX easier to explain than a chain requiring a separate volatile gas token.

However, every on-chain write still has a real cost.

Minimize writes:

### Cheap / frequent

- RPC reads
- indexed data
- database reads
- cached quest status

### On-chain only when necessary

- Quest completion
- Badge award
- Passport state changes

Do not write:

- app descriptions
- quest descriptions
- UI preferences
- every page view
- every click
- every XP calculation

The current independent Arc explorer has recently displayed average transaction fees in the low-thousandths of a USDC range, but this is observational rather than an official fee guarantee and will vary with network conditions and transaction type.

For the grant MVP, the practical risk is more likely to be infrastructure/user-acquisition complexity than raw Arc gas expenditure.

---

## 18. Hosting

MVP:

- Frontend: Vercel/Cloudflare Pages
- API: Vercel functions or small Node service
- Database: Supabase/Postgres
- RPC: Arc public/mainnet RPC or an appropriate provider
- Secrets: deployment platform secret manager

Keep the architecture portable.

Do not lock the core product to one RPC/indexing vendor.

---

## 19. Analytics

Measure:

### Acquisition

- Unique visitors
- Wallet connections
- Source chain
- First Arc transaction

### Activation

- USDC successfully reached Arc
- First quest started
- First quest completed

### Ecosystem

- Apps opened
- Apps interacted with
- Unique Arc applications used
- Transactions generated through Arcway

### Retention

- 1-day return
- 7-day return
- quests completed per user

The most important metric is not page views.

It is:

> **How many users entered Arc and completed a meaningful Arc action?**

---

## 20. MVP scope

### Must have

- Wallet connection
- Arc network detection
- Arc USDC balance
- App discovery
- Quest UI
- Passport contract
- Basic verification service
- XP/badge display
- Transaction links

### Should have

- Cross-chain USDC onboarding
- App categories
- Activity history
- Shareable passport

### Later

- Gateway unified balance
- EIP-712 attestations
- Partner-created quests
- Leaderboards
- reputation levels
- social referrals
- AI recommendations
- agent-specific quests

---

## 21. Mainnet deployment plan

### Phase 1 — Local

- Install Foundry
- Run contract tests
- Run Next.js
- Configure Arc testnet

### Phase 2 — Testnet

- Deploy passport
- Configure verifier
- Complete test quests
- Verify events
- Test wallet/network switching
- Test failed transactions
- Test duplicate claims

### Phase 3 — Mainnet

Before deploying:

- Review contract
- Confirm chain ID
- Confirm USDC address
- Fund deployer with a small USDC amount
- Deploy
- Verify contract
- Configure verifier
- Run a real low-value transaction
- Confirm event indexing
- Set production environment variables

### Phase 4 — Grant submission

Submission should include:

- live Arc Mainnet URL
- public repository
- short project description
- builder profile
- explanation of Arc-native functionality

---

## 22. Security checklist

Before mainnet:

- [ ] No private keys in git
- [ ] No Circle secrets in git
- [ ] `.env.local` ignored
- [ ] Contract tests passing
- [ ] Reentrancy considered
- [ ] Access control tested
- [ ] Verifier rotation available
- [ ] Duplicate quests prevented
- [ ] Chain ID checked
- [ ] USDC address checked
- [ ] User confirms destination network
- [ ] Transaction errors handled
- [ ] RPC failures handled
- [ ] Explorer links verified
- [ ] Contract source verified
- [ ] Mainnet test uses tiny amounts

---

## 23. What makes this Arc-native

The project should not be described as:

> "A Web3 quest platform."

That is too generic.

The precise positioning is:

> **Arcway is an onboarding and activity layer for Arc that connects cross-chain USDC access with ecosystem discovery and verifiable on-chain progression.**

Arc is used for:

1. Settlement
2. Gas
3. User activity
4. Quest verification
5. Passport state
6. Ecosystem application interactions

That gives the microgrant reviewer a clear reason the product belongs on Arc.

---

## 24. Competitive differentiation

Do not compete directly with:

- generic launchpads
- generic NFT quest platforms
- generic block explorers
- generic ecosystem directories

Arcway sits between them.

```text
Bridge
  ↓
ONBOARD
  ↓
Arcway
  ├── Discover
  ├── Quest
  ├── Verify
  └── Passport
  ↓
Arc ecosystem apps
```

The product's job is to create a **user journey**, not just expose information.

---

## 25. Build order

### Sprint 1

- Repository
- Next.js shell
- wallet connection
- Arc chain config
- USDC balance
- app registry

### Sprint 2

- quest engine
- passport contract
- Foundry tests
- activity reader

### Sprint 3

- verifier
- XP
- badges
- passport UI

### Sprint 4

- cross-chain onboarding
- production polish
- mainnet deployment
- demo video
- grant submission

---

## 26. Definition of done

Arcway v0.1 is ready when:

1. A new user can connect a wallet.
2. The application recognizes Arc Mainnet.
3. The user can see their Arc USDC balance.
4. The user can discover at least 10 curated Arc applications.
5. At least 3 quests have verifiable completion logic.
6. A completed quest can update the passport.
7. XP is visible from on-chain state.
8. The application has a live Arc Mainnet deployment.
9. The public repo contains reproducible deployment instructions.
10. The entire demo can be completed in under five minutes.

---

## 27. Product north star

The long-term product should answer one question:

> **"I just arrived on Arc. What should I do next?"**

Everything else is secondary.
