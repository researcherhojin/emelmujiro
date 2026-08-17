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
  # Cut at the `git commit -v` scissors line FIRST. Without that cut, a buffer
  # whose subject is empty falls through the comment/blank filters and lands on
  # the first diff line, so the message reported back is `diff --git a/x b/x`
  # instead of "empty". sed stops at the marker; grep then drops comment and
  # blank lines and takes the first survivor.
  subject=$(sed '/^# -\{1,\} >8 -\{1,\}$/q' "$1" | grep -v '^#' | grep -m1 -v '^[[:space:]]*$' || true)
  if [ -z "$subject" ]; then
    echo "❌ Empty commit message."
    exit 1
  fi
else
  subject="$1"
fi

# Merge commits: git generates the subject, and it is never conventional.
# The trailing space matters — a bare `^Merge` also exempts `Mergeevil`.
# cspell:ignore Mergeevil depsnot -- deliberate counter-examples in the comments
# below, showing what each anchor prevents. Not words; kept out of cspell.json.
if [[ "$subject" =~ ^Merge\  ]]; then
  exit 0
fi

# Autosquash markers: git rewrites these away during `rebase --autosquash`,
# so the subject that finally lands is the target commit's, already validated.
if [[ "$subject" =~ ^(fixup|squash|amend)! ]]; then
  exit 0
fi

# Revert commits: `git revert` generates exactly `Revert "<original subject>"`.
# Anchored at both ends so hand-written text after the closing quote is judged.
if [[ "$subject" =~ ^Revert\ \".+\"$ ]]; then
  exit 0
fi

# Dependabot writes its own format, which predates this check and is exempt.
# The scope is pinned to (deps) / (deps-dev) — the five forms this repo has
# actually received. An unanchored `^chore\(deps` also exempts `chore(depsnot):`.
if [[ "$subject" =~ ^Bump\ [^[:space:]]+\ from\ |^(build|chore|ci|deps|deps-dev)\(deps(-dev)?\):\  ]]; then
  exit 0
fi

# English only, per CONTRIBUTING.md. Checked after the exemptions so a bot or
# merge subject is never judged on charset. Use --no-verify if a subject
# genuinely must carry a non-ASCII proper noun.
if LC_ALL=C grep -q '[^[:print:][:space:]]' <<<"$subject"; then
  echo "❌ Non-ASCII characters in commit subject: $subject"
  echo ""
  echo "Commit messages are English only. See CONTRIBUTING.md."
  echo "If the subject genuinely needs a non-ASCII proper noun: git commit --no-verify"
  exit 1
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
