#!/bin/bash
# Warn when a range of commits ships changes without a CHANGELOG.md entry.
# Usage: ./scripts/repo/check-changelog.sh <base> <head>
#   - Compares <base>...<head> (three dots: from the merge base, so commits
#     that landed on <base> after the branch was cut are not counted).
#   - Exits 0 if the range changes CHANGELOG.md, is empty, or changes only
#     exempt paths; 1 otherwise, after listing the changed paths; 2 on a usage
#     error or a range git cannot read.
#
# Single source of truth: the .husky/pre-push hook (direct pushes to main) and
# the "Check CHANGELOG entry" step in .github/workflows/pr-checks.yml both call
# this. Change the exempt list here, never in a caller.
# Rule and rationale: .claude/rules/ci.md, "CHANGELOG entry".

set -e

if [ $# -ne 2 ]; then
  echo "Usage: $0 <base> <head>" >&2
  exit 2
fi

base=$1
head=$2

# The exit code must be checked separately: `set -e` does not fire on a failing
# command substitution (Gotcha #11), and an unreadable range (a force-push, a
# base that was never fetched) would otherwise read as zero files and pass.
# --no-renames lists both sides of a rename. Without it only the destination
# is listed, so moving code into docs/intents/ would read as an exempt change.
if ! files=$(git diff --name-only --no-renames "$base...$head"); then
  echo "❌ Could not read the changed files in $base...$head" >&2
  exit 2
fi

[ -z "$files" ] && exit 0

needs_entry=0
while IFS= read -r path; do
  case "$path" in
    CHANGELOG.md)
      exit 0
      ;;
    # Intent records link to their CHANGELOG entry instead of repeating it
    # (docs/intents/README.md, Rules). `*` matches across `/` in a case
    # pattern, so nested module folders are covered.
    docs/intents/*) ;;
    *)
      needs_entry=1
      ;;
  esac
done <<<"$files"

[ "$needs_entry" -eq 0 ] && exit 0

echo "⚠️  No CHANGELOG.md entry in $base...$head, which changes:"
printf '%s\n' "$files" | sed 's/^/    /'
echo ""
echo "Add an entry under '## Merged since [1.0.0]' (CLAUDE.md, Development Flow)."
exit 1
