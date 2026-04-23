# <lab-name>

Short training-only lab for whitebox auditing practice.

## Scenario
- <describe coherent business story>

## Scope
- auth/session flow
- one CRUD module
- one admin-only action
- one parser/import/webhook path
- one lightweight API endpoint

## Ports
- App: `<app-port>`
- Debug: `<debug-port>`

## Seeded Users
- `admin@lab.local` / `<password>` (admin)
- `user@lab.local` / `<password>` (user)

## Trace Map
1. Entry points: `<route files>`
2. Middleware/auth: `<auth file>`
3. Transformations/helpers: `<service file>`
4. Sinks: `<db/template/parser/exec sink>`

## Training Hooks
- `HOOK_ONE=false` -> safe path
- `HOOK_ONE=true` -> unsafe path

## Run
```bash
cp .env.example .env
docker compose up -d --build
# seed command
```

## Reset / Reseed
```bash
./scripts/reset.sh
./scripts/reseed.sh
```

## Debug Attach
- inspector/debug port: `<debug-port>`
- VS Code config: `.vscode/launch.json`

## First Breakpoints
- `<controller entry>`
- `<auth check>`
- `<helper/transform>`
- `<final sink>`
