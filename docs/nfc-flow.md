# NFC Payment Flow

The NFC tap is the moment of truth in CampusCollar. It physically co-locates the customer and worker at job completion and atomically releases escrow.

## Flow

```
Customer phone                Backend                  Stellar
     │                           │                        │
     │  1. POST /job (fund)       │                        │
     │──────────────────────────>│                        │
     │                           │  2. createJobEscrow()  │
     │                           │───────────────────────>│
     │                           │  3. escrowAddr stored  │
     │                           │<───────────────────────│
     │                           │                        │
     │  [worker completes job]   │                        │
     │                           │                        │
     │  4. NFCTapButton reads    │                        │
     │     NDEF record           │                        │
     │  5. POST /job/:id/release │                        │
     │     { challenge }         │                        │
     │──────────────────────────>│                        │
     │                           │  6. verifyChallenge()  │
     │                           │  7. releaseEscrow()    │
     │                           │───────────────────────>│
     │                           │  8. USDC → worker      │
     │                           │<───────────────────────│
     │  9. 200 OK + confirmation │                        │
     │<──────────────────────────│                        │
```

## Challenge Generation

Each job gets a single-use HMAC challenge:

```
challenge = HMAC-SHA256(key=customerSecret, data=jobId + ":" + nonce)
```

- `customerSecret` — derived from the customer's Stellar keypair (never leaves the server)
- `nonce` — incremented on each use, stored on-chain to prevent replay

The challenge is encoded as a UTF-8 NDEF Text record and written to the job's dynamic QR/NFC tag by the backend when the job is accepted.

## Fallback: 6-Digit Code

When `NDEFReader` is unavailable (unsupported browser, older iPhone):

1. Backend generates a 6-digit numeric code = `challenge.slice(0, 6)` (hex → decimal modulo).
2. Worker displays the code on their screen.
3. Customer types it into the fallback input in the PWA.
4. Backend validates using the same HMAC, accepts if within 10-minute window.

## Security Properties

| Property      | Guarantee                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Single-use    | Nonce incremented on-chain after each valid release                        |
| Replay-proof  | Old challenges rejected by on-chain nonce check                            |
| Co-location   | Customer must physically tap the worker's NFC tag                          |
| Escrow-atomic | USDC transfer and challenge invalidation happen in one Soroban transaction |
| Offline-safe  | Pre-signed transaction submitted when connectivity returns                 |
