#!/bin/bash
# Validate one commit subject against the project's Conventional Commits rules.
# Usage: ./scripts/check-commit-msg.sh <subject-or-message-file>
#   - Argument is a literal subject line, or a path to a message file
#     (.git/COMMIT_EDITMSG), in which case the first non-comment line is used.
#   - Exits 0 if the subject is valid or exempt, 1 otherwise.
#
# Single source of truth: the .husky/commit-msg hook and the "Check commit
# messages" step in .github/workflows/pr-checks.yml both call this. Changing
# the accepted types here changes both — do not re-inline the regex anywhere.
# Keep the type list in sync with CLAUDE.md "Code Conventions" and CONTRIBUTING.md.

set -e

# deps-dev precedes deps so the longer type wins the alternation.
TYPES="feat|fix|docs|style|refactor|test|chore|perf|deps-dev|deps|ci"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <subject-or-message-file>" >&2
  exit 2
fi

if [ -f "$1" ]; then
  # First line that is neither blank nor a scissors/comment line. `git commit
  # -v` appends a diff below those, so anything past the subject is ignored.
  subject=$(grep -v '^#' "$1" | grep -m1 -v '^[[:space:]]*$' || true)
else
  subject="$1"
fi

# Merge commits: git generates the subject, and it is never conventional.
if [[ "$subject" =~ ^Merge ]]; then
  exit 0
fi

# Autosquash markers: git rewrites these away during `rebase --autosquash`,
# so the subject that finally lands is the target commit's, already validated.
if [[ "$subject" =~ ^(fixup|squash|amend)! ]]; then
  exit 0
fi

# Revert commits: `git revert` generates `Revert "<original subject>"`.
if [[ "$subject" =~ ^Revert\ \" ]]; then
  exit 0
fi

# Dependabot writes its own format, which predates this check and is exempt.
if [[ "$subject" =~ ^Bump\ |^build\(deps|^chore\(deps|^ci\(deps|^deps-dev\(deps|^deps\(deps ]]; then
  exit 0
fi

if [[ ! "$subject" =~ ^($TYPES)(\(.+\))?:\ .+ ]]; then
  echo "❌ Invalid commit message: $subject"
  echo ""
  echo "Expected: type(scope): description   (scope optional, description required)"
  echo "Types:    ${TYPES//|/ }"
  echo ""
  echo "English only. See CONTRIBUTING.md."
  exit 1
fi
