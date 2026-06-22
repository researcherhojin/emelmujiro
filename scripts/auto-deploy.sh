#!/bin/bash
set -euo pipefail

# Auto-deploy script for Mac Mini
# Called by deploy-webhook.js after GitHub Actions CI passes.

REPO_DIR="${DEPLOY_REPO_DIR:-$HOME/workspace/emelmujiro}"
LOG_PREFIX="[auto-deploy]"

# Docker Desktop ships its credential helper (docker-credential-desktop) inside
# the app bundle. The deploy webhook runs under a non-interactive launchd PATH
# that does NOT include this dir, so `docker compose up -d --build backend` fails
# resolving registry image metadata (COPY --from=ghcr.io/astral-sh/uv) with
# `docker-credential-desktop: executable file not found`. set -e then aborts
# BEFORE the frontend container/health steps — but the frontend `npm run build`
# (bind mount) already ran, so the site looked deployed while the backend kept
# running stale code. Prepend the Docker bin dir so the helper resolves.
if [ -d "/Applications/Docker.app/Contents/Resources/bin" ]; then
  export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

echo "$LOG_PREFIX Starting deploy at $(date)"

cd "$REPO_DIR"

# Pull latest code
echo "$LOG_PREFIX Pulling latest changes..."
PREV_HEAD=$(git rev-parse HEAD)
if ! git pull origin main; then
  echo "$LOG_PREFIX ERROR: git pull failed, aborting deploy"
  exit 1
fi

# Detect whether this pull changed the nginx config. nginx.conf is a bind mount,
# so a plain `docker compose up -d frontend` will NOT apply edits: compose sees
# no service change (no-op), and on macOS Docker the mount keeps the pre-pull
# inode after git rewrites the file, so even an `nginx -s reload` reads a stale
# view. When it changed, the frontend container is force-recreated below.
NGINX_CONF_CHANGED=false
if ! git diff --quiet "$PREV_HEAD" HEAD -- frontend/nginx.conf; then
  NGINX_CONF_CHANGED=true
  echo "$LOG_PREFIX nginx.conf changed — frontend will be force-recreated"
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
# Ensure Playwright Chromium is installed — required by scripts/prerender.js
# which runs headless Chromium to snapshot each route as static HTML. Idempotent:
# no-op if the matching browser version is already cached.
npx playwright install chromium

# Build with SSG prerender. Each static route (/, /contact, /profile, /insights,
# /privacy × ko + en = 10 routes) gets its own pre-rendered index.html so
# Googlebot receives per-page title/meta/canonical/content without waiting for
# JS execution. Falls back to build:no-prerender is NOT automatic — if prerender
# fails, the deploy fails (set -eu pipefail at top). That is intentional: bad
# prerender state should surface, not silently ship unprerendered.
VITE_API_URL="${VITE_API_URL:-https://api.emelmujiro.com/api}" npm run build

# Ensure all services are running
echo "$LOG_PREFIX Starting services..."
cd "$REPO_DIR"
docker compose up -d --build backend
if [ "$NGINX_CONF_CHANGED" = true ]; then
  # Validate the new nginx.conf before applying it, so a syntax error aborts the
  # deploy WITHOUT killing the running frontend. Test INSIDE the running
  # container: it sits on the compose network, so `proxy_pass` upstreams
  # (`backend`, `umami`) resolve — a throwaway `docker run` is off-network and
  # false-fails with "host not found in upstream". Copy to a temp path because
  # the live mount still serves the stale inode until the recreate below.
  echo "$LOG_PREFIX Validating new nginx.conf..."
  if docker ps --format '{{.Names}}' | grep -qx emelmujiro-frontend; then
    docker cp frontend/nginx.conf emelmujiro-frontend:/tmp/nginx-new.conf
    if ! docker exec emelmujiro-frontend nginx -t -c /tmp/nginx-new.conf; then
      echo "$LOG_PREFIX ERROR: new nginx.conf failed validation — keeping current config, aborting deploy"
      docker exec emelmujiro-frontend rm -f /tmp/nginx-new.conf || true
      exit 1
    fi
    docker exec emelmujiro-frontend rm -f /tmp/nginx-new.conf || true
  else
    echo "$LOG_PREFIX frontend container not running — skipping pre-validation"
  fi
  docker compose up -d --force-recreate frontend
else
  docker compose up -d frontend
fi

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
