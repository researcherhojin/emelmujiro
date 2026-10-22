#!/usr/bin/env bash
# cspell:ignore ignorefile pkgs
set -euo pipefail

cd "$(dirname "$0")/.."
REPORT_DIR="${SECURITY_REPORT_DIR:-/tmp/emelmujiro-dependency-reports}"
mkdir -p "$REPORT_DIR"
FAILED=0
# npm and Trivy have different advisory databases; retain both checks.
npm audit --include=dev --audit-level=low --json > "$REPORT_DIR/npm.json" || FAILED=1
for target in package-lock.json backend/uv.lock docker/umami/pnpm-lock.yaml docker/umami/runner/pnpm-lock.yaml; do
  if [ ! -f "$target" ]; then
    echo "Missing lockfile: $target" >&2
    FAILED=1
    continue
  fi
  name="${target//\//-}"
  case "$target" in
    package-lock.json) expected=npm ;;
    backend/uv.lock) expected=uv ;;
    *) expected=pnpm ;;
  esac
  trivy fs --scanners vuln --include-dev-deps --ignorefile /dev/null \
    --ignore-unfixed=false --severity UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL \
    --format json --list-all-pkgs=true --exit-code 1 --timeout 10m \
    --output "$REPORT_DIR/$name.json" "$target" || FAILED=1
  node scripts/validate-security-scan.ts "$REPORT_DIR/$name.json" "$expected" || FAILED=1
done
exit "$FAILED"
