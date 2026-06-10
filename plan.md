# CampusCollar — 11-Day Build Plan (55% Milestone)

> **Goal:** Skip straight to a working foundation. After these 11 days, the project has all scaffolding, core smart contracts, a running backend with database, a browsable frontend, and enough integration that a new contributor can pick any remaining issue and start shipping.
>
> **55% =** scaffolding 100% | schema 100% | contracts 80% | backend 60% | frontend 40% | tests 30% | docs 50%

---

## Day 1 — Monorepo & Tooling

**Output:** Root `package.json` (npm workspaces), `.gitignore`, `.env.example`, `.eslintrc.cjs`, `.prettierrc`, `tsconfig.base.json`, root `Dockerfile`, `docker-compose.yml`, `.github/` directory scaffold.

```bash
# Initialize root workspace
npm init -w
# Create workspace packages
mkdir -p client server contracts scripts mobile/ios mobile/android docs .github/workflows .github/ISSUE_TEMPLATE
```

**Key prompts:**

```
Root package.json with workspaces: ["client", "server"]
.eslintrc.cjs — shared TS config extending @typescript-eslint/recommended
.prettierrc — semi:true, singleQuote:true, tabWidth:2
tsconfig.base.json — strict mode, ES2022 target, paths for shared types
docker-compose.yml — services: postgres:15, redis:7, stellar-rpc (sdfio/stellar-core)
.env.example — DATABASE_URL, REDIS_URL, STELLAR_RPC_URL, JWT_SECRET, S3_ENDPOINT
.github/ISSUE_TEMPLATE/bug_report.md and feature_request.md
```

---

## Day 2 — Database Schema

**Output:** `server/prisma/schema.prisma`, `server/src/config.ts`, `server/src/utils/` (logger, format, constants), `scripts/seed.ts`.

**Prisma models:** `User`, `Job`, `Payment`, `Badge`, `BadgeType`, `Dispute`, `Message`, `Notification`, `UserSkill`.

```prisma
// core relationships:
// User 1—* Job (customerId, workerId optional)
// Job 1—1 Payment
// User *—* Badge (via UserBadge join)
// Job 0—* Message
// User 1—* Notification
// Job 0—1 Dispute
```

**Run:** `npx prisma generate && npx prisma db push` against local Postgres.

**Prompts:**

```
Prisma schema with all 9 models listed above, proper enums for JobStatus (POSTED, FUNDED, ACCEPTED, IN_PROGRESS, COMPLETED, PAID, DISPUTED, RESOLVED, CANCELLED, EXPIRED) and UserRole (STUDENT, STAFF, ADMIN)
config.ts that reads from env and exports typed config object
utils/logger.ts — pino or winston wrapper
utils/constants.ts — JOB_MAX_AMOUNT=150, WORKER_FEE=0.05, DISPUTE_FEE=0.01, JOB_EXPIRY_HOURS=48
Note: Prisma generates types that serve as the model layer (server/src/models/). No separate model files needed.
```

---

## Day 3 — Soroban Escrow Contract

**Output:** `contracts/escrow/` — full Rust project with `Cargo.toml`, `lib.rs`, `contract.rs`, `test.rs`.

**Contract interface:**

```rust
pub trait EscrowTrait {
    fn create_job(e: Env, customer: Address, amount: i128, deadline: u64);
    fn fund_job(e: Env, job_id: Bytes, from: Address);
    fn accept_job(e: Env, job_id: Bytes, worker: Address);
    fn release_payment(e: Env, job_id: Bytes, nfc_challenge: BytesN<32>);
    fn dispute(e: Env, job_id: Bytes, by: Address);
    fn resolve_dispute(e: Env, job_id: Bytes, winner: Address);
    fn cancel_job(e: Env, job_id: Bytes, by: Address);
    fn get_job(e: Env, job_id: Bytes) -> JobStatus;
}
```

**Storage:** `DataKey` enum — `Job(Bytes)`, `EscrowBalance`, `NfcChallenge(Bytes)`.

**Test coverage:** Happy path (create → fund → accept → release), dispute flow, expiry refund, double-accept rejection.

