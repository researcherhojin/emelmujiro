#!/bin/bash
set -euo pipefail

# Auto-deploy script for Mac Mini
# Called by deploy-webhook.js after GitHub Actions CI passes.

REPO_DIR="$HOME/workspace/emelmujiro"
LOG_PREFIX="[auto-deploy]"

echo "$LOG_PREFIX Starting deploy at $(date)"

cd "$REPO_DIR"

# Pull latest code
echo "$LOG_PREFIX Pulling latest changes..."
git pull origin main

# Frontend build (nginx volume mount → live immediately, no container restart)
echo "$LOG_PREFIX Building frontend..."
cd frontend
VITE_API_URL=https://api.emelmujiro.com/api \
VITE_ENABLE_SENTRY=true \
VITE_SENTRY_DSN=https://30ed5ac82c70649b3193bfceeaaa00dc@o4506610315100160.ingest.us.sentry.io/4511061307555840 \
VITE_ENABLE_ANALYTICS=true \
VITE_GA_TRACKING_ID=G-LTDH6E8740 \
npm run build

# Backend rebuild (only restarts if code changed)
echo "$LOG_PREFIX Rebuilding backend..."
cd "$REPO_DIR"
docker compose up -d --build backend

echo "$LOG_PREFIX Deploy completed at $(date)"
