# Security Model

## Payment Security

**Escrow-first.** USDC is locked in a Soroban contract before any work begins. Neither party can access the funds unilaterally during the job.

**No chargebacks.** USDC on Stellar is final. Credit card reversals are not possible. Disputes are handled by the on-chain dispute mechanism with admin arbitration.

**Dispute reserve.** 1% of each job fee goes to a reserve pool that covers exceptional cases where the platform must compensate either party.

**NFC challenge is single-use.** Each release challenge is tied to a nonce stored on-chain. Once used, it cannot be replayed.

## Identity Security

- `.edu` email required at signup — verified via 6-digit OTP (10-minute TTL)
- Optional campus ID photo for Tier 2 verification (manual review or AI-assisted)
- JWT access tokens expire in 15 minutes; refresh tokens in 7 days
- RS256 signing (asymmetric) — public key can be distributed to services
- Rate limiting: 30 requests/minute per user via Redis sliding window

## Anti-Fraud Measures

| Measure                  | Details                                       |
| ------------------------ | --------------------------------------------- |
| New worker cap           | First 3 jobs capped at $50                    |
| Geolocation check        | Worker must be on/near campus to accept jobs  |
| Photo evidence           | "After" photo required before payment release |
| Rate limiting            | Max 3 job accepts per day per worker          |
| Cooling period           | New accounts wait 24 hours before first job   |
| Dispute ratio monitoring | High dispute ratio triggers manual review     |

## Data Privacy

- Minimal collection: name, email, university, job history, Stellar pubkey
- No third-party data sharing
- Job photos stored on IPFS — encrypted, permissioned access via signed URLs
- Stellar secret keys encrypted at rest with AES-256 (`STELLAR_ENCRYPTION_KEY`)
- GDPR compliant: users can request deletion via Settings → Delete Account
- FERPA compliant: no academic record data is collected or stored

## Stellar Secret Key Handling

Server-side keypairs are encrypted before database storage:

```typescript
import { createCipheriv, randomBytes } from 'crypto';
// AES-256-GCM encryption
// Key = process.env.STELLAR_ENCRYPTION_KEY (32 bytes, hex)
// IV = random 12 bytes, stored alongside ciphertext
```

The plaintext secret key is never logged or returned in API responses.

## Dependency Security

- All npm dependencies are pinned to exact versions in `package-lock.json`
- `npm audit` runs in CI on every push
- Rust dependencies locked via `Cargo.lock`
- Docker images use specific digest tags in production
