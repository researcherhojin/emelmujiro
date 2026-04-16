#!/usr/bin/env bash
# Detect MBP / Mac mini / origin / production divergence at a glance.
#
# Runs from MBP. Reports ahead/behind counts for both machines vs origin/main,
# plus production HTTP last-modified so you can see if the live site is stale.
#
# Use BEFORE pushing or syncing to catch the "Mac mini has commits MBP didn't
# know about" scenario that bit us 2026-04-16 (10 commits on Mac mini that
# weren't on origin, would have been clobbered by a force-push). See
# .private/journal.md → Session History 2026-04-16.
#
# Override via env: MACMINI_HOST, MACMINI_REPO, PROD_URL.

set -euo pipefail

REMOTE="${MACMINI_HOST:-Ehbebeui-Macmini.local}"
REPO_PATH="${MACMINI_REPO:-workspace/emelmujiro}"
PROD_URL="${PROD_URL:-https://emelmujiro.com}"

# Fail fast if not in a git repo
git rev-parse --git-dir >/dev/null 2>&1 || { echo "ERROR: not in a git repo" >&2; exit 1; }

# Fail fast if SSH to Mac mini broken
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$REMOTE" 'true' 2>/dev/null; then
  echo "ERROR: SSH to $REMOTE failed (BatchMode + 5s timeout)" >&2
  echo "Check: ssh-agent, host key, or network. Override host: MACMINI_HOST=..." >&2
  exit 2
fi

echo "=== MBP local main vs origin/main ==="
git fetch origin --quiet
MBP_AHEAD=$(git rev-list --count "origin/main..main" 2>/dev/null || echo "?")
MBP_BEHIND=$(git rev-list --count "main..origin/main" 2>/dev/null || echo "?")
MBP_HEAD=$(git log --oneline -1)
echo "  ahead:  $MBP_AHEAD"
echo "  behind: $MBP_BEHIND"
echo "  HEAD:   $MBP_HEAD"

echo ""
echo "=== Mac mini ($REMOTE) main vs origin/main ==="
ssh "$REMOTE" "cd $REPO_PATH && git fetch origin --quiet && \
  echo '  ahead:  '\$(git rev-list --count origin/main..main 2>/dev/null || echo '?') && \
  echo '  behind: '\$(git rev-list --count main..origin/main 2>/dev/null || echo '?') && \
  echo '  HEAD:   '\$(git log --oneline -1)"

echo ""
echo "=== Production ($PROD_URL) ==="
PROD_LM=$(curl -sI --max-time 5 "$PROD_URL" 2>/dev/null | grep -i '^last-modified:' | tr -d '\r' || echo "(no response)")
echo "  ${PROD_LM:-(no last-modified header)}"

echo ""
echo "=== Verdict ==="
if [ "$MBP_AHEAD" = "0" ] && [ "$MBP_BEHIND" = "0" ]; then
  echo "  MBP aligned with origin"
else
  echo "  ⚠ MBP diverged: ahead=$MBP_AHEAD behind=$MBP_BEHIND"
fi
echo "  Mac mini status above ↑ — diverged if ahead/behind != 0"
echo "  Production last-modified should be within minutes of latest commit"
