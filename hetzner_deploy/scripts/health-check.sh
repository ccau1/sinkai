#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [ -f "$DEPLOY_DIR/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$DEPLOY_DIR/.env"
  set +a
fi

HEALTH_URL="${HEALTH_URL:-}"
[ -n "$HEALTH_URL" ] || { echo "❌ HEALTH_URL is required (set in hetzner_deploy/.env or env)"; exit 1; }

echo "🩺 Health check: ${HEALTH_URL}"
for i in {1..12}; do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✅ Health check passed"
    exit 0
  fi
  echo "   Attempt ${i}/12..."
  sleep 5
done

echo "❌ Health check failed after 60 seconds"
exit 1
