#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
docker compose exec app node scripts/reseed.js
docker compose exec app node scripts/seed.js

echo "[reseed] database reseeded"
