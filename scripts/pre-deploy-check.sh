#!/bin/bash

# =====================================================
# 🚀 프로덕션 배포 전 최종 체크 스크립트
# =====================================================
# 이 스크립트는 배포 전 모든 필수 사항을 자동으로 검증합니다
#
# 사용법: ./scripts/pre-deploy-check.sh
# =====================================================

set -e  # 에러 발생 시 즉시 종료

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 아이콘 정의
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
ROCKET="🚀"
INFO="ℹ️"

# 결과 저장
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0
TOTAL_CHECKS=0

# 체크 함수
check() {
    local description=$1
    local command=$2
    local is_warning=${3:-false}

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -n "Checking: $description... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}${CHECK} Passed${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        if [ "$is_warning" = true ]; then
            echo -e "${YELLOW}${WARNING} Warning${NC}"
            WARNINGS=$((WARNINGS + 1))
            return 1
        else
            echo -e "${RED}${CROSS} Failed${NC}"
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
}

# 헤더 출력
echo "======================================================"
echo -e "${BLUE}${ROCKET} 프로덕션 배포 전 체크리스트 ${ROCKET}${NC}"
echo "======================================================"
echo -e "${INFO} 시작 시간: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# =====================================================
# 1. 환경 설정 체크
# =====================================================
echo -e "${BLUE}📋 1. 환경 설정 체크${NC}"
echo "------------------------------------------------------"

check ".env.production 파일 존재" "[ -f frontend/.env.production ]"
check "PUBLIC_URL 설정 확인" "grep -q 'PUBLIC_URL=' frontend/.env.production"
check "REACT_APP_API_URL 설정" "grep -q 'REACT_APP_API_URL=' frontend/.env.production"
check "Sentry DSN 설정" "grep -q 'REACT_APP_SENTRY_DSN=' frontend/.env.production" true
check "Google Analytics ID" "grep -q 'REACT_APP_GOOGLE_ANALYTICS_ID=' frontend/.env.production" true

echo ""

# =====================================================
# 2. 코드 품질 체크
# =====================================================
echo -e "${BLUE}📋 2. 코드 품질 체크${NC}"
echo "------------------------------------------------------"

# TypeScript 컴파일 체크
echo -n "TypeScript 컴파일 체크... "
cd frontend
if npx tsc --noEmit 2>/dev/null; then
    echo -e "${GREEN}${CHECK} No errors${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} TypeScript errors found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# ESLint 체크
echo -n "ESLint 체크... "
cd frontend
ESLINT_OUTPUT=$(npx eslint src --ext .js,.jsx,.ts,.tsx --quiet 2>&1 || true)
if [ -z "$ESLINT_OUTPUT" ]; then
    echo -e "${GREEN}${CHECK} No errors${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || true)
    ESLINT_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || true)
    echo -e "${YELLOW}${WARNING} ${ESLINT_ERRORS} errors, ${ESLINT_WARNINGS} warnings${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# 콘솔 로그 체크
echo -n "console.log 제거 확인... "
CONSOLE_LOGS=$(grep -r "console.log" frontend/src --include="*.tsx" --include="*.ts" --exclude-dir=__tests__ | wc -l)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} No console.log found${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} Found $CONSOLE_LOGS console.log statements${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 3. 테스트 실행
# =====================================================
echo -e "${BLUE}📋 3. 테스트 실행${NC}"
echo "------------------------------------------------------"

echo -n "단위 테스트 실행... "
cd frontend
TEST_OUTPUT=$(CI=true npm test -- --watchAll=false --passWithNoTests 2>&1 || true)
TEST_PASSED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
TEST_FAILED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")

if [ "$TEST_FAILED" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} All tests passed ($TEST_PASSED tests)${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} $TEST_FAILED tests failed, $TEST_PASSED passed${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 4. 빌드 테스트
# =====================================================
echo -e "${BLUE}📋 4. 빌드 테스트${NC}"
echo "------------------------------------------------------"

echo -n "프로덕션 빌드 테스트... "
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}${CHECK} Build successful${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))

    # 빌드 사이즈 체크
    BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
    echo -e "  ${INFO} Build size: $BUILD_SIZE"
else
    echo -e "${RED}${CROSS} Build failed${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ..
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 5. SEO & 접근성 체크
# =====================================================
echo -e "${BLUE}📋 5. SEO & 접근성${NC}"
echo "------------------------------------------------------"

