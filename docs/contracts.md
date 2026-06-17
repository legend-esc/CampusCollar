# Smart Contract Specification

## Escrow Contract

**Location:** `contracts/escrow/`

### Interface

```rust
pub trait EscrowTrait {
    fn create_job(e: Env, customer: Address, amount: i128, deadline: u64);
    fn fund_job(e: Env, job_id: Bytes, from: Address);
    fn accept_job(e: Env, job_id: Bytes, worker: Address);
    fn release_payment(e: Env, job_id: Bytes, nfc_challenge: BytesN<32>);
    fn dispute(e: Env, job_id: Bytes, by: Address);
    fn resolve_dispute(e: Env, job_id: Bytes, winner: Address);
    fn cancel_job(e: Env, job_id: Bytes, by: Address);
    fn get_job(e: Env, job_id: Bytes) -> JobState;
}
```

### Storage

| Key | Type | Description |
|---|---|---|
| `Job(Bytes)` | `JobState` | Full job state struct |
| `NfcChallenge(Bytes)` | `BytesN<32>` | Single-use challenge per job |
| `EscrowBalance` | `i128` | Total USDC held in contract |

### State Machine

`POSTED → FUNDED → ACCEPTED → COMPLETED / DISPUTED → RESOLVED`

### Fee Logic

- 5% deducted from worker payout on `release_payment`
- 1% contributed to dispute reserve fund

---

## Badge Registry Contract

**Location:** `contracts/badge-registry/`

### Interface

```rust
pub trait BadgeRegistryTrait {
    fn issue_badge(e: Env, verifier: Address, worker: Address, badge: BadgeType);
    fn revoke_badge(e: Env, verifier: Address, worker: Address, badge: BadgeType);
    fn get_worker_badges(e: Env, worker: Address) -> Vec<BadgeType>;
    fn badge_issued(e: Env, worker: Address, badge: BadgeType) -> bool;
    fn add_verifier(e: Env, admin: Address, verifier: Address);
}
```

### Badge Types

`HANDYPERSON | TECHNICIAN | PLUMBING_APPRENTICE | FURNITURE_PRO | CAMPUS_ALL_STAR`

### Authorization

Only addresses in the `Verifiers` set (managed by admin) can call `issue_badge` or `revoke_badge`.

---

## Job Cap Contract

**Location:** `contracts/job-cap/`

### Interface

```rust
pub trait JobCapTrait {
    fn calculate_cap(e: Env, worker: Address, badge_registry: Address) -> i128;
}
```

### Cap Tiers

| Badges held | Max job amount (USDC) |
|---|---|
| 0 | 100 |
| 1 | 200 |
| 3 | 250 |
| 5+ | 300 |

The cap is enforced by the Escrow contract calling `JobCap.calculate_cap()` before accepting a `fund_job` call.
