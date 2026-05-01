# flask-ticket-blog (Challenge 3)

Small Flask + SQL + templates training lab focused on whitebox flow tracing and chain building.

## Scenario
A ticket/blog portal where users create posts and import files, while admins review stored content in a moderation dashboard.

## Project Structure
```text
flask-ticket-blog/
  app/
    main.py                 # routes, decorators, auth/session flow, DB/file/template sinks
    templates/              # safe vs unsafe admin rendering
    uploads/ imports/ data/
  scripts/
    deploy.sh reset.sh reseed.sh logs.sh
  Dockerfile
  docker-compose.yml
  .env.example
  .vscode/launch.json
  attach-notes.md
```

## Ports
- App: `5003`
- Debug (debugpy): `5678`

## Seeded Users/Roles
- `admin@lab.local` / `admin123!` (admin)
- `alice@lab.local` / `alice123!` (user)

## Request Flow (Trace Map)
1. Route handlers: `app/main.py`
2. Decorator checks: `@require_auth`, `@require_admin`
3. Session handling: `session['uid']` -> `current_user()`
4. SQL sinks: `text(...)` queries via SQLAlchemy engine
5. File sink: `/imports/upload` -> `file.save(...)` + DB persist
6. Template render sink: `/admin` -> safe/unsafe template branch
7. Stored-input reuse: imports/posts later rendered in admin dashboard

## Core Features
- register/login/logout
- password reset flow
- profile settings (`bio`)
- posts CRUD
- search/filter endpoint (`GET /posts?q=...`)
- file upload/import (`POST /imports/upload`)
- admin dashboard (`GET /admin`)
- API endpoint (`GET /api/summary`)
- simulation endpoint (`POST /api/debug/role-update`)

## Training Hooks (SAFE vs UNSAFE)
Set in `.env`:
- `UNSAFE_RAW_SEARCH=1` -> raw SQL query composition in `/posts`
- `UNSAFE_TEMPLATE_RENDER=1` -> Jinja `|safe` render in admin template
- `UNSAFE_IMPORT_PATH=1` -> user-controlled path for import file save
- `UNSAFE_RESET_COMPARE=1` -> weak token comparison path
- `UNSAFE_OWNER_BYPASS=1` -> bypass object ownership check in `GET /posts/<id>`
- `UNSAFE_ROLE_UPDATE_SIM=1` -> enables intentional weak trust-boundary role update simulation endpoint

## Suggested Audit Checklist
- map decorator-only auth vs object-level checks
- trace session cookie to `current_user()` trust boundary
- inspect raw SQL toggle branch in search
- inspect file helper/path handling in upload flow
- inspect stored data render branch in admin dashboard
- map second-order path: upload/import -> DB -> admin render
- review simulation-only role update anti-pattern: `/api/debug/role-update`

## Local Run
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:5003/health
```

## Reset / Reseed
```bash
./scripts/reset.sh
./scripts/reseed.sh
```

## Remote Deploy (SSH)
```bash
./scripts/deploy.sh
```
Default remote path: `/home/pawlok/labs/flask-ticket-blog`

## Remote Debug Attach (VS Code)
1. Ensure remote app is running.
2. Tunnel debug port:
```bash
ssh -L 5678:127.0.0.1:5678 pawlok@192.168.18.126
```
3. Run VS Code config: `Attach Python (Remote Docker)`.

## Suggested First Breakpoints
- `require_auth` decorator (`app/main.py`)
- `/posts` search query branch
- `/imports/upload` path/file save logic
- `/admin` template branch decision

## Manual vs Automated
Automated:
- docker build/run
- local reset/reseed scripts
- remote deploy script

Manual:
- toggling safe/unsafe branches in `.env`
- chain mapping and exploit PoC development
- debugger breakpoint strategy