**Prompts:**

```
Cargo.toml with soroban-sdk dependency
lib.rs — module declarations and public interface
contract.rs — full EscrowContract impl with DataKey enum and storage helpers
test.rs — 8+ tests covering create, fund, accept, release, dispute, resolve, cancel, expiry
NFC challenge: SHA-256( job_id + customer_secret + counter ), stored on-chain, single-use
```

---

## Day 4 — Badge Registry & Job Cap Contracts

**Output:** `contracts/badge-registry/`, `contracts/job-cap/` — each with full Rust project + tests.

**Badge Registry:**

```rust
pub trait BadgeRegistryTrait {
    fn issue_badge(e: Env, verifier: Address, worker: Address, badge: BadgeType);
    fn revoke_badge(e: Env, verifier: Address, worker: Address, badge: BadgeType);
    fn get_worker_badges(e: Env, worker: Address) -> Vec<BadgeType>;
    fn badge_issued(e: Env, worker: Address, badge: BadgeType) -> bool;
}
```

**Job Cap:**

```rust
pub trait JobCapTrait {
    fn calculate_cap(e: Env, worker: Address, badge_registry: Address) -> i128;
    // Base: 100, 1 badge -> 200, 3 badges -> 250, 5+ badges -> 300
}
```

**Tests:** Issue + revoke flows, cap calculation at each tier, unauthorized verifier rejection.

---

## Day 5 — Backend Auth & Middleware

**Output:** `server/src/middleware/auth.ts`, `server/src/middleware/rateLimit.ts`, `server/src/middleware/validate.ts`, `server/src/rest/auth.ts`, `server/src/utils/jwt.ts`.

**Auth flow:** `.edu` email signup → verify email (OTP) → JWT issued → Stellar keypair generated and stored encrypted.

**Endpoints:**

```
POST /api/auth/signup       — register with .edu email
POST /api/auth/verify-email — confirm OTP
POST /api/auth/login        — get JWT
POST /api/auth/refresh      — rotate token
GET  /api/auth/me           — current user profile
```

**Middleware chain on all protected routes:** `auth → rateLimit → validate`.

**Prompts:**

```
jwt.ts — sign/verify using jsonwebtoken + RS256, 15min access + 7d refresh
auth.ts (middleware) — extract Bearer token, verify, attach user to request
rateLimit.ts — sliding window via Redis (30 req/min per user)
validate.ts — Zod schemas per route, return 422 on failure
auth.ts (rest) — full auth router with Prisma user upsert, Stellar keypair generation using stellar-sdk, email OTP via nodemailer (console-print in dev)
```

---

## Day 6 — GraphQL Schema & Core Resolvers

**Output:** `server/src/graphql/schema/` — `job.graphql`, `user.graphql`, `payment.graphql`, `badge.graphql`. `server/src/graphql/resolvers/` — `job.ts`, `user.ts`, `payment.ts`, `badge.ts`. `server/src/index.ts` (Apollo Server + Fastify).

**Schema highlights:**

```graphql
type User { id, email, name, university, role, trustScore, stellarPubkey,
            jobsPosted, jobsAccepted, badges, rating avg, completionRate }
type Job { id, title, description, category, amount, status, location,
           customer, worker, createdAt, messages, payment }
type Payment { id, jobId, amount, escrowAddr, status, nfcChallenge, releasedAt }
type Badge { id, name, type, issuer, issuedAt, revokedAt }

Query: { jobs(filters: JobFilter), job(id), me, user(id), badges }
Mutation: { createJob, fundJob, acceptJob, completeJob, releasePayment,
            disputeJob, cancelJob, issueBadge, revokeBadge }
Subscription: { jobStatusChanged, newMessage }
```

**Resolvers:** Prisma queries in `Query`, orchestrated service calls in `Mutation`. DataLoader for N+1 prevention.

**Prompts:**

```
Full GraphQL schema with all types, inputs, enums, queries, mutations, subscriptions
Resolvers that delegate to server/src/services/ (stubs for now, real logic coming Day 7)
Apollo Server 4 + Fastify integration in index.ts
DataLoader batching for User.jobs and Job.messages
```

