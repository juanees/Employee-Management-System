#!/usr/bin/env bash
set -euo pipefail

API_PORT="${API_PORT:-3333}"
API_HOST="${API_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
NEXT_HOST="${NEXT_HOST:-0.0.0.0}"

export PORT="${API_PORT}"
export HOST="${API_HOST}"

echo "Starting API on ${HOST}:${PORT}"
node dist/index.js &
api_pid=$!

cleanup() {
  if ps -p "${api_pid}" >/dev/null 2>&1; then
    echo "Stopping API"
    kill -TERM "${api_pid}" 2>/dev/null || true
    wait "${api_pid}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

cd /app/frontend

echo "Starting frontend on ${NEXT_HOST}:${FRONTEND_PORT}"
npm run start -- --hostname "${NEXT_HOST}" --port "${FRONTEND_PORT}"
