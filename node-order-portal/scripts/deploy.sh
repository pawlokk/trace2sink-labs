#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="${REMOTE_USER:-pawlok}"
REMOTE_HOST="${REMOTE_HOST:-192.168.18.126}"
REMOTE_PATH="${REMOTE_PATH:-/home/pawlok/labs/node-order-portal}"
SSH_PASSWORD="${SSH_PASSWORD:-pawlok}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required"
  exit 1
fi

sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"
sshpass -p "$SSH_PASSWORD" rsync -az --delete --exclude node_modules --exclude .git "$ROOT_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_PATH' && cp -n .env.example .env && docker compose up -d --build && sleep 4 && docker compose exec app node scripts/seed.js"

echo "[deploy] remote=$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo "[deploy] app_port=3002 debug_port=9229"
