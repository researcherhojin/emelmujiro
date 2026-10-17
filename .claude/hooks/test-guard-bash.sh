#!/bin/bash
# Block/allow cases for guard-bash.sh. Exits 1 if any case returns the wrong code.
# Usage: ./.claude/hooks/test-guard-bash.sh   (from any directory; needs jq, perl, git)
#
# Every guard needs at least one block case and one allow case that sits next
# to it (`npm audit` beside `npm audit fix`), or a too-broad pattern passes.

set -u

HOOK="$(cd "$(dirname "$0")" && pwd)/guard-bash.sh"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fails=0
total=0

# check <expected-exit> <cwd> <command>
check() {
  local expected=$1 cwd=$2 cmd=$3 rc
  jq -n --arg c "$cmd" --arg d "$cwd" '{tool_input: {command: $c}, cwd: $d}' |
    bash "$HOOK" 2>/dev/null
  rc=$?
  total=$((total + 1))
  if [ "$rc" != "$expected" ]; then
    fails=$((fails + 1))
    printf 'FAIL: expected %s, got %s (cwd %s): %s\n' "$expected" "$rc" "$cwd" "$cmd"
  fi
}

# Gotcha #6
check 2 "$ROOT" 'npm audit fix'
check 2 "$ROOT" 'cd frontend && npm audit fix --force'
check 2 "$ROOT" "$(printf 'cat <<EOF > x\nhi\nEOF\nnpm audit fix')"
check 0 "$ROOT" 'npm audit'
check 0 "$ROOT" 'npm audit --json | jq .metadata'
check 0 "$ROOT" "grep -n 'npm audit fix' CLAUDE.md"
check 0 "$ROOT" 'git commit -m "docs: never run npm audit fix"'
check 0 "$ROOT" "git commit -m \"docs: don't run it\" && echo 'npm audit fix is banned'"
check 0 "$ROOT" "$(printf "git commit -F - <<'MSG'\nfeat: block npm audit fix and rm -rf frontend/build\nMSG")"

# Constraints > Deployment
check 2 "$ROOT" 'rm -rf frontend/build'
check 2 "$ROOT" 'rm -rf frontend/build/'
check 2 "$ROOT" 'rm -rf ./frontend/build && npm run build'
check 2 "$ROOT/frontend" 'rm -rf build'
check 2 "$ROOT" 'cd frontend && rm -rf build'
check 2 "$ROOT" 'rm -rf "frontend/build"'
check 2 "$ROOT" "rm -rf 'frontend/build/'"
check 0 "$ROOT" 'rm -rf frontend/build/*'
check 0 "$ROOT" 'rm -rf frontend/build-old'
check 0 "$ROOT" 'rm -rf frontend/node_modules'
check 0 "$ROOT/frontend" 'rm -rf build/*'
check 0 "$ROOT" 'cd frontend && rm -rf build/*'
check 0 "$ROOT" 'cd backend && rm -rf build'
check 0 "$ROOT" 'rm -rf build'

# Gotcha #15
check 2 "$ROOT" 'git push origin dependabot/npm_and_yarn/vite-8.3.5'
check 2 "$ROOT" 'git push --force origin HEAD:dependabot/uv/backend/django-6.1'
check 2 "$ROOT" "git push origin 'dependabot/npm_and_yarn/x'"
check 0 "$ROOT" "gh pr comment 600 --body '@dependabot rebase'"
tmp=$(mktemp -d)
git -C "$tmp" init -q -b dependabot/npm_and_yarn/x
check 2 "$tmp" 'git push'
check 0 "$tmp" 'git status'
rm -rf "$tmp"
# Allow cases run on a known branch, so the suite passes from any checkout.
tmp=$(mktemp -d)
git -C "$tmp" init -q -b feature/x
check 0 "$tmp" 'git push origin feature/x'
check 0 "$tmp" 'git push -u origin HEAD'
rm -rf "$tmp"

# Gotcha #7
check 2 "$ROOT" 'git rm frontend/.env.production'
check 2 "$ROOT" 'git rm --cached frontend/.env.production'
check 2 "$ROOT" 'git rm "frontend/.env.production"'
check 0 "$ROOT" 'git rm old-file.txt'

# Malformed or empty input must never block.
total=$((total + 1))
if ! echo '{}' | bash "$HOOK" 2>/dev/null; then
  fails=$((fails + 1))
  echo 'FAIL: empty input blocked'
fi

printf '%d cases, %d failed\n' "$total" "$fails"
[ "$fails" -eq 0 ]
