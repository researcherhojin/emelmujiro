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
  # instead of "empty". sed stops at the marker; grep then drops comment lines.
  message=$(sed '/^# -\{1,\} >8 -\{1,\}$/q' "$1" | grep -v '^#' || true)
else
  # A caller may pass a bare subject or a whole multi-line message. The CI step
  # passes whole messages (git log --format=%B -z), the husky hook passes a file.
  message="$1"
fi

# First non-blank line. The body checks below need the rest of the message, so
# the two are kept separate rather than collapsing to a subject as before.
subject=$(printf '%s\n' "$message" | grep -m1 -v '^[[:space:]]*$' || true)
if [ -z "$subject" ]; then
  echo "❌ Empty commit message."
  exit 1
fi

# CI-skip markers, checked against the WHOLE message and BEFORE every exemption
# below. GitHub parses the entire commit message — subject and body alike — so
# prose *describing* the trap triggers it. Measured across this repo's history:
# 10 commits carried a marker in the body only, 8 of them have zero check-runs,
# and 7 of those 8 are on main. `66cef64b`, the commit that fixed the deploy
# path, is one of them: it shipped untested by riding the mechanism it fixed.
#
# Order matters. Running this after the merge/revert/dependabot exemptions would
# let `Revert "docs: explain the marker"` carry one straight through.
#
# The escaped form CLAUDE.md Gotcha #10 prescribes stays legal. Rather than a
# lookbehind (BSD grep on macOS has no -P, and the husky hook runs there), the
# escaped pairs are rewritten to parentheses first, so only bare brackets match.
SKIP_MARKERS='skip[[:space:]]+ci|ci[[:space:]]+skip|no[[:space:]]+ci|skip[[:space:]]+actions|actions[[:space:]]+skip'
# The one legitimate producer: the generated commit in main-ci-cd.yml's
# "Sync README Badges" job. Exempted by SHAPE, not by its exact current text —
# `chore(readme):` scope, marker as the final token of the subject, and no body.
# An exact string was tried first and is too brittle: the generated message has
# already changed twice (`...auto-sync test counts [skip ci]` and
# `...sync axios badge to 1.18.1 [skip ci]` both exist on main), so pinning the
# current wording would redden the bot the next time that line is edited. The
# no-body requirement is what keeps this narrow — prose explaining the marker
# has a body, and the bot's `git commit -m` never does.
README_SYNC_SUBJECT_RE='^chore\(readme\): .+ \[skip ci\]$'
body=$(printf '%s\n' "$message" | tail -n +2 | tr -d '[:space:]')

if [[ "$subject" =~ $README_SYNC_SUBJECT_RE ]] && [ -z "$body" ]; then
  is_readme_sync=1
else
  is_readme_sync=0
fi

if [ "$is_readme_sync" -eq 0 ]; then
  unescaped=$(printf '%s\n' "$message" | sed 's/\\\[/(/g; s/\\\]/)/g')
  if printf '%s\n' "$unescaped" | grep -Eqi "\[[[:space:]]*($SKIP_MARKERS)[[:space:]]*\]"; then
    echo "❌ Commit message contains a CI-skip marker."
    echo ""
    echo "GitHub Actions parses the WHOLE message, so this commit would skip CI"
    echo "entirely — including in the body, where it is usually accidental."
    echo ""
    echo "To write about the marker, escape the brackets: \\[skip ci\\]"
    echo "If you genuinely intend to skip CI: git commit --no-verify"
    exit 1
  fi
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
