#!/usr/bin/env bash
# scripts/health-check.sh
#
# Docker service health diagnostic. Checks container status, resource usage,
# disk space, and application endpoints. Exits non-zero if any critical check
# fails — suitable for cron alerting.
#
# Usage:
#   ./scripts/health-check.sh           # Full report (interactive)
#   ./scripts/health-check.sh --quiet   # Only print failures (cron mode)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

QUIET=false
[[ "${1:-}" == "--quiet" ]] && QUIET=true

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
RESET=$'\033[0m'

FAILURES=0
WARNINGS=0

ok()   { $QUIET || printf "${GREEN}✓${RESET} %s\n" "$*"; }
warn() { printf "${YELLOW}⚠${RESET}  %s\n" "$*"; WARNINGS=$((WARNINGS + 1)); }
fail() { printf "${RED}✗${RESET} %s\n" "$*"; FAILURES=$((FAILURES + 1)); }

# ── 1. Container status ──
$QUIET || echo "── Containers ──"
for svc in backend frontend umami umami-db; do
  STATUS=$(docker compose ps --format '{{.Status}}' "$svc" 2>/dev/null || echo "not found")
  if echo "$STATUS" | grep -q "Up"; then
    if echo "$STATUS" | grep -q "unhealthy"; then
      fail "$svc: $STATUS"
    else
      ok "$svc: $STATUS"
    fi
  else
    fail "$svc: $STATUS"
  fi
done

# ── 2. Resource usage ──
$QUIET || echo ""
$QUIET || echo "── Resources ──"
while IFS= read -r line; do
  NAME=$(echo "$line" | awk '{print $1}')
  CPU=$(echo "$line" | awk '{print $2}' | tr -d '%')
  MEM_RAW=$(echo "$line" | awk '{print $3}')
  MEM_MB=$(echo "$MEM_RAW" | sed 's/MiB//' | sed 's/GiB/*1024/' | bc 2>/dev/null || echo "0")

  if (( $(echo "$MEM_MB > 1024" | bc -l 2>/dev/null || echo 0) )); then
    warn "$NAME: memory ${MEM_RAW} (>1GB)"
  elif (( $(echo "$CPU > 50" | bc -l 2>/dev/null || echo 0) )); then
    warn "$NAME: CPU ${CPU}%"
  else
    ok "$NAME: CPU ${CPU}% / ${MEM_RAW}"
  fi
done < <(docker stats --no-stream --format "{{.Name}} {{.CPUPerc}} {{.MemUsage}}" 2>/dev/null | sed 's| / .*||')

# ── 3. Disk usage ──
$QUIET || echo ""
$QUIET || echo "── Disk ──"
DISK_USED=$(df -h "$REPO_ROOT" | tail -1 | awk '{print $5}' | tr -d '%')
if [ "$DISK_USED" -gt 90 ]; then
  fail "Disk ${DISK_USED}% used (>90%)"
elif [ "$DISK_USED" -gt 80 ]; then
  warn "Disk ${DISK_USED}% used (>80%)"
else
  ok "Disk ${DISK_USED}% used"
fi

# Docker volumes
VOLUMES_SIZE=$(docker system df --format '{{.Size}}' 2>/dev/null | tail -1)
ok "Docker volumes: ${VOLUMES_SIZE:-unknown}"

# ── 4. Endpoint checks ──
$QUIET || echo ""
$QUIET || echo "── Endpoints ──"

# Backend health
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8000/api/health/ 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  ok "Backend /api/health/: $HTTP"
else
  fail "Backend /api/health/: $HTTP"
fi

# Frontend
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8080/ 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ]; then
  ok "Frontend /: $HTTP"
else
  fail "Frontend /: $HTTP"
fi

# Umami tracking API
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST http://localhost:8080/umami/api/send \
  -H "Content-Type: application/json" \
  -d '{"type":"event","payload":{"hostname":"test","language":"ko","referrer":"","screen":"0x0","title":"health","url":"/health","website":"test"}}' 2>/dev/null || echo "000")
if [ "$HTTP" = "200" ] || [ "$HTTP" = "400" ]; then
  ok "Umami /umami/api/send: $HTTP"
else
  fail "Umami /umami/api/send: $HTTP"
fi

# ── 5. Recent errors in logs ──
$QUIET || echo ""
$QUIET || echo "── Recent errors ──"
BACKEND_ERRORS=$(docker compose logs backend --since 1h 2>/dev/null | grep -c -E "ERROR|Traceback|CRITICAL" || true)
BACKEND_ERRORS=$((BACKEND_ERRORS + 0))
if [ "$BACKEND_ERRORS" -gt 10 ]; then
  warn "Backend: $BACKEND_ERRORS errors in last hour"
else
  ok "Backend: $BACKEND_ERRORS errors in last hour"
fi

UMAMI_ERRORS=$(docker compose logs umami --since 1h 2>/dev/null | grep -ci -E "error|exception|fatal" || true)
UMAMI_ERRORS=$((UMAMI_ERRORS + 0))
if [ "$UMAMI_ERRORS" -gt 5 ]; then
  warn "Umami: $UMAMI_ERRORS errors in last hour"
else
  ok "Umami: $UMAMI_ERRORS errors in last hour"
fi

# ── Summary ──
echo ""
if [ "$FAILURES" -gt 0 ]; then
  fail "Health check: $FAILURES failure(s), $WARNINGS warning(s)"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  warn "Health check: $WARNINGS warning(s), 0 failures"
  exit 0
else
  ok "All checks passed"
  exit 0
fi