---

## Day 7 — Business Logic Services

**Output:** `server/src/services/escrow.ts`, `server/src/services/payment.ts`, `server/src/services/nfc.ts`, `server/src/services/notification.ts`, `server/src/rest/webhook.ts`, `server/src/stellar/contracts/` (compiled bindings), `server/src/stellar/utils.ts`.

**Escrow service:** Orchestrates Stellar contract calls via `server/src/stellar/client.ts`. Creates, funds, releases, disputes.

**Payment service:** Handles USDC conversion (mock for dev), fee deduction, payout.

**NFC service:** Generates challenges, validates taps, manages nonce counter.

**Notification service:** In-app + email notifications on job status changes.

**Webhooks:** Stellar account listener, fiat on-ramp callback.

**Prompts:**

```
stellar/client.ts — Stellar RPC connection using stellar-sdk, sendTransaction, getAccountBalances, contract call helpers
stellar/utils.ts — keypair helpers, address validation, asset amount conversion
stellar/contracts/escrow.ts — typed TS bindings for Escrow contract (mirrors Rust trait)
stellar/contracts/badgeRegistry.ts — typed TS bindings for BadgeRegistry contract
stellar/contracts/jobCap.ts — typed TS bindings for JobCap contract
escrow.ts — createJobEscrow, fundEscrow, releaseEscrow, disputeEscrow, cancelEscrow — each calls Soroban contract via client.ts + updates DB
payment.ts — calculateFees, releaseToWorker, refundCustomer, recordTransaction
nfc.ts — generateChallenge(jobId, customerSecret), verifyTap(jobId, challenge) — uses crypto.createHmac
notification.ts — notifyUser(userId, type, payload) — creates Notification row + (optionally) sends email
webhook.ts — Stellar payment listener route (POST /api/webhooks/stellar), fiat ramp callback (POST /api/webhooks/ramp)
```

---

## Day 8 — WebSockets, Background Jobs, Remaining Services

**Output:** `server/src/websocket/handler.ts`, `server/src/jobs/expiry.ts`, `server/src/jobs/dispute.ts`, `server/src/services/badge.ts`, `server/src/rest/upload.ts`.

**WebSocket handler:** Room-based (per job), `CONNECTION`, `JOB_STATUS`, `NEW_MESSAGE`, `TYPING` events. Auth via JWT in connection params.

**Background jobs:** Bull/BullMQ queues with Redis. `expiry` — runs every 15min, expires unfunded jobs older than 48h. `dispute` — auto-resolves after 7d if no admin action.

**Badge service:** Issue/revoke orchestration, cap recalculation, notification to verified staff.

**Upload service:** Multer → IPFS/Arweave mock (local disk in dev), job photo evidence.

**Prompts:**

```
websocket/handler.ts — fastify-websocket or ws integration, rooms by jobId, typed event emitter
jobs/expiry.ts — BullMQ worker: query jobs.POSTED older than 48h, transition to EXPIRED, refund customers
jobs/dispute.ts — BullMQ worker: query jobs.DISPUTED older than 7d with no admin intervention, split escrow 50/50
badge.ts — issueBadge -> call BadgeRegistry contract -> recalculate job cap -> notify; revokeBadge similar
upload.ts — POST /api/upload — multipart, validate image type/size (max 5MB), store to disk in dev, return URL
```

---

## Day 9 — Frontend Scaffold & Auth Pages

**Output:** `client/` — Vite + React + TypeScript + Tailwind setup. Pages: `Home`, `Login`, `Signup`, core components: `Button`, `Input`, `Modal`, `Badge`, `Navbar`, `ProtectedRoute`.

**Tooling:** `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`.

**State management:** Zustand stores (`authStore.ts`, `uiStore.ts`), TanStack Query for server state.

**Routing:** React Router v6 — `/` (Home), `/login`, `/signup`, `/jobs`, `/job/:id`, `/profile`, `/wallet`, `/badges`, `/settings`.

**Prompts:**

