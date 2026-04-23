# trace2sink-labs

Educational whitebox vulnerability labs for OSWE-style practice.

## Scope
- Small intentionally vulnerable apps.
- Focus on source -> transformation -> sink tracing.
- Fast local/remote reset and repeatable debugging.
- Training-only environment (not production deployment).

## Current Labs
- `node-order-portal` (Node.js/Express + MongoDB)
- `php-wiki` (existing local lab)

## Standard Workflow
1. Open a lab directory (recommended) or open this monorepo root.
2. Copy env template: `cp .env.example .env`.
3. Start lab: `docker compose up -d --build`.
4. Seed data: `docker compose exec app node scripts/seed.js`.
5. Attach debugger (port depends on lab docs).
6. Reseed/reset between attempts.

## Node Order Portal Quickstart
```bash
cd node-order-portal
cp .env.example .env
docker compose up -d --build
docker compose exec app node scripts/seed.js
curl http://localhost:3002/health
```

## Debug Quickstart (Node Order Portal)
1. Keep app running with inspector (`9229` exposed in compose).
2. If remote host is used, open tunnel:
```bash
ssh -L 9229:127.0.0.1:9229 pawlok@192.168.18.126
```
3. In VS Code run one of:
- `Attach Node (node-order-portal from app-builds root)`
- `Attach Node (node-order-portal direct folder)`

## Repo Hygiene
- `.env` is ignored globally from this root.
- `node_modules` and logs are ignored globally.
- Keep vulnerable patterns explicit and documented in each lab README.

## Methodology and Prep
- `docs/whitebox-methodology.md`
- `docs/oswe-prep-plan.md`
