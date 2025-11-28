#!/usr/bin/env bash
set -euo pipefail

API_PORT="${API_PORT:-3333}"
API_HOST="${API_HOST:-0.0.0.0}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
NEXT_HOST="${NEXT_HOST:-0.0.0.0}"
DATABASE_URL="${DATABASE_URL:-file:./prisma/dev.db}"
SQLITE_DIR="/app/prisma/prisma"
SQLITE_FILE="${SQLITE_DIR}/dev.db"
BOOTSTRAP_DB="/app/bootstrap/dev.db"

mkdir -p "${SQLITE_DIR}"
if [ ! -f "${SQLITE_FILE}" ] && [ -f "${BOOTSTRAP_DB}" ]; then
  echo "Initializing SQLite database at ${SQLITE_FILE}"
  cp "${BOOTSTRAP_DB}" "${SQLITE_FILE}"
fi

export PORT="${API_PORT}"
export HOST="${API_HOST}"
export DATABASE_URL

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
