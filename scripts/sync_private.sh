#!/usr/bin/env bash
# Sync .private/ between MBP (dev) and Mac mini (production receiver).
#
# .private/ holds local-only operational notes (journal, secrets-setup,
# strategy) that are gitignored. They need manual sync because git won't
# carry them. See CLAUDE.md "Constraints" → opsec relocation.
#
# Usage:
#   ./scripts/sync_private.sh push   # MBP → Mac mini (default)
#   ./scripts/sync_private.sh pull   # Mac mini → MBP
#   ./scripts/sync_private.sh dry    # show what push would change, no transfer
#
# Override host via env: MACMINI_HOST=other-host.local ./scripts/sync_private.sh
#
# Safety:
#   - Never uses --delete. Files unique to either side are preserved.
#   - dry mode runs before any actual transfer in interactive use.

set -euo pipefail

REMOTE="${MACMINI_HOST:-Ehbebeui-Macmini.local}"
REMOTE_PATH="workspace/emelmujiro/.private/"
DIRECTION="${1:-push}"

if [ ! -d .private ]; then
  echo "ERROR: .private/ not found in $(pwd)" >&2
  echo "Run from repo root, or check that opsec relocation completed." >&2
  exit 1
fi

case "$DIRECTION" in
  push)
    echo "[sync_private] MBP → $REMOTE (no --delete; unique remote files preserved)"
    rsync -avz .private/ "$REMOTE:$REMOTE_PATH"
    ;;
  pull)
    echo "[sync_private] $REMOTE → MBP (no --delete; unique local files preserved)"
    rsync -avz "$REMOTE:$REMOTE_PATH" .private/
    ;;
  dry)
    echo "[sync_private] DRY RUN — MBP → $REMOTE (no actual transfer)"
    rsync -avz --dry-run .private/ "$REMOTE:$REMOTE_PATH"
    ;;
  *)
    echo "Usage: $0 [push|pull|dry]" >&2
    exit 1
    ;;
esac

echo "[sync_private] done"
