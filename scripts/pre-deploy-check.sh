#!/bin/bash
set -e

# =====================================================
# Pre-production deployment check script
# =====================================================
# Validates all required items before deployment
#
# Usage: ./scripts/pre-deploy-check.sh
# =====================================================

# Resolve script directory and project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Result tracking
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0
TOTAL_CHECKS=0

# Reusable check function
check() {
    local description="$1"
    local command="$2"
    local is_warning="${3:-false}"

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  Checking: $description... "

    if bash -c "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Passed${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    elif [ "$is_warning" = true ]; then
        echo -e "${YELLOW}⚠️  Warning${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}❌ Failed${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Inline check (no check() — needs custom output)
inline_check() {
    local description="$1"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "  $description... "
}

pass()    { echo -e "${GREEN}✅ $1${NC}";    CHECKS_PASSED=$((CHECKS_PASSED + 1)); }
warn()    { echo -e "${YELLOW}⚠️  $1${NC}";  WARNINGS=$((WARNINGS + 1)); }
fail()    { echo -e "${RED}❌ $1${NC}";       ERRORS=$((ERRORS + 1)); }

# =====================================================
# Header
# =====================================================
echo "======================================================"
echo -e "${BLUE}🚀 Pre-production deployment checklist${NC}"
echo "======================================================"
echo -e "ℹ️  Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# =====================================================
# 1. Environment configuration
# =====================================================
echo -e "${BLUE}📋 1. Environment configuration${NC}"
check ".env.production file exists" "[ -f frontend/.env.production ]"
check "VITE_API_URL configured" "grep -q 'VITE_API_URL=' frontend/.env.production"
check "VITE_SENTRY_DSN configured" "grep -q 'VITE_SENTRY_DSN=' frontend/.env.production" true
check "VITE_GA_TRACKING_ID configured" "grep -q 'VITE_GA_TRACKING_ID=' frontend/.env.production" true
echo ""

# =====================================================
# 2. Code quality + 3. Tests (run in parallel)
# =====================================================
echo -e "${BLUE}📋 2. Code quality & Tests (parallel)${NC}"

# Run TypeScript, ESLint, and Tests concurrently
TSC_RESULT_FILE=$(mktemp)
ESLINT_RESULT_FILE=$(mktemp)
TEST_RESULT_FILE=$(mktemp)

(cd frontend && npx tsc -p tsconfig.build.json --noEmit 2>/dev/null; echo $? > "$TSC_RESULT_FILE") &
PID_TSC=$!

(cd frontend && npx eslint src --quiet 2>"$ESLINT_RESULT_FILE.out" 1>"$ESLINT_RESULT_FILE.out"; echo $? > "$ESLINT_RESULT_FILE") &
PID_ESLINT=$!

(cd frontend && npx vitest run 2>&1 > "$TEST_RESULT_FILE.out"; echo $? > "$TEST_RESULT_FILE") &
PID_TEST=$!

# Wait for all parallel tasks
wait $PID_TSC $PID_ESLINT $PID_TEST

# Report TypeScript results
inline_check "TypeScript compilation"
if [ "$(cat "$TSC_RESULT_FILE")" -eq 0 ]; then
    pass "No errors"
else
    fail "TypeScript errors found"
fi

# Report ESLint results
inline_check "ESLint check"
ESLINT_OUTPUT=$(cat "$ESLINT_RESULT_FILE.out" 2>/dev/null || true)
if [ -z "$ESLINT_OUTPUT" ]; then
    pass "No errors"
else
    ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c "error" || true)
    ESLINT_WARNS=$(echo "$ESLINT_OUTPUT" | grep -c "warning" || true)
    warn "${ESLINT_ERRORS} errors, ${ESLINT_WARNS} warnings"
fi

# Report console.log check (instant, no need to parallelize)
inline_check "console.log removal"
CONSOLE_LOGS=$(grep -r "console\.log" frontend/src --include="*.tsx" --include="*.ts" --exclude-dir=__tests__ --exclude-dir=test-utils --exclude-dir=__mocks__ 2>/dev/null | grep -v "utils/logger\.ts" | wc -l | tr -d ' ')
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    pass "No console.log found"
else
    warn "Found $CONSOLE_LOGS console.log statements"
fi