```
vite.config.ts — react plugin, PWA plugin (vite-plugin-pwa), path aliases
tailwind.config.js — content paths, theme extensions (campus colors)
index.tsx — StrictMode, BrowserRouter, QueryClientProvider, App
App.tsx — layout routes with Navbar + Footer, protected route wrapper
authStore.ts — login, signup, logout, refreshToken, isAuthenticated
pages/Home.tsx — hero section + feature cards (static for now)
pages/Login.tsx — email + password form, calls authStore.login
pages/Signup.tsx — .edu email + password + name form, calls authStore.signup
components/common/Button.tsx — variant (primary/secondary/ghost), size, loading state
components/common/Input.tsx — label, error, icon support
components/common/Modal.tsx — portal-based, overlay, close on escape
components/common/Badge.tsx — small/large, color by badge tier
Navbar.tsx — responsive, mobile hamburger, user avatar dropdown
ProtectedRoute.tsx — redirect to /login if !isAuthenticated
```

---

## Day 10 — Job, Profile, Wallet & Badge Pages

**Output:** Full page implementations + data-fetching hooks + remaining components.

**Pages:** `Jobs.tsx` (browse + filter), `JobDetail.tsx` (view + accept + chat), `Profile.tsx` (edit + stats), `Wallet.tsx` (balance + transactions), `Badges.tsx` (grid + claim), `Settings.tsx` (preferences, notifications toggle).

**Hooks:** `useJobs(filters)`, `useJob(id)`, `useStellar()`, `useNFC()`, `useGeolocation()`.

**Components:** `JobCard`, `JobForm`, `JobList`, `ProfileCard`, `BadgeDisplay`, `RatingStars`, `EscrowStatus`, `NFCTapButton`, `WalletBalance`, `MessageBubble`, `ChatWindow`.

**Prompts:**

```
jobStore.ts — Zustand store for current job filters, pagination state, selected job
useJobs.ts — TanStack Query useQuery with filter params, staleTime: 30s
useJob.ts — useQuery for single job, useMutation for accept/complete/cancel/dispute
useStellar.ts — connect wallet (Albedo or Freighter), get balance, sign tx
useNFC.ts — Web NFC API wrapper, read/write NDEF, fallback to QR code modal
useGeolocation.ts — navigator.geolocation wrapper, watchPosition, campus polygon check
pages/Jobs.tsx — JobList + filter sidebar (category, price range, status, distance)
pages/JobDetail.tsx — full job view, escrow status bar, NFC tap button, ChatWindow inline
pages/Profile.tsx — user info, rating, badge grid, edit button, completed jobs list
pages/Wallet.tsx — Stellar balance, transaction history table, deposit/withdraw buttons (placeholder)
pages/Badges.tsx — badge grid grouped by tier, "Request Verification" button per badge type
pages/Settings.tsx — notification preferences, privacy toggles, account deletion
components/job/JobCard.tsx — title, price, category, distance, status chip, time ago
components/job/JobForm.tsx — create/edit job form with category select, amount slider, location picker
components/profile/ProfileCard.tsx — avatar, name, university, trust score, rating stars
components/payment/NFCTapButton.tsx — tap-to-pay button, NFC availability check, fallback code input
components/chat/ChatWindow.tsx — message list + input, WebSocket connection, typing indicator
```

---

## Day 11 — Tests, CI/CD, Docker Compose, Docs

**Output:** Integration tests (backend + contracts), Docker Compose full stack, CI workflows, documentation stubs.

### Tests

```
server/__tests__/auth.test.ts     — signup → verify → login → refresh → me
server/__tests__/job.test.ts      — CRUD lifecycle via GraphQL
server/__tests__/payment.test.ts  — escrow fund → release → fee deduction
server/__tests__/websocket.test.ts — connect, join room, send message
contracts/escrow/src/test.rs       — already written Day 3
contracts/badge-registry/src/test.rs
contracts/job-cap/src/test.rs
```

### CI/CD (`.github/workflows/`)

```yaml
# test.yml — runs on PR and push to main
#   - client: npm ci, npm run lint, npm run typecheck, npm test
#   - server: npm ci, npx prisma generate, npm test
#   - contracts: cargo test for each contract
# lint.yml — ESLint + Prettier check
# docker.yml — builds and pushes Docker image
```

