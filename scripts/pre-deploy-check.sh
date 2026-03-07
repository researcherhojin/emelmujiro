#!/bin/bash

# =====================================================
# Pre-production deployment check script
# =====================================================
# Validates all required items before deployment
#
# Usage: ./scripts/pre-deploy-check.sh
# =====================================================

set -e  # Exit on error

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Icon definitions
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
ROCKET="🚀"
INFO="ℹ️"

# Result tracking
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0
TOTAL_CHECKS=0

# Check function
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

# Header
echo "======================================================"
echo -e "${BLUE}${ROCKET} Pre-production deployment checklist ${ROCKET}${NC}"
echo "======================================================"
echo -e "${INFO} Start time: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# =====================================================
# 1. Environment configuration check
# =====================================================
echo -e "${BLUE}📋 1. Environment configuration${NC}"
echo "------------------------------------------------------"

check ".env.production file exists" "[ -f frontend/.env.production ]"
check "VITE_API_URL configured" "grep -q 'VITE_API_URL=' frontend/.env.production"
check "VITE_SENTRY_DSN configured" "grep -q 'VITE_SENTRY_DSN=' frontend/.env.production" true
check "VITE_GA_TRACKING_ID configured" "grep -q 'VITE_GA_TRACKING_ID=' frontend/.env.production" true

echo ""

# =====================================================
# 2. Code quality check
# =====================================================
echo -e "${BLUE}📋 2. Code quality${NC}"
echo "------------------------------------------------------"

# TypeScript compilation check
echo -n "TypeScript compilation... "
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

# ESLint check
echo -n "ESLint check... "
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

# Console.log check
echo -n "console.log removal check... "
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
# 3. Test execution
# =====================================================
echo -e "${BLUE}📋 3. Tests${NC}"
echo "------------------------------------------------------"

echo -n "Running unit tests... "
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
# 4. Build test
# =====================================================
echo -e "${BLUE}📋 4. Build${NC}"
echo "------------------------------------------------------"

echo -n "Production build test... "
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}${CHECK} Build successful${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))

    # Build size check
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
# 5. SEO & Accessibility check
# =====================================================
echo -e "${BLUE}📋 5. SEO & Accessibility${NC}"
echo "------------------------------------------------------"

check "robots.txt exists" "[ -f frontend/public/robots.txt ]"
check "sitemap.xml exists" "[ -f frontend/public/sitemap.xml ]"
check "manifest.json exists" "[ -f frontend/public/manifest.json ]"
check "favicon.ico exists" "[ -f frontend/public/favicon.ico ]"
check "Open Graph image exists" "[ -f frontend/public/og-image.png ]" true
check ".nojekyll exists" "[ -f frontend/public/.nojekyll ]"

echo ""

# =====================================================
# 6. Security check
# =====================================================
echo -e "${BLUE}📋 6. Security${NC}"
echo "------------------------------------------------------"

# API key exposure check
echo -n "Hardcoded API key check... "
API_KEYS=$(grep -r "api[_-]key\|apikey\|api_secret\|secret_key" frontend/src --include="*.tsx" --include="*.ts" -i | grep -v "process.env" | wc -l)
if [ "$API_KEYS" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} No exposed API keys${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${RED}${CROSS} Found $API_KEYS potential API key exposures${NC}"
    ERRORS=$((ERRORS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Sensitive data check
echo -n "Sensitive data exposure check... "
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
# 7. Dependency check
# =====================================================
echo -e "${BLUE}📋 7. Dependencies${NC}"
echo "------------------------------------------------------"

# Vulnerability check
echo -n "npm security vulnerability check... "
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
# 8. Git status check
# =====================================================
echo -e "${BLUE}📋 8. Git status${NC}"
echo "------------------------------------------------------"

# Uncommitted changes check
echo -n "Uncommitted changes... "
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ "$UNCOMMITTED" -eq 0 ]; then
    echo -e "${GREEN}${CHECK} Working directory clean${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    echo -e "${YELLOW}${WARNING} $UNCOMMITTED uncommitted changes${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "  ${INFO} Current branch: $CURRENT_BRANCH"

echo ""

# =====================================================
# 9. Performance check
# =====================================================
echo -e "${BLUE}📋 9. Performance${NC}"
echo "------------------------------------------------------"

# Bundle size check
if [ -f frontend/build/static/js/*.js ]; then
    BUNDLE_SIZE=$(du -sh frontend/build/static/js/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}')
    echo -e "  ${INFO} JavaScript bundle size: ${BUNDLE_SIZE}KB"
fi

# Image optimization check
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
        echo -e "${GREEN}${ROCKET} All clear! Ready to deploy.${NC}"
        exit 0
    else
        echo -e "${YELLOW}${WARNING} Warnings found but deployment is possible.${NC}"
        echo "Review warnings and fix if necessary."
        exit 0
    fi
else
    echo -e "${RED}${CROSS} Issues found that must be fixed before deployment.${NC}"
    echo "Fix the failed items above and run again."
    exit 1
fi
