#!/bin/bash
set -euo pipefail

# Auto-deploy script for Mac Mini
# Called by deploy-webhook.js after GitHub Actions CI passes.

REPO_DIR="${DEPLOY_REPO_DIR:-$HOME/workspace/emelmujiro}"
LOG_PREFIX="[auto-deploy]"

echo "$LOG_PREFIX Starting deploy at $(date)"

cd "$REPO_DIR"

# Pull latest code
echo "$LOG_PREFIX Pulling latest changes..."
if ! git pull origin main; then
  echo "$LOG_PREFIX ERROR: git pull failed, aborting deploy"
  exit 1
fi

# Frontend build (nginx volume mount → live immediately, no container restart)
echo "$LOG_PREFIX Building frontend..."
cd frontend
# Load frontend env vars from file (not committed to git)
if [ -f "$REPO_DIR/frontend/.env.production" ]; then
  set -a
  source "$REPO_DIR/frontend/.env.production"
  set +a
fi
VITE_API_URL=https://api.emelmujiro.com/api npm run build

# Ensure all services are running
echo "$LOG_PREFIX Starting services..."
cd "$REPO_DIR"
docker compose up -d --build backend
docker compose up -d frontend

# Wait for services to be healthy (up to 60s)
echo "$LOG_PREFIX Waiting for services to be healthy..."
elapsed=0
while [ $elapsed -lt 60 ]; do
  if curl -sf http://127.0.0.1:8000/api/health/ > /dev/null 2>&1; then
    echo "$LOG_PREFIX Health check passed after ${elapsed}s"
    break
  fi
  sleep 5
  elapsed=$((elapsed + 5))
done

if [ $elapsed -ge 60 ]; then
  echo "$LOG_PREFIX WARNING: Health check did not pass within 60s"
fi

echo "$LOG_PREFIX Deploy completed at $(date)"

# NOTE: On initial server setup, run 'make setup-cron' once to enable
# daily SiteVisit cleanup automation (removes old records at 3 AM).
# This is NOT run automatically by this script — it only needs to be done once.
