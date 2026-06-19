# User Onboarding Flow

## Tier 1 — Basic (Required for all users)

1. Visit campuscollar.io → click **Get Started**
2. Enter `.edu` email, name, university, password
3. Check email for 6-digit OTP (valid 10 minutes)
4. Enter OTP → account created
5. A Stellar keypair is generated server-side and linked to your account
6. You can now post jobs (as customer) or accept jobs up to **$100** (as worker)

## Tier 2 — Verified (Optional, Recommended)

1. Go to **Profile → Verify Identity**
2. Upload a photo of your campus ID card
3. A staff member reviews within 24–48 hours
4. On approval: real name verified, trust score increased, job cap raised to **$150**

## Tier 3 — Badged (Earned Through Work)

1. Complete jobs and build your rating
2. Go to **Badges → Request Verification** for a specific skill
3. A campus facilities staff member receives a notification
4. A 15-minute practical test is scheduled (e.g., unclog a sink, mount a TV)
5. Staff marks pass/fail in the app
6. On pass: badge minted on-chain via Badge Registry contract, job cap updated automatically

## Badge Tiers

| Level    | Badges | Job Cap |
| -------- | ------ | ------- |
| Bronze   | 0      | $100    |
| Silver   | 1      | $200    |
| Gold     | 3      | $250    |
| Platinum | 5+     | $300    |

## Wallet Setup

1. Install **Freighter** browser extension (or use Albedo — no install needed)
2. Go to **Wallet** in the app → click **Connect Stellar Wallet**
3. Approve the connection in Freighter/Albedo
4. Your USDC balance appears automatically
5. Deposit fiat via **Deposit** (card → USDC via anchor, coming Phase 2)

## First Job (Customer)

1. **Jobs → Post a Job** — fill in title, description, category, budget (≤$150), location
2. Fund escrow — USDC is locked until the job is complete
3. A worker accepts — you see their profile and chat opens
4. Worker completes the job and takes an after photo
5. Tap **Release Payment** with your phone — NFC or 6-digit code
6. Leave a rating for the worker

## First Job (Worker)

1. **Jobs** — browse open jobs near you, filter by category and price
2. Tap a job → **Accept Job**
3. Show up, complete the work, take an after photo
4. Wait for the customer to tap to release
5. USDC lands in your Stellar wallet instantly (minus 5% fee)
6. Leave a rating for the customer
