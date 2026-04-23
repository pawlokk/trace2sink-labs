#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
docker compose down -v
docker compose up -d --build
sleep 4
docker compose exec app node scripts/seed.js

echo "[reset] app=http://localhost:3002 debug=9229"
