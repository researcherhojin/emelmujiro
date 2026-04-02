#!/bin/bash
# Update hardcoded test counts in README.md
# Usage: ./scripts/update-test-counts.sh (or: make update-test-counts)
#   - Run from repo root
#   - Counts frontend Vitest tests and updates README.md
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

echo "   Frontend: $FRONTEND_COUNT unit tests"

# Update README.md
# Format: "Vitest (1190 unit tests)" — update only the number
sedi -E "s/Vitest \([0-9]+ unit tests\)/Vitest (${FRONTEND_COUNT} unit tests)/g" README.md

echo "✅ Updated test counts in README.md"

# Stage if there are changes
if ! git diff --quiet README.md 2>/dev/null; then
  git add README.md
  echo "📋 Staged README.md"
else
  echo "ℹ️  No changes needed"
fi