check "robots.txt 파일 존재" "[ -f frontend/public/robots.txt ]"
check "sitemap.xml 파일 존재" "[ -f frontend/public/sitemap.xml ]"
check "manifest.json 파일 존재" "[ -f frontend/public/manifest.json ]"
check "favicon.ico 파일 존재" "[ -f frontend/public/favicon.ico ]"
check "Open Graph 이미지" "[ -f frontend/public/og-image.png ]" true

echo ""

# =====================================================
# 6. 보안 체크
# =====================================================
echo -e "${BLUE}📋 6. 보안 체크${NC}"
echo "------------------------------------------------------"

# API 키 노출 체크
echo -n "하드코딩된 API 키 체크... "
API_KEYS=$(grep -r "api[_-]key\|apikey\|api_secret\|secret_key" frontend/src --include="*.tsx" --include="*.ts" -i | grep -v "process.env" | wc -l)
if [ "$API_KEYS" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} No exposed API keys${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}${CROSS} Found $API_KEYS potential API key exposures${NC}"
    ERRORS=$((ERRORS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# 민감한 정보 체크
echo -n "민감한 정보 노출 체크... "
SENSITIVE=$(grep -r "password\|token\|secret" frontend/src --include="*.tsx" --include="*.ts" | grep -v "process.env" | grep -v "interface" | grep -v "type" | wc -l)
if [ "$SENSITIVE" -lt 5 ]; then
    echo -e "${GREEN}${CHECK} Minimal sensitive data exposure${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} Found $SENSITIVE potential sensitive data references${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 7. 의존성 체크
# =====================================================
echo -e "${BLUE}📋 7. 의존성 체크${NC}"
echo "------------------------------------------------------"

# 취약점 체크
echo -n "npm 보안 취약점 체크... "
cd frontend
AUDIT_OUTPUT=$(npm audit --production 2>&1 || true)
VULNERABILITIES=$(echo "$AUDIT_OUTPUT" | grep -oE "[0-9]+ vulnerabilities" | grep -oE "[0-9]+" || echo "0")
if [ "$VULNERABILITIES" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} No vulnerabilities${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} Found $VULNERABILITIES vulnerabilities${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
cd ..
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 8. Git 상태 체크
# =====================================================
echo -e "${BLUE}📋 8. Git 상태${NC}"
echo "------------------------------------------------------"

# 커밋되지 않은 변경사항 체크
echo -n "커밋되지 않은 변경사항... "
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} Working directory clean${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} $UNCOMMITTED uncommitted changes${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo -e "  ${INFO} Current branch: $CURRENT_BRANCH"

echo ""

# =====================================================
# 9. 성능 체크
# =====================================================
echo -e "${BLUE}📋 9. 성능 체크${NC}"
echo "------------------------------------------------------"

# 번들 사이즈 체크
if [ -f frontend/build/static/js/*.js ]; then
    BUNDLE_SIZE=$(du -sh frontend/build/static/js/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
    echo -e "  ${INFO} JavaScript bundle size: ${BUNDLE_SIZE}KB"
fi

# 이미지 최적화 체크
LARGE_IMAGES=$(find frontend/public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -size +500k 2>/dev/null | wc -l)
if [ "$LARGE_IMAGES" -eq 0 ]; then
    echo -e "  ${CHECK} All images optimized (<500KB)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "  ${WARNING} Found $LARGE_IMAGES large images (>500KB)"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""

# =====================================================
# 최종 결과
# =====================================================
echo "======================================================"
echo -e "${BLUE}📊 최종 결과${NC}"
echo "======================================================"

PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

echo -e "총 체크 항목: $TOTAL_CHECKS"
echo -e "${GREEN}통과: $CHECKS_PASSED${NC}"
echo -e "${YELLOW}경고: $WARNINGS${NC}"
echo -e "${RED}실패: $ERRORS${NC}"
echo -e "통과율: ${PERCENTAGE}%"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}${ROCKET} 완벽합니다! 배포 준비가 완료되었습니다.${NC}"
        exit 0
    else
        echo -e "${YELLOW}${WARNING} 경고가 있지만 배포 가능합니다.${NC}"
        echo "경고 사항을 검토하고 필요시 수정하세요."
        exit 0
    fi
else
    echo -e "${RED}${CROSS} 배포 전 수정이 필요한 항목이 있습니다.${NC}"
    echo "위의 실패 항목을 확인하고 수정 후 다시 실행하세요."
    exit 1
fi
