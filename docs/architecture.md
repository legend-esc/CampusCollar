# Architecture Decision Records

## ADR-001 — Stellar as the payment layer

**Status:** Accepted

**Context:** CampusCollar needs stablecoin payments with instant settlement, low fees, and smart contract support for escrow.

**Decision:** Use Stellar + USDC. Soroban handles escrow and badge registry logic on-chain.

**Consequences:** Users need a Stellar wallet (Freighter or Albedo). Fiat on-ramp requires a third-party anchor. No EVM compatibility.

---

## ADR-002 — Soroban for smart contracts

**Status:** Accepted

**Context:** Need programmable escrow that holds USDC until NFC confirmation, and a badge registry that updates job caps.

**Decision:** Three contracts: `escrow`, `badge-registry`, `job-cap`. Rust + Soroban SDK.

**Consequences:** Rust expertise required for contract changes. Deploy/upgrade cycle slower than off-chain logic.

---

## ADR-003 — GraphQL + WebSockets for the API

**Status:** Accepted

**Context:** Frontend needs real-time job status updates and chat. A REST-only API would require polling.

**Decision:** Apollo Server 4 over Fastify for GraphQL. `@fastify/websocket` for chat and live job events. DataLoader prevents N+1 queries.

**Consequences:** Apollo adds ~30 MB to the server bundle. Subscriptions are deferred to Phase 2 (replaced by WebSocket events for now).

---

## ADR-004 — PWA over native app for MVP

**Status:** Accepted

**Context:** Students don't want to install an app for a service they may use once a semester. NFC Web API covers modern iOS (Safari 17+) and Android Chrome.

**Decision:** Vite + React PWA. Native iOS/Android wrappers are optional bridges in `mobile/`.

**Consequences:** Web NFC API is not available in all browsers. 6-digit fallback code handles unsupported devices.

---

## ADR-005 — `.edu` email as the trust anchor

**Status:** Accepted

**Context:** CampusCollar needs to restrict membership to verified university affiliates without building an identity system from scratch.

**Decision:** Require `.edu` email at signup. Optional campus ID photo for Tier 2 verification.

**Consequences:** Some legitimate universities use non-.edu domains (especially outside the US). Configurable per-campus domain allowlist is a Phase 3 item.

---

## ADR-006 — PostgreSQL + Prisma for the database

**Status:** Accepted

**Context:** Relational data (users, jobs, payments, badges) with well-defined foreign keys. Need a type-safe ORM.

**Decision:** PostgreSQL 15 + Prisma ORM. Prisma generates TypeScript types that serve as the model layer.

**Consequences:** No separate model files needed. Schema changes require `prisma migrate dev`.

---

## ADR-007 — BullMQ for background jobs

**Status:** Accepted

**Context:** Job expiry (48h unfunded) and dispute auto-resolution (7d) need to run independently of the HTTP request cycle.

**Decision:** BullMQ backed by Redis. Two workers: `expiry` and `dispute`.

**Consequences:** Redis is a hard dependency. Workers must be co-deployed with the server.
