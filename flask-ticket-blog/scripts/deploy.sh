#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="${REMOTE_USER:-pawlok}"
REMOTE_HOST="${REMOTE_HOST:-192.168.18.126}"
REMOTE_PATH="${REMOTE_PATH:-/home/pawlok/labs/flask-ticket-blog}"
SSH_OPTS="${SSH_OPTS:--o StrictHostKeyChecking=no}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

ssh $SSH_OPTS "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_PATH'"
rsync -az --delete --exclude .git --exclude .env "$ROOT_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
ssh $SSH_OPTS "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_PATH' && cp -n .env.example .env && docker compose up -d --build"

echo "[deploy] remote=$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
echo "[deploy] app_port=5003 debug_port=5678"
