#!/bin/bash
# Sync README shields.io version badges to frontend/package.json.
# Usage: ./scripts/sync-readme-badges.sh
#   - Run from repo root (or anywhere; resolves its own path)
#   - Write-counterpart to the read-only badge check in pr-checks.yml
#   - Idempotent: a no-op when badges already match. Never runs tests.
#
# Why anchor on "/badge/<Name>-": the badge label `i18next` is a substring of
# `React_i18next`, so an unanchored sed on `i18next-<ver>` would also rewrite the
# React_i18next badge. The `/badge/` URL prefix makes every label unambiguous.

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

# Badge label -> package.json dependency name.
# Order and mapping mirror pr-checks.yml's "Check README badge versions" step —
# keep the two lists in lockstep when adding a badged dependency.
BADGES=(
  "React:react"
  "TypeScript:typescript"
  "Vite:vite"
  "React_Router_DOM:react-router-dom"
  "Tailwind_CSS:tailwindcss"
  "Typography:@tailwindcss/typography"
  "i18next:i18next"
  "React_i18next:react-i18next"
  "Axios:axios"
  "TipTap:@tiptap/react"
  "DOMPurify:dompurify"
  "Vitest:vitest"
  "Testing_Library:@testing-library/react"
  "Playwright:@playwright/test"
)

CHANGED=0
for entry in "${BADGES[@]}"; do
  name="${entry%%:*}"
  pkg="${entry#*:}"
  pkg_ver=$(node -e "const p=require('./frontend/package.json'); console.log(((p.dependencies||{})['$pkg']||(p.devDependencies||{})['$pkg']||'').replace(/^[\^~]/,''))")
  if [ -z "$pkg_ver" ]; then
    echo "⚠️  $pkg not found in frontend/package.json — skipping $name badge"
    continue
  fi
  # Anchor on /badge/<name>- so labels that are substrings of others stay distinct.
  badge_ver=$(grep -oE "/badge/${name}-[0-9]+\.[0-9]+\.[0-9]+" README.md | head -1 | sed -E "s#/badge/${name}-##")
  if [ -z "$badge_ver" ]; then
    echo "⚠️  no /badge/${name}- badge in README.md — skipping"
    continue
  fi
  if [ "$pkg_ver" != "$badge_ver" ]; then
    sedi -E "s#(/badge/${name}-)[0-9]+\.[0-9]+\.[0-9]+#\1${pkg_ver}#" README.md
    echo "✓ ${name}: ${badge_ver} → ${pkg_ver}"
    CHANGED=$((CHANGED + 1))
  fi
done

if [ "$CHANGED" -eq 0 ]; then
  echo "All README badges already match frontend/package.json"
else
  echo "Updated $CHANGED badge(s)"
  git add README.md 2>/dev/null || true
fi
