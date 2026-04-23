#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="${REMOTE_USER:-pawlok}"
REMOTE_HOST="${REMOTE_HOST:-192.168.18.126}"
REMOTE_PATH="${REMOTE_PATH:-/home/pawlok/labs/node-order-portal}"
SSH_OPTS="${SSH_OPTS:--o StrictHostKeyChecking=no}"

ssh $SSH_OPTS "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_PATH' && docker compose down -v && docker compose up -d --build && sleep 4 && docker compose exec app node scripts/seed.js"

echo "[remote-reset] done"
