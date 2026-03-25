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

# Update README.md — matches "N,NNN unit tests" or "NNN unit tests" and "NNN backend tests"
sedi -E "s/[0-9,]+ unit tests \(Vitest\)/${FRONTEND_DISPLAY} unit tests (Vitest)/g" README.md
sedi -E "s/[0-9,]+ backend tests \(Django\)/${BACKEND_COUNT} backend tests (Django)/g" README.md

# Update CLAUDE.md — matches "N,NNN tests), 10 E2E" and "NNN backend tests"
sedi -E "s/[0-9,]+ tests\), 10 E2E/${FRONTEND_DISPLAY} tests), 10 E2E/g" CLAUDE.md
sedi -E "s/[0-9,]+ backend tests/${BACKEND_COUNT} backend tests/g" CLAUDE.md

echo "✅ Updated test counts in README.md and CLAUDE.md"

# Stage if there are changes
if ! git diff --quiet README.md CLAUDE.md 2>/dev/null; then
  git add README.md CLAUDE.md
  echo "📋 Staged README.md and CLAUDE.md"
else
  echo "ℹ️  No changes needed"
fi
