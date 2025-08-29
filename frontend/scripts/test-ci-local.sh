#!/bin/bash

# CI 환경 시뮬레이션 스크립트
# GitHub Actions와 동일한 환경에서 테스트 실행

echo "🔍 CI 환경 시뮬레이션 테스트 시작..."
echo "================================"

# CI 환경 변수 설정
export CI=true
export NODE_ENV=test
export REACT_APP_ENV=test

# React StrictMode 활성화 확인
export REACT_STRICT_MODE=true

# 테스트 실행 전 캐시 정리
echo "📦 캐시 정리 중..."
rm -rf node_modules/.cache
rm -rf .vitest

# 의존성 확인
echo "📦 의존성 확인 중..."
npm ls @testing-library/react @testing-library/jest-dom vitest || true

echo ""
echo "🧪 테스트 실행 (CI 모드)..."
echo "================================"

# 특정 테스트 파일 실행 (인자로 받은 경우)
if [ -n "$1" ]; then
    echo "📝 테스트 파일: $1"
    npm test -- --run "$1" --reporter=verbose --no-coverage
else
    # 전체 테스트 실행
    echo "📝 전체 테스트 실행"
    npm test -- --run --reporter=verbose --no-coverage
fi

# 테스트 결과 확인
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 테스트 성공! GitHub Actions에서도 통과할 것으로 예상됩니다."
else
    echo ""
    echo "❌ 테스트 실패! GitHub Actions에서도 실패할 것입니다."
    echo "💡 팁: React StrictMode의 이중 렌더링을 고려하세요."
    echo "💡 팁: getAllBy* 쿼리를 사용하고 첫 번째 요소를 선택하세요."
    exit 1
fi
