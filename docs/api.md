# API Reference

## REST Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register with `.edu` email |
| POST | `/api/auth/verify-email` | — | Confirm OTP |
| POST | `/api/auth/login` | — | Get access + refresh tokens |
| POST | `/api/auth/refresh` | — | Rotate tokens |
| GET | `/api/auth/me` | Bearer | Current user profile |

### Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Bearer | Upload job photo (max 5 MB, image/jpeg or image/png) |

### Webhooks

| Method | Path | Description |
|---|---|---|
| POST | `/api/webhooks/stellar` | Stellar account event listener |
| POST | `/api/webhooks/ramp` | Fiat on-ramp callback |

### Stellar (proxy)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/stellar/balance/:pubkey` | — | Get USDC balance for a Stellar address |

---

## GraphQL

**Endpoint:** `POST /api/graphql`

**Playground:** `GET /api/graphql` (dev only)

### Queries

```graphql
me: User
user(id: ID!): User
jobs(filters: JobFilter): [Job!]!
job(id: ID!): Job
badges: [Badge!]!
```

### Mutations

```graphql
# Auth
updateMe(input: UpdateUserInput!): User!

# Jobs
createJob(title: String!, description: String!, category: String, amount: Float!, deadline: String): Job!
fundJob(id: ID!): Job!
acceptJob(id: ID!): Job!
completeJob(id: ID!): Job!
disputeJob(id: ID!, reason: String!): Job!
cancelJob(id: ID!): Job!

# Payments
releasePayment(jobId: ID!, nfcToken: String!): Payment!

# Badges
issueBadge(workerId: ID!, badgeType: String!): Badge!
revokeBadge(badgeId: ID!): Badge!
requestBadgeVerification(type: BadgeType!): Notification!

# Chat
sendMessage(jobId: ID!, content: String!): Message!
```

### Subscriptions

```graphql
jobStatusChanged(id: ID!): Job!   # Phase 2
newMessage(jobId: ID!): Message!  # Phase 2 (WebSocket for now)
```

### Types

```graphql
type User {
  id, email, name, university, role, stellarPubkey,
  trustScore, ratingAvg, completionRate, jobsPosted,
  jobsAccepted, badges, skills, createdAt
}

type Job {
  id, title, description, category, amount, status,
  location, deadline, customer, worker, payment,
  messages, dispute, createdAt, updatedAt
}

type Payment {
  id, jobId, amount, escrowAddr, status, nfcChallenge, releasedAt, createdAt
}

type Badge {
  id, name, type, issuer, issuedAt, revokedAt
}

type Message {
  id, content, sender, createdAt
}
```

### JobFilter Input

```graphql
input JobFilter {
  status: JobStatus
  category: String
  customerId: ID
  workerId: ID
}
```

---

## WebSocket

**URL:** `ws://<host>/ws?token=<jwt>&jobId=<id>`

### Events (server → client)

| Type | Payload | Description |
|---|---|---|
| `CONNECTED` | `{ jobId }` | Connection confirmed |
| `JOB_STATUS` | `{ jobId, status }` | Job state changed |
| `NEW_MESSAGE` | `Message` | New chat message |
| `TYPING` | `{ userId }` | User is typing |
| `TYPING_STOP` | `{ userId }` | User stopped typing |

### Events (client → server)

| Type | Payload | Description |
|---|---|---|
| `TYPING` | `{ jobId }` | Broadcast typing indicator |
| `PING` | — | Keepalive |
