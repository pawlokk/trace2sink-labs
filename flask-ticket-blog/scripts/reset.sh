#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf app/data
mkdir -p app/data app/uploads app/imports
docker compose down
docker compose up -d --build
echo "[reset] app=http://localhost:5003 debug=5678"
