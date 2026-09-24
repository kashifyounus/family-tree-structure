#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-3000}"

if [[ ! -f .cloud-database-url ]]; then
  node scripts/cloud-preview-boot.mjs
fi
export DATABASE_URL="$(cat .cloud-database-url)"

echo "[cloud-preview] Next.js → http://${HOST}:${PORT}"
echo "[cloud-preview] Sample tree: /tree/FAM-10004"
exec npx next dev --hostname "$HOST" -p "$PORT"