# Report test results
inline_check "Running unit tests"
TEST_OUTPUT=$(cat "$TEST_RESULT_FILE.out" 2>/dev/null || true)
TEST_PASSED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
TEST_FAILED=$(echo "$TEST_OUTPUT" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")
if [ "$TEST_FAILED" -eq 0 ]; then
    pass "All tests passed ($TEST_PASSED tests)"
else
    warn "$TEST_FAILED tests failed, $TEST_PASSED passed"
fi

# Cleanup temp files
rm -f "$TSC_RESULT_FILE" "$ESLINT_RESULT_FILE" "$ESLINT_RESULT_FILE.out" "$TEST_RESULT_FILE" "$TEST_RESULT_FILE.out"
echo ""

# =====================================================
# 4. Build
# =====================================================
echo -e "${BLUE}📋 4. Build${NC}"

inline_check "Production build test"
if (cd frontend && npm run build > /dev/null 2>&1); then
    pass "Build successful"
    BUILD_SIZE=$(du -sh frontend/build 2>/dev/null | cut -f1)
    echo -e "  ℹ️  Build size: $BUILD_SIZE"
else
    fail "Build failed"
fi
echo ""

# =====================================================
# 5. SEO & Accessibility
# =====================================================
echo -e "${BLUE}📋 5. SEO & Accessibility${NC}"
check "robots.txt exists" "[ -f frontend/public/robots.txt ]"
check "sitemap.xml exists" "[ -f frontend/public/sitemap.xml ]"
check "manifest.json exists" "[ -f frontend/public/manifest.json ]"
check "favicon.ico exists" "[ -f frontend/public/favicon.ico ]"
check "Open Graph image exists" "[ -f frontend/public/og-image.png ]" true
check ".nojekyll exists" "[ -f frontend/public/.nojekyll ]"
echo ""

# =====================================================
# 6. Security
# =====================================================
echo -e "${BLUE}📋 6. Security${NC}"

inline_check "Hardcoded API key check"
API_KEYS=$(grep -rE "api[_-]?key|api_secret|secret_key" frontend/src --include="*.tsx" --include="*.ts" -i 2>/dev/null | grep -v "import\.meta\.env\|process\.env\|getEnvVar\|interface \|type " | wc -l | tr -d ' ')
if [ "$API_KEYS" -eq 0 ]; then
    pass "No exposed API keys"
else
    fail "Found $API_KEYS potential API key exposures"
fi
echo ""

# =====================================================
# 7. Dependencies
# =====================================================
echo -e "${BLUE}📋 7. Dependencies${NC}"

inline_check "npm security vulnerability check"
AUDIT_OUTPUT=$(cd frontend && npm audit --omit=dev 2>&1 || true)
VULNERABILITIES=$(echo "$AUDIT_OUTPUT" | grep -oE "[0-9]+ vulnerabilities" | grep -oE "[0-9]+" || echo "0")
if [ "$VULNERABILITIES" -eq 0 ]; then
    pass "No vulnerabilities"
else
    warn "Found $VULNERABILITIES vulnerabilities"
fi
echo ""

# =====================================================
# 8. Git status
# =====================================================
echo -e "${BLUE}📋 8. Git status${NC}"

inline_check "Uncommitted changes"
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -eq 0 ]; then
    pass "Working directory clean"
else
    warn "$UNCOMMITTED uncommitted changes"
fi

CURRENT_BRANCH=$(git branch --show-current)
echo -e "  ℹ️  Current branch: $CURRENT_BRANCH"
echo ""

# =====================================================
# 9. Performance
# =====================================================
echo -e "${BLUE}📋 9. Performance${NC}"

# Bundle size check (Vite outputs to build/assets/, not build/static/js/)
if ls frontend/build/assets/*.js &>/dev/null; then
    BUNDLE_SIZE=$(du -sh frontend/build/assets/ 2>/dev/null | cut -f1)
    echo -e "  ℹ️  JavaScript bundle size: ${BUNDLE_SIZE}"
fi

inline_check "Image optimization"
LARGE_IMAGES=$(find frontend/public \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -size +500k 2>/dev/null | wc -l | tr -d ' ')
if [ "$LARGE_IMAGES" -eq 0 ]; then
    pass "All images optimized (<500KB)"
else
    warn "Found $LARGE_IMAGES large images (>500KB)"
fi
echo ""

# =====================================================
# Final results
# =====================================================
echo "======================================================"
echo -e "${BLUE}📊 Results${NC}"
echo "======================================================"

PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

echo -e "Total checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $ERRORS${NC}"
echo -e "Pass rate: ${PERCENTAGE}%"
echo ""

if [ "$ERRORS" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}🚀 All clear! Ready to deploy.${NC}"
    else
        echo -e "${YELLOW}⚠️  Warnings found but deployment is possible.${NC}"
        echo "Review warnings and fix if necessary."
    fi
    exit 0
else
    echo -e "${RED}❌ Issues found that must be fixed before deployment.${NC}"
    echo "Fix the failed items above and run again."
    exit 1
fi