### Mobile Scaffold

```
mobile/ios/README.md    — iOS NFC SDK bridge setup (stub)
mobile/android/README.md — Android NFC SDK bridge setup (stub)
```

### Docs

```
docs/architecture.md       — ADR for key decisions
docs/api.md                — GraphQL schema reference (auto-generated)
docs/contracts.md           — Smart contract interfaces
docs/stellar-integration.md — Stellar/Soroban setup guide
docs/nfc-flow.md           — NFC payment flow deep-dive
docs/security.md            — Security model, escrow guarantees, data privacy, anti-fraud measures
docs/onboarding.md          — User onboarding flow (Tier 1/2/3 verification)
docs/setup.md              — "From zero to running" guide
scripts/deploy.sh           — Deployment script for Stellar mainnet
scripts/migrate.sh          — Prisma migration runner
scripts/setup-testnet.sh    — Testnet account funding and contract deployment
scripts/seed.ts             — Database seeder with sample jobs and users
CONTRIBUTING.md            — Updated with this plan's structure, code of conduct reference
```

### Final Verification

```bash
npm run dev          # starts postgres + redis + stellar + server + client
npm run test         # all passing
npm run lint         # clean
npm run typecheck    # clean
```

**Prompts:**

```
jest.config.ts for server with ts-jest, testEnvironment: node
.github/workflows/test.yml — matrix build (client, server, contracts)
docker-compose.yml — all 5 services with depends_on, healthcheck, env_file
docs/setup.md — step-by-step: prerequisites, clone, docker compose up, npm run dev, visit localhost:5173
```

---

## 55% Completion — What's Built vs. What's Left

### ✅ Built (55%)
| Area | % | Details |
|------|---|---------|
| Scaffolding | 100% | Monorepo, tsconfig, eslint, prettier, docker-compose |
| Database | 100% | Full Prisma schema, migrations, seed script |
| Smart Contracts | 80% | Escrow (full), Badge Registry (full), Job Cap (full) — all tested |
| Backend Auth | 100% | Signup/Login/Verify, JWT, middleware, rate-limit |
| Backend API | 60% | All GraphQL types + resolvers + services, WebSockets, background jobs |
| Frontend Scaffold | 100% | Vite, Tailwind, routing, auth pages, core UI components |
| Frontend Pages | 30% | Home, Login, Signup, Jobs, JobDetail, Profile, Wallet, Badges — wired but minimal polish |
| Frontend Hooks | 40% | useJobs, useJob, useStellar, useNFC, useGeolocation — implemented |
| Tests | 30% | Contract tests (full), server integration tests (skeleton), no client tests |
| CI/CD | 80% | GitHub Actions workflows, Docker build |
| Documentation | 50% | Architecture, API, contracts, NFC flow, setup guide |

### 🔄 Remaining (45%)
| Area | Details |
|------|---------|
| Smart Contracts | Fuzz testing, mainnet deployment scripts, upgrade mechanism |
| Backend | Admin dashboard endpoints, analytics, advanced dispute automation, fiat ramp integration |
| Frontend | Polish (animations, loading skeletons, error boundaries), push notifications, offline mode, responsive edge cases |
| Mobile | iOS/Android native NFC SDK bridges |
| Features | Referral program, featured listings, university partnership portal, white-label config |
| Testing | E2E tests (Playwright/Cypress), fuzz contracts, load tests |
| DevOps | Terraform/Pulumi infra-as-code, staging environment, monitoring (Datadog/Grafana) |
| Docs | Video walkthroughs, API reference (auto-generated), security audit report |

---

## Quick Start After Day 11

```bash
git clone https://github.com/campuscollar/campuscollar.git
cd campuscollar
cp .env.example .env
docker compose up -d          # postgres, redis, stellar-rpc
npm install && npx prisma generate && npm run dev    # server + client
open http://localhost:5173     # CampusCollar is running
```

---

*This plan is a living document. Adjust scope per day based on velocity. The goal is a shippable foundation, not perfection.*
