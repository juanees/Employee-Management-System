#!/usr/bin/env bash
set -euo pipefail

API_PORT="${API_PORT:-3333}"
API_HOST="${API_HOST:-0.0.0.0}"
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

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

echo "Starting API on ${HOST}:${PORT}"
exec node dist/index.js
