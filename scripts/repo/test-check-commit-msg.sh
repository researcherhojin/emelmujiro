#!/bin/bash
# cspell:ignore gpgsign
set -eu

checker="$(dirname "$0")/check-commit-msg.sh"
test_dir=$(mktemp -d)
trap 'rm -rf "$test_dir"' EXIT
message_file="$test_dir/message"

check() {
  local expected=$1 label=$2 actual=0 output
  shift 2
  output=$("$checker" "$@") || actual=$?
  if [ "$actual" -ne "$expected" ]; then
    printf 'FAIL: %s (expected %s, got %s)\n%s\n' "$label" "$expected" "$actual" "$output" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$label"
}

check 0 'ordinary commit' 'docs(repo): update contributor guide'
check 1 'bracketed marker in body' $'docs(repo): update contributor guide\n\n[skip ci]'
check 0 'README sync commit' 'chore(readme): auto-sync test counts + version badges [skip ci]'
check 1 'trailer with a space' $'docs(repo): update contributor guide\n\n\nskip-checks: true'
check 1 'trailer without a space after another trailer' $'docs(repo): update contributor guide\n\n\nRefs: #1\nskip-checks:true'
check 1 'trailer on an otherwise exempt merge message' $'Merge branch example\n\n\nskip-checks: true'
check 0 'false trailer' $'docs(repo): update contributor guide\n\nskip-checks: false'
check 0 'mention in prose' $'docs(repo): update contributor guide\n\nDocument skip-checks: true in the guide.'

printf '%s\n' 'docs(repo): update contributor guide' '' '' 'skip-checks: true' > "$message_file"
check 1 'trailer in a hook message file' "$message_file"

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
(
  cd "$test_dir"
  git init -q --template=
  mkdir -p .git/hooks
  ln -s "$repo_root/.husky/commit-msg" .git/hooks/commit-msg
  ln -s "$repo_root/scripts" scripts
  git_commit() {
    git -c core.hooksPath=.git/hooks -c user.name=fixture -c user.email=fixture@example.com \
      -c commit.gpgsign=false commit --allow-empty --cleanup=verbatim "$@"
  }
  actual=0
  output=$(git_commit -F "$message_file" 2>&1) || actual=$?
  if [ "$actual" -ne 1 ] || [[ "$output" != *'Remove the skip-checks trailer'* ]]; then
    printf 'FAIL: Husky hook did not reject the trailer (%s)\n%s\n' "$actual" "$output" >&2
    exit 1
  fi
  git_commit -qm 'docs(repo): update contributor guide'
  printf 'PASS: Git invokes the Husky hook for rejected and accepted commits\n'
)
