#!/bin/bash
# Detect unused i18n keys in the codebase
# Usage: ./scripts/check-i18n-keys.sh
#   - Extracts all leaf keys from ko.json
#   - Searches frontend/src/ for usage of each key
#   - Reports keys with zero references
#
# Known limitations:
#   - Cannot detect dynamically constructed keys (e.g., template literals)
#   - teachingHistory.N.{org,title} keys are checked by prefix pattern

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

LOCALE_FILE="frontend/src/i18n/locales/ko.json"
SRC_DIR="frontend/src"
UNUSED_COUNT=0
TOTAL_COUNT=0

if [ ! -f "$LOCALE_FILE" ]; then
  echo "❌ $LOCALE_FILE not found"
  exit 1
fi

echo "🔍 Checking i18n keys against source code..."
echo ""

# Extract all leaf keys from JSON
KEYS=$(node -e "
  const data = require('./$LOCALE_FILE');
  function getLeafKeys(obj, prefix) {
    let keys = [];
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? prefix + '.' + k : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        keys = keys.concat(getLeafKeys(v, key));
      } else {
        keys.push(key);
      }
    }
    return keys;
  }
  getLeafKeys(data, '').forEach(k => console.log(k));
")

for key in $KEYS; do
  TOTAL_COUNT=$((TOTAL_COUNT + 1))

  # Search for the key in source code (excluding locale JSON files and test files)
  # Match patterns: t('key'), t("key"), i18n.t('key'), 'key' in error maps
  REFS=$(grep -r --include="*.ts" --include="*.tsx" -l "$key" "$SRC_DIR" 2>/dev/null \
    | grep -v "locales/" \
    | grep -v "__tests__/" \
    | grep -v "test-utils/" \
    | wc -l | tr -d ' ')

  if [ "$REFS" -eq 0 ]; then
    echo "  ⚠️  $key"
    UNUSED_COUNT=$((UNUSED_COUNT + 1))
  fi
done

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
