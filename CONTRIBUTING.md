# Contributing to CampusCollar

## Getting Started

```bash
git clone https://github.com/campuscollar/campuscollar.git
cd campuscollar
cp .env.example .env
docker compose up -d postgres redis
npm install
cd server && npx prisma generate && npx prisma db push && cd ..
npm run dev
```

Full setup instructions: [docs/setup.md](docs/setup.md)

## Repository Structure

```
client/     React PWA (Vite + TypeScript + Tailwind)
server/     Node.js API (Fastify + Apollo + Prisma)
contracts/  Soroban smart contracts (Rust)
docs/       Architecture, API reference, guides
scripts/    Deployment and migration scripts
mobile/     iOS and Android NFC bridge stubs
```

## How to Contribute

1. Check [Issues](https://github.com/campuscollar/campuscollar/issues) — look for `good-first-issue` or `help-wanted`
2. Fork the repo and create a branch: `git checkout -b feat/my-feature`
3. Make your changes following the conventions below
4. Run verification: `npm run typecheck && npm run lint && npm test -w server`
5. Open a Pull Request with a clear description of what changed and why

## Code Conventions

- **TypeScript** everywhere — no `any` unless unavoidable
- **Prettier** for formatting — `npm run lint` must pass
- **ESLint** — extends `@typescript-eslint/recommended`
- **Prisma** is the model layer — no raw SQL
- **Zod** for input validation in REST routes
- **No secrets in code** — use `.env` and never commit `.env`

## Commit Style

Use conventional commits:

```
feat: add dispute timeout auto-resolution
fix: correct escrow balance calculation
docs: update NFC flow diagram
test: add payment service unit tests
chore: bump prisma to 5.12
```

## Testing

- Server tests: `vitest` — run with `npm test -w server`
- Contract tests: `cargo test` in each `contracts/` subdirectory
- Tests must pass in CI before a PR can be merged

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, always deployable |
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, deps |

Do not push directly to `main`. Open a PR.

## Code of Conduct

All contributors must follow our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, inclusive, and constructive.
