#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f app/data/app.db
docker compose restart app
echo "[reseed] database cleared; auto-seed on app startup"
