#!/bin/bash

# 개발 환경 시작 스크립트

echo "🚀 Emelmujiro 개발 환경 시작..."

# Docker 체크
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행 중이 아닙니다."
    echo "Docker Desktop을 시작하고 다시 시도해주세요."
    
    # macOS에서 Docker Desktop 시작 시도
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Docker Desktop 시작 시도 중..."
        open -a Docker
        echo "Docker가 완전히 시작될 때까지 기다려주세요 (약 30초)..."
        sleep 30
        
        # Docker 상태 재확인
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker Desktop이 아직 실행되지 않았습니다."
            echo "수동으로 Docker Desktop을 시작해주세요."
            exit 1
        fi
    else
        exit 1
    fi
fi

echo "✅ Docker가 실행 중입니다."

# 환경 변수 파일 체크
if [ ! -f "backend/.env.dev" ]; then
    echo "📝 Backend 환경 변수 파일 생성 중..."
    cp backend/.env.example backend/.env.dev
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Frontend 환경 변수 파일 생성 중..."
    cp frontend/.env.example frontend/.env
fi

# Docker Compose로 개발 환경 시작
echo "🐳 Docker Compose 시작..."
docker-compose -f docker-compose.dev.yml up