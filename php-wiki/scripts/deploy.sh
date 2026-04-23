#!/usr/bin/env bash
set -euo pipefail
REMOTE_USER="${REMOTE_USER:-pawlok}"
REMOTE_HOST="${REMOTE_HOST:-192.168.18.126}"
REMOTE_PATH="${REMOTE_PATH:-/home/pawlok/labs/php-wiki}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ssh "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"
rsync -az --delete --exclude .git --exclude .env "$ROOT_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
ssh "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_PATH' && cp -n .env.example .env && docker compose up -d --build"

echo "[deploy] remote=$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH app=8081 debug=9003"
