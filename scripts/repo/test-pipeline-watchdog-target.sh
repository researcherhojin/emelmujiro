#!/bin/bash
# cspell:ignore gpgsign
set -eu

selector="$(cd "$(dirname "$0")" && pwd)/pipeline-watchdog-target.sh"
test_repo=$(mktemp -d)
trap 'rm -rf "$test_repo"' EXIT
cd "$test_repo"
git init -q --template=

commit() {
  local email=$1
  shift
  git add -- README.md source.txt
  git -c user.name=fixture -c user.email="$email" -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -qm "$1" "${@:2}"
  git rev-parse HEAD
}

check() {
  local expected=$1 label=$2 target
  target=$(bash "$selector")
  if [ "${target%% *}" != "$expected" ]; then
    printf 'FAIL: %s (expected %s, got %s)\n' "$label" "$expected" "$target" >&2
    exit 1
  fi
  printf 'PASS: %s\n' "$label"
}

human=maintainer@example.com
bot='41898282+github-actions[bot]@users.noreply.github.com'
sync_subject='chore(readme): auto-sync test counts + version badges [skip ci]'
printf 'Original\n' > README.md
printf 'Source\n' > source.txt
base=$(commit "$human" 'feat: ordinary change')
check "$base" 'ordinary commit is selected'

printf 'Synced\n' >> README.md
commit "$bot" "$sync_subject" >/dev/null
check "$base" 'README-only sync commit is skipped'

printf 'Maintainer change\n' >> README.md
human_sha=$(commit "$human" "$sync_subject")
check "$human_sha" 'same subject from a maintainer is selected'

printf 'Bot code change\n' >> source.txt
bot_sha=$(commit "$bot" "$sync_subject")
check "$bot_sha" 'bot commit that changes source is selected'

printf 'Bot change with body\n' >> README.md
body_sha=$(commit "$bot" "$sync_subject" -m 'Unexpected body')
check "$body_sha" 'bot commit with a body is selected'

printf 'Skipped CI\n' >> source.txt
trailer_sha=$(commit "$human" 'fix: change source' -m 'skip-checks: true')
check "$trailer_sha" 'commit with a skip trailer is selected'
