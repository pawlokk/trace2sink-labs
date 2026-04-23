# Contributing to trace2sink-labs

## Goal
Keep labs small, readable, and high-value for whitebox auditing practice.

## Lab Rules
- One coherent scenario per lab.
- Minimal feature set only.
- Clear source -> transformation -> sink trace points.
- Keep explicit safe/unsafe training hooks.
- No CI/CD or enterprise overhead unless explicitly required.

## Required Files Per Lab
- `README.md`
- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- `.vscode/launch.json`
- `scripts/reset.sh`
- `scripts/reseed.sh`
- `scripts/logs.sh`
- optional: `scripts/deploy.sh` for remote lab host

## README Must Include
- scenario and scope
- ports (app/debug)
- seeded users/roles
- trace map (entry -> helper/service -> sink)
- training hooks (safe vs unsafe)
- reset/reseed/deploy/debug steps
- suggested first breakpoints

## Security + Hygiene
- Never commit real credentials/secrets.
- Keep `.env` local; commit only `.env.example`.
- Keep vulnerable behavior clearly labeled as training-only.

## Suggested PR Checklist (even for local branches)
- [ ] app runs with `docker compose up -d --build`
- [ ] seed/reset flow works
- [ ] debugger attach works
- [ ] README reflects actual routes/ports/toggles
- [ ] `.gitignore` excludes local artifacts
