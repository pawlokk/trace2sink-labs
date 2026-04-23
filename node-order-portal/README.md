# Node Order Portal (Challenge 2)

Small intentionally vulnerable training app for OSWE-style whitebox practice.

## Scenario
Internal order/inventory portal with a lightweight API.
- Users register/login, edit profile, manage products/orders.
- Admin reviews webhook/import activity and updates privileged runtime settings.

## Project Structure
```text
node-order-portal/
  src/
    config/           # env + mongo connection
    middleware/       # auth/authz middleware chain
    models/           # User Product Order ImportLog
    routes/           # auth profile products orders admin webhook api
    services/         # query builder + import preview helper
    utils/            # jwt + merge utility
    index.js          # app entry + middleware wiring
  scripts/
    seed.js reseed.js
    deploy.sh remote-reset.sh reset.sh reseed.sh logs.sh
  .vscode/launch.json
  Dockerfile
  docker-compose.yml
  .env.example
```

## Ports
- App: `3002`
- Node inspector debug: `9229`

## Seeded Users/Roles
- `admin@lab.local` / `admin123!` (admin)
- `alice@lab.local` / `alice123!` (user)
- `bob@lab.local` / `bob123!` (user)

## Request Flow (High Value Trace)
1. `src/index.js`
- middleware chain: `morgan -> express.json -> cookieParser -> routes`
2. `src/middleware/auth.js`
- cookie `auth_token` -> JWT verify -> DB user load -> `req.user`
3. Route handlers in `src/routes/*.js`
- user input enters from `req.body`/`req.params`
4. Service/helper layer
- `src/services/queryService.js` and `src/services/importService.js`
5. DB sink
- Mongoose operations (`find`, `create`, `save`, `deleteOne`)
6. Response sink
- `res.json(...)` includes transformed/stored data

## Must-Trace Points
- Middleware chain: `src/index.js`
- Body parsing and JSON handling: `express.json()` and route bodies
- Session/JWT/cookie flow: `authRoutes.js` + `middleware/auth.js`
- Query object construction: `services/queryService.js`
- Helper/service calls: products search + webhook preview
- Object merge/update logic: `profileRoutes.js` + `utils/merge.js`

## Training Hooks (SAFE vs UNSAFE)
Set in `.env`.
- `TRUST_RAW_FILTER`
- Safe: allowlisted query build in `queryService.js`
- Unsafe: raw request filter becomes Mongo query object
- `ALLOW_PROFILE_HIDDEN_FIELDS`
- Safe: allowlist only profile/displayName update
- Unsafe: `Object.assign(req.user, req.body)` hidden field trust/mass assignment surface
- `ALLOW_DEV_IMPERSONATION`
- Safe: no header-based identity override
- Unsafe: accepts `x-dev-user` header in auth middleware
- `UNSAFE_MERGE`
- Safe: shallow assignment in admin settings
- Unsafe: recursive merge surface for pollution-style behavior
- `UNSAFE_RENDER_HELPER`
- Safe: static preview formatter
- Unsafe: dynamic expression evaluation in import helper

## Feature Checklist Coverage
- Register/login/logout: `/auth/*`
- Profile update: `/profile/me`
- Product CRUD: `/products/*`
- Order CRUD: `/orders/*`
- JSON API: `/api/summary`
- Admin-only route: `/admin/*`
- Webhook/import endpoint: `/webhooks/inventory-sync`
- Request JSON influences DB query object: `POST /products/search`
- Hidden/admin field in update flow: profile update role field surface via toggle
- Auth middleware: `requireAuth`
- Ownership check: product/order patch/delete
- Stored input reused later: import payload persisted and shown in admin imports

## Local Run
```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app node scripts/seed.js
```

Health:
```bash
curl http://localhost:3002/health
```

## Reset/Reseed
- Full reset (containers + DB volume + seed):
```bash
./scripts/reset.sh
```
- Reseed only DB data:
```bash
./scripts/reseed.sh
```

## Remote Deploy (SSH, Ubuntu host)
Defaults use your lab host from this challenge.
```bash
./scripts/deploy.sh
```

What it does:
1. copies project to `/home/pawlok/labs/node-order-portal`
2. starts containers remotely with `docker compose up -d --build`
3. runs seed script remotely

Remote reset:
```bash
./scripts/remote-reset.sh
```

## VS Code Remote Debug Attach
1. Ensure remote/container app runs with inspector (`docker-compose.yml` already uses `node --inspect=0.0.0.0:9229 ...`).
2. Use SSH tunnel from your workstation:
```bash
ssh -L 9229:127.0.0.1:9229 pawlok@192.168.18.126
```
3. Open this repo in VS Code.
4. Run `Attach Node (Remote Docker)` from `.vscode/launch.json`.

Path mapping is already set:
- localRoot: workspace folder
- remoteRoot: `/app`

## Suggested First Breakpoints
- Route/controller entry: `src/routes/productRoutes.js` (`/search`)
- Auth/session check: `src/middleware/auth.js` (`requireAuth`)
- Key transformation: `src/services/queryService.js` (`buildProductQueryFromJson`)
- Final DB sink: `Product.find(query)` and `ImportLog.create(...)`

## Suggested Audit Checklist
- Check trust boundary of cookie/header/token in auth middleware.
- Check how query objects are constructed from JSON.
- Check ownership checks for IDOR-like mistakes.
- Check profile/update hidden field handling.
- Check admin settings merge behavior.
- Check stored webhook payload reuse in helper/response paths.

## Manual vs Automated
Automated:
- container build/run
- local reset/reseed scripts
- remote deploy/reset scripts

Manual:
- enable/disable training hooks in `.env`
- exploit writing and trace walk-through
- VS Code breakpoint selection and runtime inspection
