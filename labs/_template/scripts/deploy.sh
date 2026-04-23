#!/usr/bin/env bash
set -euo pipefail

# Example defaults for private lab host
REMOTE_USER="${REMOTE_USER:-pawlok}"
REMOTE_HOST="${REMOTE_HOST:-192.168.18.126}"
REMOTE_PATH="${REMOTE_PATH:-/home/pawlok/labs/<lab-name>}"

# Implement stack-specific sync/start commands here.
echo "[deploy] TODO: implement for this lab"
echo "target=$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
