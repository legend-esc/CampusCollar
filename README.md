# 🎓 CampusCollar

> **The student-to-student gig platform for university life — powered by Stellar.**

CampusCollar connects university students who need small, everyday fixes with fellow students or local handypeople who can get them done. Built on the Stellar blockchain, it uses smart escrow, NFC-based payment release, and campus-backed skill verification to create a trusted, hyperlocal marketplace tailored to campus life.

---

## 📖 Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Why Stellar](#why-stellar)
- [Target Users](#target-users)
- [Use Cases](#use-cases)
- [Monetization](#monetization)
- [Comparison: CampusCollar vs. BlueCollar](#comparison-campusollar-vs-bluecollar)
- [Project Structure](#project-structure)
- [Technical Architecture](#technical-architecture)
- [Smart Contract Overview](#smart-contract-overview)
- [NFC Payment Flow](#nfc-payment-flow)
- [Identity & Verification](#identity--verification)
- [Skill Badges & Reputation](#skill-badges--reputation)
- [Job Lifecycle](#job-lifecycle)
- [Security & Trust](#security--trust)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
campuscollar/
├── .github/
│   ├── workflows/            # CI/CD pipelines (test, lint, deploy)
│   └── ISSUE_TEMPLATE/       # Issue and PR templates
│
├── client/                   # Frontend — React PWA
│   ├── index.html            # HTML entry point
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Button, Input, Modal, Badge, etc.
│   │   │   ├── job/          # JobCard, JobForm, JobList
│   │   │   ├── profile/      # ProfileCard, BadgeDisplay, RatingStars
│   │   │   ├── payment/      # EscrowStatus, NFCTapButton, WalletBalance
│   │   │   └── chat/         # MessageBubble, ChatWindow
│   │   ├── pages/            # Route-level page components
│   │   │   ├── Home.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Wallet.tsx
│   │   │   ├── Badges.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useNFC.ts
│   │   │   ├── useStellar.ts
│   │   │   ├── useJobs.ts
│   │   │   └── useGeolocation.ts
│   │   ├── services/         # API client
│   │   │   └── api.ts        # GraphQL client
│   │   ├── store/            # Zustand state stores
│   │   │   ├── authStore.ts
│   │   │   ├── jobStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/            # TypeScript type definitions
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── index.css         # Tailwind directives
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                   # Backend — Node.js API
│   ├── src/
│   │   ├── graphql/          # GraphQL schema and resolvers
│   │   │   ├── schema/
│   │   │   │   ├── index.ts
│   │   │   │   ├── job.graphql
│   │   │   │   ├── user.graphql
│   │   │   │   ├── payment.graphql
│   │   │   │   └── badge.graphql
│   │   │   ├── resolvers/
│   │   │   │   ├── index.ts
│   │   │   │   ├── job.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── badge.ts
│   │   │   └── context.ts    # DataLoader factory
│   │   ├── rest/             # REST endpoints (auth, uploads, webhooks)
│   │   │   ├── auth.ts
│   │   │   ├── upload.ts
│   │   │   └── webhook.ts
│   │   ├── services/         # Business logic layer
│   │   │   ├── job.ts        # Job CRUD and status transitions
│   │   │   ├── badge.ts      # Badge issuance and verification
│   │   │   ├── payment.ts    # USDC handling, fee calc
│   │   │   ├── nfc.ts        # NFC challenge generation & validation
│   │   │   └── notification.ts
│   │   ├── middleware/       # Auth, rate-limiting, validation
│   │   │   ├── auth.ts
│   │   │   ├── rateLimit.ts
│   │   │   └── validate.ts
│   │   ├── stellar/          # Stellar/Soroban integration layer
│   │   │   └── utils.ts      # RPC helpers
│   │   ├── websocket/        # WebSocket handlers (chat, job status)
│   │   │   └── handler.ts
│   │   ├── jobs/             # Background workers (queues, cron)
│   │   │   ├── expiry.ts     # Expire unfunded jobs
│   │   │   └── dispute.ts    # Dispute timeout handler
│   │   ├── utils/
│   │   │   ├── db.ts         # Prisma client
│   │   │   ├── jwt.ts        # Token sign/verify
│   │   │   ├── logger.ts     # Pino logger
│   │   │   ├── format.ts     # Format helpers
│   │   │   └── constants.ts  # App constants
│   │   ├── types/
│   │   │   └── index.d.ts    # Type augmentations
│   │   ├── config.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── __tests__/            # Integration tests
│   │   ├── auth.test.ts
│   │   ├── job.test.ts
│   │   ├── payment.test.ts
│   │   └── websocket.test.ts
│   ├── vitest.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── contracts/                # Soroban smart contracts (Rust)
│   ├── escrow/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── contract.rs
│   │       └── test.rs
│   ├── badge-registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── contract.rs
│   │       └── test.rs
│   └── job-cap/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── contract.rs
│           └── test.rs
│
├── mobile/                   # Native mobile wrappers (optional)
│   ├── ios/                  # iOS NFC SDK bridge
│   └── android/              # Android NFC SDK bridge
│
├── docs/                     # Documentation
│   ├── architecture.md       # Detailed architecture decision records
│   ├── api.md                # Full API reference
│   ├── contracts.md          # Smart contract specification
│   ├── stellar-integration.md
│   ├── nfc-flow.md
│   ├── security.md
│   └── onboarding.md         # User onboarding flow
│
├── scripts/                  # DevOps, deployment, migration scripts
│   ├── deploy.sh
│   ├── migrate.sh
│   ├── seed.ts               # Database seeder
│   └── setup-testnet.sh
│
├── docker-compose.yml        # Local development environment
├── Dockerfile
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── LICENSE
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── README.md
└── package.json              # Root workspace config (npm workspaces)
```

---

## The Problem

University students face a unique set of challenges when something breaks:

- **No local network** — Freshmen and transfer students don't know "a guy" who can hang a TV, fix a squeaky door, or assemble IKEA furniture.
- **No car, no tools** — Most students live on campus without transportation or a toolkit.
- **Campus maintenance is slow** — Non-emergency work orders take weeks. A clogged sink or broken desk drawer becomes a semester-long annoyance.
- **Emergency service rates are absurd** — Plumbers and handypeople charge $100–$150 just to show up, plus hourly rates students can't afford.
- **Student poverty is real** — Many students need flexible, well-paying work between classes but lack a way to find it.

---

## The Solution

CampusCollar is a **hyperlocal, student-only gig platform** that keeps jobs small, payments secure, and trust anchored in the university itself.

| Pain Point | CampusCollar Solution |
|---|---|
| No local connections | Student-only marketplace restricted to `.edu` emails |
| Slow campus maintenance | Same-day or next-day help from peers |
| Emergency pricing | Jobs capped at **$150 max** |
| Payment risk | **USDC on Stellar** — held in escrow, released by NFC tap |
| Trust & quality | **Skill badges** verified by campus facilities staff |
| Student poverty | Workers earn **$40–$60/hr** in spare time between classes |

---

## How It Works

### For Students (Customers)

1. **Sign up** with your `.edu` email or campus ID.
2. **Post a job** — describe the issue (e.g., "unclog bathroom sink," "mount monitor arm"), set a price (≤$150), and pick a time.
3. **Fund escrow** — the job amount is locked in USDC on Stellar. You can fund with fiat (auto-converted) or USDC directly.
4. **A worker accepts** — a verified student or campus handyperson claims the job.
5. **Job gets done** — the worker completes the fix.
6. **Tap to release** — scan the job's NFC QR code with your phone. Payment is released instantly from escrow.

### For Workers

1. **Register** with `.edu` email and optionally link your campus ID for badge verification.
2. **Browse jobs** — filter by category, distance, pay, and time.
3. **Accept a job** — one tap to claim.
4. **Complete the work** — show up, fix it, take an "after" photo.
5. **Get paid** — when the customer taps the NFC QR code, USDC lands in your Stellar wallet instantly.
6. **Level up** — earn skill badges verified by campus facilities staff to unlock higher job caps.

---

## Key Features

### 🔐 Trusted Identity
- **`.edu` email restriction** — only current students, faculty, and staff can join.
- **Campus ID verification** — optional but rewarded with higher trust scores.
- **No anonymous accounts** — every user is tied to a verified university affiliation.

### 💸 Stellar-Powered Payments
- **USDC escrow** — funds are locked in a smart contract at job acceptance. Neither party can run.
- **NFC tap-to-release** — the customer taps their NFC-enabled phone to a dynamic QR code. Payment is released atomically.
- **Instant settlement** — Stellar settles in 3–5 seconds. No bank delays, no chargebacks.
- **Low fees** — fractions of a penny per transaction.
- **Fiat on-ramp** — users can deposit fiat via card or bank; it's auto-converted to USDC.

### 🏅 Verified Skill Badges
Badges are **earned, not bought**. Campus facilities staff (or approved tradespeople) verify real-world competence.

| Badge | Requirement | Benefit |
|---|---|---|
| 🛠️ **Handyperson** | Complete 5 jobs with 4.5★+ | Job cap raised to $200 |
| 🔧 **Technician** | Pass a practical test with campus IT/facilities | Access to electronics/TV mounting jobs |
| 💧 **Plumbing Apprentice** | Verified by campus plumber on 3 sink/tap fixes | Access to plumbing jobs |
| 🪚 **Furniture Pro** | 10 furniture assembly jobs completed | Priority job listing |
| ⭐ **Campus All-Star** | 50+ jobs, 4.8★+, 3 badges | $300 job cap, featured profile |

### 📍 Hyperlocal & Campus-Focused
- **Geofenced to campus** — jobs are within walking or biking distance.
- **On-campus only** — no off-campus strangers. Everyone belongs to the same university community.
- **Dorm-friendly** — jobs are small enough to be done in a dorm room or apartment.

### 📱 Mobile-First Experience
- **Progressive Web App (PWA)** — no app store needed. Works on any phone.
- **NFC integration** — native NFC tap for payment release on iOS and Android.
- **Push notifications** — job offers, messages, payment confirmations.
- **Offline mode** — browse cached jobs without internet.

---

## Why Stellar

CampusCollar is built on **Stellar** because it's the only blockchain that checks every box for this use case:

| Requirement | Stellar | Why |
|---|---|---|
| **Stablecoin payments** | ✅ USDC native on Stellar | No volatility. Students deal in real dollars. |
| **Fast settlement** | ✅ 3–5 seconds | Instant payment release on NFC tap. |
| **Low fees** | ✅ ~$0.00001 per tx | Micro-transactions are viable. |
| **Smart contracts** | ✅ Soroban | Escrow logic, badge verification, cap management. |
| **NFC-friendly** | ✅ Small tx payloads | Payment amounts fit in a QR/NFC data blob. |
| **Energy efficient** | ✅ Proof-of-agreement | Campus sustainability groups approve. |
| **Fiat on/off ramp** | ✅ Built-in anchors | Students deposit with card, withdraw to bank. |

---

## Target Users

### 🧑‍🎓 Students (Customers)
- Freshmen living on campus for the first time
- International students with no local family or contacts
- Grad students too busy to deal with maintenance
- Anyone whose dorm AC filter needs replacing

### 💼 Students (Workers)
- Work-study students looking for flexible hours
- International students who can't work off-campus due to visa restrictions (on-campus work is allowed)
- Trade-savvy students who enjoy fixing things
- Anyone wanting to earn $40–$60/hr between classes

### 👨‍🏫 Campus Staff
- Facilities managers who can recommend vetted students
- IT staff who need ad-hoc help with classroom tech
- Resident advisors (RAs) who field constant fix requests

---

## Use Cases

### 🛋️ Furniture Assembly
> "I ordered a desk from IKEA but the instructions might as well be in Klingon. I'll pay someone $40 to build it."

### 🔧 Dorm Repairs
> "The bathroom sink drains slower than molasses. Campus maintenance says '2–3 weeks.' I'll pay $35 to have it snaked tomorrow."

### 📺 TV / Monitor Mounting
> "I need my 32" monitor mounted on the wall. I have the arm but not the tools or the courage to drill into drywall. $60."

### 📱 Phone / Laptop Screen Repair
> "I dropped my phone and the screen is spider-webbed. Can anyone replace it for under $100?"

### 🚲 Bike Tune-Up
> "My bike chain keeps slipping and the tires are flat. $25 for a basic tune-up."

### 🧹 Deep Cleaning
> "My room has achieved 'biohazard' status after finals week. $50 for a deep clean."

### 🔌 IT / Smart Home Setup
> "Can someone help me set up my Wi-Fi mesh network? I'll pay $30."

---

## Monetization

CampusCollar is **free for students who need help**. Revenue comes from:

### 1. Worker Fee — 5%
- 5% is deducted from the worker's earnings on each completed job.
- A $50 job → worker receives $47.50.
- Justified by: payment processing, escrow security, dispute resolution, badge verification infrastructure.

### 2. University Partnership Fee
- Annual flat fee for the university to offer CampusCollar as a **white-label or co-branded service**.
- Includes: dedicated campus facilities badge verification, priority support, custom geofencing, analytics dashboard for student employment office.
- Tiered pricing:
  - **Small school (<5k students):** $5,000/yr
  - **Medium school (5k–20k):** $15,000/yr
  - **Large school (20k+):** $30,000/yr

### 3. Premium Badge Verification (Future)
- Expedited skill badge testing for a one-time $10 fee (optional — free verification slots remain available).

### 4. Featured Listings (Future)
- Workers can pay $1 to boost their profile for 24 hours.

### What's Always Free
- Posting a job
- Browsing and searching
- Messaging and communication
- Basic skill badges
- NFC payment release

---

## Comparison: CampusCollar vs. BlueCollar

| Dimension | CampusCollar | BlueCollar |
|---|---|---|
| **Scope** | Hyperlocal — single campus or university | City-wide or regional |
| **Users** | Students, faculty, campus staff | General public |
| **Max job value** | **$150** (small, quick fixes) | $500+ (larger projects) |
| **Verification** | `.edu` email + campus ID | Community reviews, background checks |
| **Trust anchor** | **The university itself** (institutional) | Community curation (organic) |
| **Payment** | **USDC escrow on Stellar**, NFC release | Traditional credit card / cash |
| **Settlement** | **Instant** (3–5 seconds) | 2–5 business days |
| **Worker incentives** | Skill badges → higher caps → more earnings | Ratings → more visibility |
| **Fees** | **Free for customers**, 5% from workers | 15–20% from workers or service fees |
| **Target problem** | Student poverty + slow campus maintenance | General home repair access |
| **Geofencing** | Campus boundaries + adjacent student housing | City neighborhoods |
| **Identity** | Real-name, university-tied | Pseudonymous possible |

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Mobile App (PWA)                       │
│  React + TypeScript  │  NFC Web API  │  Service Workers  │
└─────────────────┬────────────────────────────────────────┘
                  │ HTTPS / WebSocket
┌────────────────▼────────────────────────────────────────┐
│                   API Gateway (Node.js)                  │
│          Express / Fastify  │  GraphQL  │  WebSockets    │
└────────┬──────────┬──────────┬──────────┬───────────────┘
         │          │          │          │
┌────────▼──┐ ┌────▼────┐ ┌──▼───────┐ ┌▼───────────────┐
│ PostgreSQL│ │  Redis  │ │ Stellar  │ │ IPFS / Arweave  │
│ (users,   │ │ (cache, │ │ (USDC    │ │ (job photos,    │
│  jobs,    │ │  sessions│ │  escrow, │ │  dispute docs)  │
│  badges)  │ │ ,queue)  │ │  badges) │ │                 │
└───────────┘ └─────────┘ └──────────┘ └─────────────────┘
```

### Stack Components

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React + TypeScript (PWA) | Cross-platform mobile + web |
| **State** | TanStack Query + Zustand | Server state + client state |
| **API** | GraphQL (Apollo) + WebSockets | Real-time job updates, messaging |
| **Backend** | Node.js + Fastify | REST + GraphQL endpoints |
| **Database** | PostgreSQL + Redis | Relational data + caching |
| **Blockchain** | Stellar (Soroban smart contracts) | USDC escrow, badge registry |
| **Storage** | IPFS / Arweave | Decentralized job evidence |
| **Auth** | OAuth 2.0 + Stellar Keypair | Email verification + wallet |
| **NFC** | Web NFC API + QR fallback | Payment release trigger |

---

## Smart Contract Overview

CampusCollar uses **Soroban smart contracts** on Stellar for three core functions:

### 1. Escrow Contract
```rust
// Simplified interface — not production code
pub trait Escrow {
    // Customer creates a job and deposits USDC
    fn create_job(customer: Address, amount: i128, worker: Option<Address>);
    
    // Worker accepts the job
    fn accept_job(job_id: Bytes, worker: Address);
    
    // Customer confirms completion via NFC trigger
    fn release_payment(job_id: Bytes, nfc_challenge: Bytes);
    
    // Dispute — funds stay locked until resolution
    fn dispute(job_id: Bytes, party: Address);
    
    // Admin resolution after dispute
    fn resolve_dispute(job_id: Bytes, winner: Address);
}
```

### 2. Badge Registry Contract
```rust
pub trait BadgeRegistry {
    // Issue a badge after campus staff verification
    fn issue_badge(worker: Address, badge: BadgeType, verifier: Address);
    
    // Revoke badge (repeated complaints)
    fn revoke_badge(worker: Address, badge: BadgeType);
    
    // Check worker's job cap based on badges held
    fn get_job_cap(worker: Address) -> i128;
}
```

### 3. Job Cap Contract
```rust
pub trait JobCap {
    // Maximum allowed job amount for a worker
    fn max_job_amount(worker: Address) -> i128;
    
    // Automatically scales with badge tiers
    // Base: $100 | Handyperson: $200 | Campus All-Star: $300
}
```

---

## NFC Payment Flow

The NFC payment flow is the heart of CampusCollar's trust model:

```
  ┌──────────┐         ┌───────────┐         ┌──────────┐
  │ Customer │         │  Worker   │         │ Stellar  │
  │  Phone   │         │  Phone    │         │ Network  │
  └────┬─────┘         └─────┬─────┘         └────┬─────┘
       │                     │                     │
       │  1. Post job + fund escrow                │
       │──────────────────────────────────────────>│
       │                     │                     │
       │                     │  2. Accept job      │
       │                     │────────────────────>│
       │                     │                     │
       │                     │  3. Complete work   │
       │                     │ (in-person)         │
       │                     │                     │
       │  4. Tap phone to NFC QR code              │
       │──────────────────────────────────────────>│
       │                     │                     │
       │                     │  5. USDC released   │
       │                     │<────────────────────│
       │                     │                     │
       │  6. Confirmation    │                     │
       │<──────────────────────────────────────────│
```

- **Security**: Each job QR encodes a unique, single-use challenge signed by the customer's Stellar keypair.
- **Fallback**: If NFC fails (e.g., iPhone < XS), customers can enter a 6-digit code displayed on the worker's phone.
- **Offline**: The transaction is pre-signed and submitted when connectivity returns.

---

## Identity & Verification

### Tier 1 — Basic (Required)
- `.edu` email verification
- University name displayed on profile
- Can post and accept jobs up to **$100**

### Tier 2 — Verified (Optional, Recommended)
- Campus ID card photo (manually reviewed or AI-assisted)
- Real name verified against university directory
- Higher trust score → jobs are more visible to customers
- Job cap raised to **$150**

### Tier 3 — Badged (Earned)
- Skill-specific badges verified by campus facilities staff
- Unlock higher job caps and priority listing

---

## Skill Badges & Reputation

### Badge Levels

| Level | Badges Required | Job Cap | Perks |
|---|---|---|---|
| **Bronze** | 0 | $100 | Basic access |
| **Silver** | 1 | $200 | Priority job alerts |
| **Gold** | 3 | $250 | Featured profile |
| **Platinum** | 5+ | $300 | "Campus All-Star" badge, reduced fee (3%) |

### Verification Process
1. Worker requests a badge test in-app.
2. Campus facilities staff receives a notification.
3. A 15-minute practical test is scheduled (e.g., "unclog this sink," "mount this TV").
4. Staff marks pass/fail in the app. On pass, the badge is minted via the Badge Registry contract.
5. The worker's job cap is automatically updated.

### Reputation Scoring
- **Rating**: 1–5 stars per job (must be from the other party)
- **Completion rate**: % of accepted jobs completed
- **Response time**: median time to accept a job offer
- **Dispute ratio**: % of jobs that went to dispute
- **Badge count**: weighted by badge tier

---

## Job Lifecycle

```
POSTED ──► FUNDED ──► ACCEPTED ──► IN_PROGRESS ──► COMPLETED
  │           │           │              │
  │           │           │              ├──► DISPUTED ──► RESOLVED
  │           │           │              │
  │           │           │              └──► PAID
  │           │           │
  │           │           └──► CANCELLED (by worker)
  │           │
  │           └──► EXPIRED (refunded after 48h unfunded)
  │
  └──► CANCELLED (by customer before funding)
```

### States detailed:

1. **POSTED** — Customer creates the job. Visible to eligible workers.
2. **FUNDED** — Customer deposits USDC into escrow contract. Job appears in worker feeds.
3. **ACCEPTED** — A worker claims the job. Both parties see each other's profiles. Chat opens.
4. **IN_PROGRESS** — Worker has arrived and started. Customer can see live status.
5. **COMPLETED** — Work is done. Customer taps NFC to release payment.
6. **PAID** — USDC transferred to worker's wallet. 5% fee deducted.
7. **DISPUTED** — Either party flags an issue. Funds remain locked. Admin review.
8. **CANCELLED** — Before funding: immediate. After funding: full refund to customer. After acceptance: penalty logic applies.

---

## Security & Trust

### Payment Security
- **Escrow-first**: Funds are always locked in a Soroban smart contract before work begins.
- **No chargebacks**: USDC on Stellar is final. No credit card reversals.
- **Dispute fund**: 1% of each job fee goes to a pool that covers exceptional cases.

### Identity Security
- `.edu` email **+** optional campus ID verification
- Rate limiting on login attempts
- Suspicious account activity triggers manual review
- University partnership allows directory-based verification

### Data Privacy
- Minimal data collection: name, email, university, job history
- No sharing of personal data with third parties
- Job photos stored on IPFS (encrypted, permissioned access)
- GDPR and FERPA compliant

### Anti-Fraud Measures
- **New worker cap**: First 3 jobs capped at $50
- **Geolocation verification**: Worker must be on/near campus to accept jobs
- **Photo evidence**: "After" photo required for payment release
- **Rate limiting**: Max 3 jobs accepted per day per worker
- **Cooling period**: New accounts wait 24 hours before first job

---

## Roadmap

### Phase 1 — MVP
- [x] Concept validation
- [ ] `.edu` email authentication
- [ ] Job posting + browsing (React PWA)
- [ ] Basic USDC escrow on Stellar testnet
- [ ] Manual skill badge issuance
- [ ] NFC payment release (Web NFC API)
- [ ] Chat system (WebSockets)

### Phase 2 — Launch
- [ ] Stellar mainnet deployment
- [ ] Campus ID verification flow
- [ ] Fiat on-ramp (card → USDC)
- [ ] Push notifications
- [ ] Rating and review system
- [ ] Dispute resolution workflow
- [ ] First university partnership pilot

### Phase 3 — Growth
- [ ] Automated badge verification with campus facilities
- [ ] Worker analytics dashboard
- [ ] Referral program ($10 bonus per referral)
- [ ] Multi-campus support
- [ ] iOS/Android native NFC SDK
- [ ] Job scheduling / recurring jobs

### Phase 4 — Scale
- [ ] White-label platform for universities
- [ ] USDC withdrawal to bank accounts
- [ ] Advanced badge tiers (electrician, HVAC, etc.)
- [ ] Campus ambassador program
- [ ] Integration with campus work-study programs
- [ ] AI-powered job categorization and matching

---

## Contributing

We welcome contributions from the community — especially students!

### Getting Started

```bash
# Clone the repo
git clone https://github.com/campuscollar/campuscollar.git
cd campuscollar

# Install dependencies
npm install

# Start development
npm run dev
```

### How to Contribute

1. **Pick an issue** from the GitHub Issues tab, labeled `good-first-issue` or `help-wanted`.
2. **Fork** the repository and create a feature branch: `git checkout -b feat/my-feature`.
3. **Commit** your changes with clear, descriptive messages.
4. **Open a Pull Request** with a detailed description of your changes.
5. **Wait for review** — a maintainer will review within 48 hours.

### Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and constructive.

---

## License

CampusCollar is released under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 📬 Contact

- **Website**: [campuscollar.io](https://campuscollar.io) 
- **Email**: hello@campuscollar.io 
- **Twitter / X**: [@CampusCollar](https://x.com/CampusCollar)
- **Discord**: [Join our server](https://discord.gg/campuscollar)

---

*Built with ❤️ for students, by students. On Stellar.*
