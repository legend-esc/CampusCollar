# Stellar Integration Guide

## Overview

CampusCollar uses Stellar for:

- **USDC escrow** — locked in a Soroban smart contract at job acceptance
- **Instant settlement** — 3–5 second finality on payment release
- **Badge registry** — on-chain record of verified skills
- **Job cap enforcement** — contract-level cap based on badge tier

## Network Configuration

| Environment | Network                      | RPC URL                               |
| ----------- | ---------------------------- | ------------------------------------- |
| Development | Local (`stellar/quickstart`) | `http://localhost:8000`               |
| Staging     | Testnet                      | `https://soroban-testnet.stellar.org` |
| Production  | Mainnet                      | `https://soroban.stellar.org`         |

Set `STELLAR_RPC_URL` and `STELLAR_NETWORK` in `.env`.

## Account Setup

Each user gets a Stellar keypair generated at signup:

```typescript
import { Keypair } from '@stellar/stellar-sdk';
const keypair = Keypair.random();
// keypair.publicKey() stored in DB
// keypair.secret() encrypted and stored server-side
```

For production, the secret key is encrypted with AES-256 using `STELLAR_ENCRYPTION_KEY` from env.

## Wallet Connection (Frontend)

The frontend supports two wallets:

- **Freighter** — browser extension, `window.freighter`
- **Albedo** — web-based, `window.albedo`

See `client/src/hooks/useStellar.ts` for the connection flow.

## Contract Addresses

After deployment (see `scripts/deploy.sh`), set in `.env`:

```
ESCROW_CONTRACT_ID=C...
BADGE_REGISTRY_CONTRACT_ID=C...
JOB_CAP_CONTRACT_ID=C...
```

## Fiat On-Ramp

Users deposit fiat via a Stellar anchor (e.g., Circle, Bitso). The anchor converts fiat → USDC and deposits to the user's Stellar account. This is integrated via the `/api/webhooks/ramp` endpoint.

## Transaction Flow

1. Customer calls `escrow.fund_job(jobId, amount)` — USDC locked
2. Worker calls `escrow.accept_job(jobId)` — job starts
3. Customer taps NFC → backend calls `escrow.release_payment(jobId, challenge)` — USDC released to worker minus 5% fee
4. Fee goes to platform treasury address (`STELLAR_TREASURY_ADDRESS` in env)

## Testnet Setup

```bash
./scripts/setup-testnet.sh
```

This generates a keypair, funds it via Friendbot, and deploys all three contracts.
