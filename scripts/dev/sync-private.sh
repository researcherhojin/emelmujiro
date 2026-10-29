#!/usr/bin/env bash
# Sync .private/ between MBP (dev) and Mac mini (production receiver).
#
# .private/ holds local-only operational notes (journal, secrets-setup,
# strategy) that are gitignored. They need manual sync because git won't
# carry them. See CLAUDE.md "Project Overview" and "Constraints" → Two-device sync helpers.
#
# Usage:
#   ./scripts/dev/sync-private.sh push   # MBP → Mac mini (default)
#   ./scripts/dev/sync-private.sh pull   # Mac mini → MBP
#   ./scripts/dev/sync-private.sh dry    # show what push would change, no transfer
#
# Host: MACMINI_HOST=<host> ./scripts/dev/sync-private.sh, or .private/sync-host
#
# Safety:
#   - Never uses --delete. Files unique to either side are preserved.
#   - dry mode runs before any actual transfer in interactive use.

set -euo pipefail

# The host name is not in the public repo: MACMINI_HOST wins, else the
# first line of .private/sync-host (gitignored; host details live in .private).
HOST_FILE="$(cd "$(dirname "$0")/../.." && pwd)/.private/sync-host"
REMOTE="${MACMINI_HOST:-$(head -n1 "$HOST_FILE" 2>/dev/null || true)}"
if [ -z "$REMOTE" ]; then
  echo "ERROR: set MACMINI_HOST or write the host name to .private/sync-host" >&2
  exit 1
fi
REMOTE_PATH="workspace/emelmujiro/.private/"
DIRECTION="${1:-push}"

if [ ! -d .private ]; then
  echo "ERROR: .private/ not found in $(pwd)" >&2
  echo "Run from repo root, or check that opsec relocation completed." >&2
  exit 1
fi

case "$DIRECTION" in
  push)
    echo "[sync-private] MBP → $REMOTE (no --delete; unique remote files preserved)"
    rsync -avz .private/ "$REMOTE:$REMOTE_PATH"
    ;;
  pull)
    echo "[sync-private] $REMOTE → MBP (no --delete; unique local files preserved)"
    rsync -avz "$REMOTE:$REMOTE_PATH" .private/
    ;;
  dry)
    echo "[sync-private] DRY RUN — MBP → $REMOTE (no actual transfer)"
    rsync -avz --dry-run .private/ "$REMOTE:$REMOTE_PATH"
    ;;
  *)
    echo "Usage: $0 [push|pull|dry]" >&2
    exit 1
    ;;
esac

echo "[sync-private] done"
