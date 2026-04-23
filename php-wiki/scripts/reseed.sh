#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -f app/data/wiki.sqlite
docker compose restart app
echo "[reseed] sqlite removed; app will re-seed on next request"
