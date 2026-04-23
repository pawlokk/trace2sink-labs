#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f app/data/wiki.sqlite
docker compose down
docker compose up -d --build
echo "[reset] app=http://localhost:8081 debug=9003"
