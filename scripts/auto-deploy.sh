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
VITE_API_URL=https://api.emelmujiro.com/api npm run build

# Backend rebuild (only restarts if code changed)
echo "$LOG_PREFIX Rebuilding backend..."
cd "$REPO_DIR"
docker compose up -d --build backend

echo "$LOG_PREFIX Deploy completed at $(date)"
