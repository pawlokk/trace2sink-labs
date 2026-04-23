# trace2sink-labs

Educational whitebox vulnerability labs for OSWE-style practice.

## Purpose
- Build small, auditable vulnerable apps.
- Practice source -> transformation -> sink tracing.
- Train exploit-chain thinking and deterministic scripting.
- Re-run labs quickly with stable reset/reseed/debug workflows.

## Repository Layout
- `labs/` - reusable scaffolding and future shared lab assets
- `docs/` - methodology and OSWE prep planning
- `<lab-name>/` - standalone lab directories (each with its own README and runtime instructions)

## Principles
- Keep labs intentionally small.
- Prefer readability over abstraction.
- Keep one clear scenario per lab.
- Include explicit safe/unsafe training hooks.
- Avoid unnecessary infra overhead.

## Standard Lab Contract
Each lab should provide:
- `README.md` with scenario, ports, trace map, hooks, and breakpoints
- `.env.example`
- `Dockerfile` + `docker-compose.yml`
- `.vscode/launch.json` for debugger attach
- `scripts/reset.sh`, `scripts/reseed.sh`, `scripts/logs.sh`
- optional `scripts/deploy.sh` for remote host flow

## Workflow (Any Lab)
1. `cd <lab-name>`
2. `cp .env.example .env`
3. `docker compose up -d --build`
4. run lab-specific seed step
5. attach debugger
6. trace, audit, exploit, reseed, repeat

## Methodology and Prep
- `docs/whitebox-methodology.md`
- `docs/oswe-prep-plan.md`
- `CONTRIBUTING.md`

## Notes
- Training-only repository.
- Not intended for production deployment.
