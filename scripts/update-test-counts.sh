#!/bin/bash
# Update hardcoded test counts in README.md and CLAUDE.md
# Usage: ./scripts/update-test-counts.sh
#   - Run from repo root
#   - Automatically counts frontend (Vitest) and backend (Django) tests
#   - Updates README.md and CLAUDE.md with new counts
#   - Stages the changed files for commit

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

# Count backend tests
BACKEND_OUTPUT=$(cd backend && DATABASE_URL="" uv run python manage.py test api -v 0 2>&1)
BACKEND_COUNT=$(echo "$BACKEND_OUTPUT" | grep -oE 'Ran [0-9]+' | grep -oE '[0-9]+')

if [ -z "$FRONTEND_COUNT" ] || [ -z "$BACKEND_COUNT" ]; then
  echo "❌ Failed to count tests"
  echo "   Frontend: ${FRONTEND_COUNT:-unknown}"
  echo "   Backend: ${BACKEND_COUNT:-unknown}"
  exit 1
fi

echo "   Frontend: $FRONTEND_COUNT tests"
echo "   Backend: $BACKEND_COUNT tests"

# Format with comma separator for display (e.g., 1237 -> 1,237)
if command -v printf >/dev/null 2>&1; then
  FRONTEND_DISPLAY=$(printf "%'d" "$FRONTEND_COUNT" 2>/dev/null || echo "$FRONTEND_COUNT")
else
  FRONTEND_DISPLAY="$FRONTEND_COUNT"
fi

# Count frontend test files for README (test suites = files)
FRONTEND_FILES=$(find frontend/src -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' | wc -l | tr -d ' ')
E2E_FILES=$(find frontend/e2e -name '*.spec.ts' 2>/dev/null | wc -l | tr -d ' ')

echo "   Frontend test suites: $FRONTEND_FILES files"
echo "   E2E specs: $E2E_FILES files"

# Update README.md
sedi -E "s/[0-9]+ test suites \(Vitest\)/${FRONTEND_FILES} test suites (Vitest)/g" README.md
sedi -E "s/[0-9]+ E2E specs \(Playwright\)/${E2E_FILES} E2E specs (Playwright)/g" README.md
sedi -E "s/[0-9,]+ backend tests \(Django\)/${BACKEND_COUNT} backend tests (Django)/g" README.md

echo "✅ Updated test counts in README.md and CLAUDE.md"

# Stage if there are changes
if ! git diff --quiet README.md CLAUDE.md 2>/dev/null; then
  git add README.md CLAUDE.md
  echo "📋 Staged README.md and CLAUDE.md"
else
  echo "ℹ️  No changes needed"
fi
