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
        echo "Waiting for Docker to fully start (~30 seconds)..."
        sleep 30

        # Re-check Docker status
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker Desktop is still not running."
            echo "Please start Docker Desktop manually."
            exit 1
        fi
    else
        exit 1
    fi
fi

echo "✅ Docker is running."

# Check environment variable files
if [ ! -f "backend/.env.dev" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env.dev
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.example frontend/.env
fi

# Start development environment with Docker Compose
echo "🐳 Starting Docker Compose..."
docker compose -f docker-compose.dev.yml up
