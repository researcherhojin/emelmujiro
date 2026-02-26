#!/bin/bash

# 개발 환경 포트 정리 스크립트

echo "🧹 개발 환경 포트 정리 중..."

# Frontend 포트 정리
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo "✅ Port 5173 (Frontend) cleared"
fi

# Backend 포트 정리
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "✅ Port 8000 (Backend) cleared"
fi

echo "✨ 포트 정리 완료"
