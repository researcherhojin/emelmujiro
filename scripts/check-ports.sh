#!/bin/bash

# 포트 확인 및 정리 스크립트

echo "🔍 포트 상태 확인 중..."

# Frontend 포트 확인
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 3000 (Frontend) is already in use"
    echo "Kill process? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "✅ Port 3000 cleared"
    fi
else
    echo "✅ Port 3000 (Frontend) is available"
fi

# Backend 포트 확인
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Port 8000 (Backend) is already in use"
    echo "Kill process? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        lsof -ti:8000 | xargs kill -9
        echo "✅ Port 8000 cleared"
    fi
else
    echo "✅ Port 8000 (Backend) is available"
fi

# PostgreSQL 포트 확인
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5432 (PostgreSQL) is in use"
else
    echo "✅ Port 5432 (PostgreSQL) is available"
fi

# Redis 포트 확인
if lsof -Pi :6379 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 6379 (Redis) is in use"
else
    echo "✅ Port 6379 (Redis) is available"
fi

echo "✨ 포트 확인 완료"