#!/bin/bash
# Sync README shields.io version badges to frontend/package.json (frontend) and
# backend/uv.lock (backend).
# Usage: ./scripts/sync-readme-badges.sh
#   - Run from repo root (or anywhere; resolves its own path)
#   - Write-counterpart to the read-only badge check in pr-checks.yml
#   - Idempotent: a no-op when badges already match. Never runs tests.
#
# Why anchor on "/badge/<Name>-": the badge label `i18next` is a substring of
# `React_i18next`, so an unanchored sed on `i18next-<ver>` would also rewrite the
# React_i18next badge. The `/badge/` URL prefix makes every label unambiguous.
#
# Why the backend reads uv.lock and not pyproject.toml: pyproject mixes exact
# pins (`gunicorn==26.0.0`) with floors (`coverage>=7.15.4`), and a floor is not
# the installed version. uv.lock records what is actually resolved, which is what
# a version badge claims.

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
  "React_Router:react-router"
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

# Badge label -> uv.lock package name, for the four backend runtime badges.
# These sat outside both drift gates until 2026-08-17: this script read only
# frontend/package.json and pr-checks.yml resolved every checked name through it,
# so nothing reported them stale and nothing healed them.
BACKEND_BADGES=(
  "Django:django"
  "DRF:djangorestframework"
  "SimpleJWT:djangorestframework-simplejwt"
  "Gunicorn:gunicorn"
)

# Read a resolved version out of backend/uv.lock.
# Matches the whole line so the `    { name = "django" },` entries inside other
# packages' `dependencies = [...]` blocks cannot be mistaken for the real record.
uv_lock_version() {
  awk -v pkg="$1" '
    /^\[\[package\]\]/ { in_pkg = 0 }
    $0 == "name = \"" pkg "\"" { in_pkg = 1; next }
    in_pkg && /^version = / { gsub(/[",]/, "", $3); print $3; exit }
  ' backend/uv.lock
}

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

# Backend badges. The version pattern is [0-9]+(\.[0-9]+){1,2} rather than the
# strict three-component form used above: PyPI ships two-component releases
# (Django's next minor is `6.1`, django-extensions is already `4.1`), so a
# hardcoded X.Y.Z would silently fail to match and report nothing.
for entry in "${BACKEND_BADGES[@]}"; do
  name="${entry%%:*}"
  pkg="${entry#*:}"
  pkg_ver=$(uv_lock_version "$pkg")
  if [ -z "$pkg_ver" ]; then
    echo "⚠️  $pkg not found in backend/uv.lock — skipping $name badge"
    continue
  fi
  badge_ver=$(grep -oE "/badge/${name}-[0-9]+(\.[0-9]+){1,2}" README.md | head -1 | sed -E "s#/badge/${name}-##")
  if [ -z "$badge_ver" ]; then
    echo "⚠️  no /badge/${name}- badge in README.md — skipping"
    continue
  fi
  if [ "$pkg_ver" != "$badge_ver" ]; then
    sedi -E "s#(/badge/${name}-)[0-9]+(\.[0-9]+){1,2}#\1${pkg_ver}#" README.md
    echo "✓ ${name}: ${badge_ver} → ${pkg_ver}"
    CHANGED=$((CHANGED + 1))
  fi
done

if [ "$CHANGED" -eq 0 ]; then
  echo "All README badges already match frontend/package.json and backend/uv.lock"
else
  echo "Updated $CHANGED badge(s)"
  git add README.md 2>/dev/null || true
fi
