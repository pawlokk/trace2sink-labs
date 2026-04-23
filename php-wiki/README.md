# php-wiki

Small PHP whitebox training lab (auth + notes CRUD + reset + upload + admin).

## Scenario
Internal wiki portal with regular users and one admin moderation view.

## Ports
- app: `8081`
- xdebug: `9003`

## Seeded users
- `admin@lab.local` / `admin123!` (admin)
- `user@lab.local` / `user123!` (user)

## Features
- register/login/logout
- reset token flow
- profile avatar upload
- notes CRUD-lite (create + list + view)
- admin-only panel
- JSON API endpoint: `/?r=api_notes`

## Trace map
- entry: `app/public/index.php` (`$_GET['r']` router)
- auth/session: `app/src/bootstrap.php` (`current_user`, `require_auth`, `require_admin`)
- user-controlled sources: `$_GET`, `$_POST`, `$_FILES`, `$_SESSION`
- transformations: note search, reset token compare, upload filename/path handling
- sinks: PDO queries, file write (`move_uploaded_file`), template render

## Training hooks
Set in `.env`:
- `UNSAFE_SQL_SEARCH=1` raw SQL string building in notes search
- `UNSAFE_RESET_COMPARE=1` weak reset token comparison (`==`)
- `UNSAFE_AVATAR_PATH=1` user-controlled upload path usage
- `UNSAFE_TEMPLATE_RENDER=1` raw render of stored note body

## Run
```bash
cp .env.example .env
docker compose up -d --build
curl http://localhost:8081/
```

## Reset / reseed
```bash
./scripts/reset.sh
./scripts/reseed.sh
```

## Remote deploy
```bash
./scripts/deploy.sh
```

## VS Code debug (Xdebug)
1. Start lab with docker compose.
2. Run config `Listen for Xdebug (php-wiki)`.
3. Put breakpoints in:
- `app/public/index.php`
- `app/src/bootstrap.php`
4. Trigger request in browser/curl.

Remote tunnel example:
```bash
ssh -L 9003:127.0.0.1:9003 pawlok@192.168.18.126
```
