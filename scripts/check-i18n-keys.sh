#!/bin/bash
# Detect unused i18n keys in the codebase.
#
# Usage:
#   ./scripts/check-i18n-keys.sh            # informational (exit 0 even on unused)
#   ./scripts/check-i18n-keys.sh --strict   # CI mode (exit 1 on unused)
#
# Dynamic-key handling:
#   Keys accessed via template literals (e.g. `privacy.${section}.title`) are
#   skipped by detecting the prefix section before `.${` and excluding all
#   leaf keys under that section. Matches the CI logic in pr-checks.yml.

set -e

STRICT=0
[[ "${1:-}" == "--strict" ]] && STRICT=1

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

LOCALE_FILE="frontend/src/i18n/locales/ko.json"
SRC_DIR="frontend/src"

if [ ! -f "$LOCALE_FILE" ]; then
  echo "❌ $LOCALE_FILE not found"
  exit 1
fi

# Detect sections referenced via template literals so their leaves aren't flagged.
DYNAMIC_SECTIONS=$(grep -roh --include="*.ts" --include="*.tsx" '`[a-zA-Z]*\.\$' "$SRC_DIR" 2>/dev/null \
  | sed 's/`//;s/\.\$//' | sort -u | tr '\n' '|')

KEYS=$(node -e "
  const d = require('./$LOCALE_FILE');
  function leaves(o, p) {
    let r = [];
    for (const [k, v] of Object.entries(o)) {
      const key = p ? p + '.' + k : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        r = r.concat(leaves(v, key));
      } else {
        r.push(key);
      }
    }
    return r;
  }
  leaves(d, '').forEach(k => console.log(k));
")

UNUSED_COUNT=0
TOTAL_COUNT=0

[ $STRICT -eq 0 ] && echo "🔍 Checking i18n keys against source code..."

for key in $KEYS; do
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  SECTION=$(echo "$key" | cut -d. -f1)
  if echo "$DYNAMIC_SECTIONS" | grep -q "$SECTION"; then
    continue
  fi
  REFS=$(grep -r --include="*.ts" --include="*.tsx" -l "$key" "$SRC_DIR" 2>/dev/null \
    | grep -v "locales/" \
    | grep -v "__tests__/" \
    | grep -v "test-utils/" \
    | wc -l | tr -d ' ')
  if [ "$REFS" -eq 0 ]; then
    echo "⚠️  Unused i18n key: $key"
    UNUSED_COUNT=$((UNUSED_COUNT + 1))
  fi
done

if [ $STRICT -eq 1 ]; then
  if [ "$UNUSED_COUNT" -gt 0 ]; then
    echo "❌ $UNUSED_COUNT unused i18n key(s) found"
    exit 1
  fi
  echo "All i18n keys are referenced"
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Total keys: $TOTAL_COUNT"
  echo "Unused keys: $UNUSED_COUNT"
  if [ "$UNUSED_COUNT" -eq 0 ]; then
    echo "✅ All i18n keys are referenced in source code"
  else
    echo "⚠️  $UNUSED_COUNT unused keys found — verify before removing"
    echo ""
    echo "Note: Some keys may be used dynamically (template literals,"
    echo "error maps, etc.) and can't be detected by static grep."
  fi
fi
