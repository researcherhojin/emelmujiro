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

# Count frontend tests (macOS compatible — no grep -P).
# `if !` captures the exit code so set -e doesn't mask a failing test run.
if ! FRONTEND_OUTPUT=$(cd frontend && CI=true npx vitest run 2>&1); then
  echo "❌ Frontend tests failed — not updating README"
  echo "$FRONTEND_OUTPUT" | tail -20
  exit 1
fi
FRONTEND_COUNT=$(echo "$FRONTEND_OUTPUT" | grep -E '[0-9]+ passed' | tail -1 | sed -E 's/.*[^0-9]([0-9]+) passed.*/\1/')

if [ -z "$FRONTEND_COUNT" ]; then
  echo "❌ Failed to count frontend tests"
  exit 1
fi

echo "   Frontend: $FRONTEND_COUNT tests"

# Count backend tests
if ! BACKEND_OUTPUT=$(cd backend && DATABASE_URL="" uv run python manage.py test 2>&1); then
  echo "❌ Backend tests failed — not updating README"
  echo "$BACKEND_OUTPUT" | tail -20
  exit 1
fi
BACKEND_COUNT=$(echo "$BACKEND_OUTPUT" | grep -E 'Found [0-9]+ test' | sed -E 's/Found ([0-9]+) test.*/\1/')

if [ -z "$BACKEND_COUNT" ]; then
  echo "❌ Failed to count backend tests"
  exit 1
fi

echo "   Backend: $BACKEND_COUNT tests"

# Update README.md — two patterns:
# 1. "Vitest (N tests)" in Testing line
sedi -E "s/Vitest \([0-9]+ tests\)/Vitest (${FRONTEND_COUNT} tests)/g" README.md
# 2. "Django unittest (N tests)" in Testing line
sedi -E "s/Django unittest \([0-9]+ tests\)/Django unittest (${BACKEND_COUNT} tests)/g" README.md

# Loud-fail: verify the expected patterns still exist in README after substitution.
# If a README format change silently broke the sed regex, none of the patterns would
# match and the counts would drift without anyone noticing (happened once: 03f8ed7).
MATCH_COUNT=0
grep -qE 'Vitest \([0-9]+ tests\)' README.md && MATCH_COUNT=$((MATCH_COUNT + 1))
grep -qE 'Django unittest \([0-9]+ tests\)' README.md && MATCH_COUNT=$((MATCH_COUNT + 1))

if [[ "$MATCH_COUNT" -lt 2 ]]; then
  echo "❌ Expected 2 test-count patterns in README.md but found $MATCH_COUNT."
  echo "   The README format may have changed — update the sed patterns in this script."
  echo "   See CLAUDE.md 'README drift gates' for the expected format."
  exit 1
fi

echo "✅ Updated test counts in README.md (${FRONTEND_COUNT} frontend + ${BACKEND_COUNT} backend)"

# Stage if there are changes
if ! git diff --quiet README.md 2>/dev/null; then
  git add README.md
  echo "📋 Staged README.md"
else
  echo "ℹ️  No changes needed"
fi
