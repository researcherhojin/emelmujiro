#!/bin/bash
# Pass/warn cases for check-changelog.sh. Exits 1 if any case returns the wrong code.
# Usage: ./scripts/test-check-changelog.sh   (from any directory; needs git)
#
# Builds a throwaway repo in a temp dir, so the cases do not depend on this
# repo's history or on which branch is checked out.

set -u

SCRIPT="$(cd "$(dirname "$0")" && pwd)/check-changelog.sh"
fails=0
total=0

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# The CI runner has no identity, and a maintainer's global config may sign.
# cspell:ignore gpgsign -- git's config key, not a typo.
g() { git -C "$tmp" -c user.name=test -c user.email=test@example.com -c commit.gpgsign=false "$@"; }

# commit <path>... : write each path and commit them together; prints the new SHA.
commit() {
  local p
  for p in "$@"; do
    mkdir -p "$tmp/$(dirname "$p")"
    echo "$RANDOM" >>"$tmp/$p"
  done
  g add -- "$@" && g commit -q -m "test: $*" && g rev-parse HEAD
}

# check <expected-exit> <label> <base> <head>
check() {
  local expected=$1 label=$2 rc
  (cd "$tmp" && bash "$SCRIPT" "$3" "$4") >/dev/null 2>&1
  rc=$?
  total=$((total + 1))
  if [ "$rc" != "$expected" ]; then
    fails=$((fails + 1))
    printf 'FAIL: expected %s, got %s: %s\n' "$expected" "$rc" "$label"
  fi
}

g init -q -b main
base=$(commit README.md)

code=$(commit src/app.js)
check 1 'code only' "$base" "$code"

with_entry=$(commit CHANGELOG.md)
check 0 'code plus CHANGELOG.md' "$base" "$with_entry"

g checkout -q -b intents "$base"
intent=$(commit docs/intents/ci/x.md docs/intents/README.md)
check 0 'docs/intents/ only' "$base" "$intent"

check 0 'empty range' "$base" "$base"

mixed=$(commit src/app.js)
check 1 'docs/intents/ mixed with code' "$base" "$mixed"

# The exemption is docs/intents/, not docs/.
g checkout -q -b other-docs "$base"
other_docs=$(commit docs/other.md)
check 1 'docs/ outside docs/intents/' "$base" "$other_docs"

# A rename lists both sides, so moving code into docs/intents/ is not exempt.
# The file is moved unchanged, a 100% rename, so rename detection does fire.
g checkout -q -b move "$code"
mkdir -p "$tmp/docs/intents" && g mv src/app.js docs/intents/app.js
g commit -q -m 'test: move'
check 1 'code moved into docs/intents/' "$code" "$(g rev-parse HEAD)"

# A range git cannot read must fail loudly, never pass on zero files.
check 2 'unreadable range' "$base" 0123456789abcdef0123456789abcdef01234567

printf '%d cases, %d failed\n' "$total" "$fails"
[ "$fails" -eq 0 ]
