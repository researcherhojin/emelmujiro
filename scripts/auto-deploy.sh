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

# Install dependencies (handles package-lock.json changes after git pull)
echo "$LOG_PREFIX Installing dependencies..."
npm ci --prefer-offline --no-audit

# Frontend build (nginx volume mount → live immediately, no container restart)
echo "$LOG_PREFIX Building frontend..."
cd frontend
# Load frontend env vars from file (not committed to git)
# Use read loop instead of source to prevent shell expansion injection
if [ -f "$REPO_DIR/frontend/.env.production" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments, empty lines, and lines without '='
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *"="* ]] && continue
    # Split on first '=' only (preserves '=' in values like DATABASE_URL)
    key="${line%%=*}"
    value="${line#*=}"
    # Validate key is a valid env var name
    [[ "$key" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]] || continue
    # Strip surrounding quotes from value
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    export "$key=$value"
  done < "$REPO_DIR/frontend/.env.production"
fi
VITE_API_URL="${VITE_API_URL:-https://api.emelmujiro.com/api}" npm run build:no-prerender

# Ensure all services are running
echo "$LOG_PREFIX Starting services..."
cd "$REPO_DIR"
docker compose up -d --build backend
docker compose up -d frontend

# Wait for services to be healthy (up to 60s)
echo "$LOG_PREFIX Waiting for services to be healthy..."
backend_ok=false
frontend_ok=false
elapsed=0
while [ $elapsed -lt 60 ]; do
  if [ "$backend_ok" = false ] && curl -sf http://127.0.0.1:8000/api/health/ > /dev/null 2>&1; then
    echo "$LOG_PREFIX Backend health check passed after ${elapsed}s"
    backend_ok=true
  fi
  if [ "$frontend_ok" = false ] && curl -sf http://127.0.0.1:8080/ > /dev/null 2>&1; then
    echo "$LOG_PREFIX Frontend health check passed after ${elapsed}s"
    frontend_ok=true
  fi
  if [ "$backend_ok" = true ] && [ "$frontend_ok" = true ]; then
    break
  fi
  sleep 5
  elapsed=$((elapsed + 5))
done

if [ "$backend_ok" = false ] || [ "$frontend_ok" = false ]; then
  [ "$backend_ok" = false ] && echo "$LOG_PREFIX ERROR: Backend health check did not pass within 60s"
  [ "$frontend_ok" = false ] && echo "$LOG_PREFIX ERROR: Frontend health check did not pass within 60s"
  echo "$LOG_PREFIX Deploy failed: service(s) not healthy"
  exit 1
fi

echo "$LOG_PREFIX Deploy completed at $(date)"

# NOTE: On initial server setup, run 'make setup-cron' once to enable
# daily SiteVisit cleanup automation (removes old records at 3 AM).
# This is NOT run automatically by this script — it only needs to be done once.
