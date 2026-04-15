#!/bin/bash
set -e

# Development environment startup script

echo "🚀 Starting Emelmujiro development environment..."

# Docker check
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and try again."

    # Attempt to start Docker Desktop on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Attempting to start Docker Desktop..."
        open -a Docker
        echo "Waiting for Docker to start..."
        elapsed=0
        while [ $elapsed -lt 60 ]; do
            if docker info > /dev/null 2>&1; then
                break
            fi
            sleep 3
            elapsed=$((elapsed + 3))
            echo "  Waiting... (${elapsed}s)"
        done

        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker Desktop did not start within 60s."
            echo "Please start Docker Desktop manually."
            exit 1
        fi
    else
        exit 1
    fi
fi

echo "✅ Docker is running."

# Check required env files — setup-dev-machine.sh creates these on first setup.
# Blind-copying .env.example would give backend a placeholder SECRET_KEY,
# so error out and direct the user to the proper bootstrap instead.
MISSING=()
[ ! -f ".env" ] && MISSING+=(".env")
[ ! -f "backend/.env" ] && MISSING+=("backend/.env")

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "❌ Missing required env file(s): ${MISSING[*]}"
    echo "   Run 'make setup-dev-machine' first to generate them with per-machine secrets."
    exit 1
fi

# Start development environment with Docker Compose
echo "🐳 Starting Docker Compose..."
docker compose -f docker-compose.dev.yml up
