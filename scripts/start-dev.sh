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

# Check environment variable files
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        echo "📝 Creating backend/.env from example..."
        cp backend/.env.example backend/.env
    else
        echo "⚠️  backend/.env.example not found — create backend/.env manually"
    fi
fi

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating root .env from example..."
        cp .env.example .env
    else
        echo "⚠️  .env.example not found — create .env manually"
    fi
fi

if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        echo "📝 Creating frontend/.env from example..."
        cp frontend/.env.example frontend/.env
    else
        echo "⚠️  frontend/.env.example not found — create frontend/.env manually"
    fi
fi

# Start development environment with Docker Compose
echo "🐳 Starting Docker Compose..."
docker compose -f docker-compose.dev.yml up
