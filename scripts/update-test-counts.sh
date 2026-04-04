#!/bin/bash
# Update hardcoded test counts in README.md
# Usage: ./scripts/update-test-counts.sh (or: make update-test-counts)
#   - Run from repo root
#   - Counts frontend (Vitest) and backend (Django) tests, updates README.md
#   - Stages the changed file for commit

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Cross-platform sed -i (macOS requires '' suffix, Linux does not)
sedi() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "$@"
  else
    sed -i "$@"
  fi
}

echo "🧪 Counting tests..."

# Count frontend tests (macOS compatible — no grep -P)
FRONTEND_OUTPUT=$(cd frontend && CI=true npx vitest run 2>&1)
FRONTEND_COUNT=$(echo "$FRONTEND_OUTPUT" | grep -E '[0-9]+ passed' | tail -1 | sed -E 's/.*[^0-9]([0-9]+) passed.*/\1/')

if [ -z "$FRONTEND_COUNT" ]; then
  echo "❌ Failed to count frontend tests"
  exit 1
fi

echo "   Frontend: $FRONTEND_COUNT tests"

# Count backend tests
BACKEND_OUTPUT=$(cd backend && DATABASE_URL="" uv run python manage.py test 2>&1)
BACKEND_COUNT=$(echo "$BACKEND_OUTPUT" | grep -E 'Found [0-9]+ test' | sed -E 's/Found ([0-9]+) test.*/\1/')

if [ -z "$BACKEND_COUNT" ]; then
  echo "❌ Failed to count backend tests"
  exit 1
fi

echo "   Backend: $BACKEND_COUNT tests"

# Update README.md — three patterns:
# 1. "Vitest (N tests)" in Testing line
sedi -E "s/Vitest \([0-9]+ tests\)/Vitest (${FRONTEND_COUNT} tests)/g" README.md
# 2. "Django unittest (N tests)" in Testing line
sedi -E "s/Django unittest \([0-9]+ tests\)/Django unittest (${BACKEND_COUNT} tests)/g" README.md
# 3. "tests (N frontend + N backend)" in CI/CD line
sedi -E "s/tests \([0-9]+ frontend \+ [0-9]+ backend\)/tests (${FRONTEND_COUNT} frontend + ${BACKEND_COUNT} backend)/g" README.md

echo "✅ Updated test counts in README.md (${FRONTEND_COUNT} frontend + ${BACKEND_COUNT} backend)"

# Stage if there are changes
if ! git diff --quiet README.md 2>/dev/null; then
  git add README.md
  echo "📋 Staged README.md"
else
  echo "ℹ️  No changes needed"
fi
