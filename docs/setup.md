# Setup Guide

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- Rust + `wasm32-unknown-unknown` target (for contracts)
- Git

## Quick Start

```bash
# 1. Clone
git clone https://github.com/campuscollar/campuscollar.git
cd campuscollar

# 2. Environment
cp .env.example .env
# Edit .env — minimum required: JWT_SECRET (any random string for dev)

# 3. Start infrastructure
docker compose up -d postgres redis stellar-rpc

# 4. Install dependencies
npm install

# 5. Generate Prisma client and push schema
cd server && npx prisma generate && npx prisma db push && cd ..

# 6. Seed the database (optional)
cd server && npx tsx ../scripts/seed.ts && cd ..

# 7. Start dev servers
npm run dev
```

Open http://localhost:5173 — CampusCollar is running.

The GraphQL playground is at http://localhost:3001/api/graphql.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `STELLAR_RPC_URL` | ✅ | Stellar RPC endpoint |
| `STELLAR_NETWORK` | ✅ | `testnet` or `mainnet` |
| `ESCROW_CONTRACT_ID` | ✅ | Deployed escrow contract address |
| `BADGE_REGISTRY_CONTRACT_ID` | ✅ | Deployed badge registry address |
| `JOB_CAP_CONTRACT_ID` | ✅ | Deployed job cap contract address |
| `STELLAR_ENCRYPTION_KEY` | ✅ | 32-byte hex key for encrypting Stellar secrets |
| `PORT` | ❌ | Server port (default: 3001) |
| `CLIENT_URL` | ❌ | CORS origin (default: http://localhost:5173) |

## Running Tests

```bash
# Server integration tests (requires running Postgres + Redis)
npm test -w server

# Client type-check
npm run typecheck -w client

# Rust contract tests
cd contracts/escrow && cargo test
cd contracts/badge-registry && cargo test
cd contracts/job-cap && cargo test
```

## Deploying Contracts to Testnet

```bash
./scripts/setup-testnet.sh
```

This generates an admin keypair, funds it via Friendbot, and deploys all three contracts. Copy the output contract addresses into your `.env`.

## Docker (Full Stack)

```bash
docker compose up
```

All 5 services start: postgres, redis, stellar-rpc, server, client.

## Common Issues

**`prisma generate` fails** — run `npm install` in the `server/` directory first.

**Port 5432 already in use** — stop your local Postgres: `sudo systemctl stop postgresql`

**NFC not working** — NFC requires HTTPS and a physical device. Use the 6-digit fallback in dev.

**Stellar RPC slow to start** — `stellar/quickstart` takes ~30 seconds on first boot. The server retries the connection automatically.
