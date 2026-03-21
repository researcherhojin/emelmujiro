#!/bin/bash
set -e

# Development port cleanup script

echo "🧹 Cleaning up development ports..."

# Frontend port cleanup
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 5173 (Frontend) cleared"
fi

# Backend port cleanup
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo "✅ Port 8000 (Backend) cleared"
fi

echo "✨ Port cleanup complete"
