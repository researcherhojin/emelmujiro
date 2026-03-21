#!/bin/bash
set -e

# Port status check script

echo "🔍 Checking port status..."

# Frontend port check
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5173 (Frontend) is already in use"
    echo "Kill process? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        echo "✅ Port 5173 cleared"
    fi
else
    echo "✅ Port 5173 (Frontend) is available"
fi

# Backend port check
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 8000 (Backend) is already in use"
    echo "Kill process? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        echo "✅ Port 8000 cleared"
    fi
else
    echo "✅ Port 8000 (Backend) is available"
fi

# PostgreSQL port check
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5432 (PostgreSQL) is in use"
else
    echo "✅ Port 5432 (PostgreSQL) is available"
fi

# Redis port check
if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 6379 (Redis) is in use"
else
    echo "✅ Port 6379 (Redis) is available"
fi

echo "✨ Port check complete"
