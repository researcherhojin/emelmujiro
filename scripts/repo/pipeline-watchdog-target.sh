#!/bin/bash
# Print the full SHA and commit time of the main commit to verify.
set -eu

bot_email='41898282+github-actions[bot]@users.noreply.github.com'
bot_subject='^chore\(readme\): .+ \[skip ci\]$'
commits=$(git log -50 --first-parent --format='%H %cI %ae %s')

while read -r sha committed author_email subject; do
  [ -n "$sha" ] || continue
  if [[ "$author_email" == "$bot_email" && "$subject" =~ $bot_subject ]]; then
    body=$(git show -s --format=%b "$sha")
    if [ -z "$body" ] && git rev-parse --verify -q "$sha^" >/dev/null; then
      paths=$(git diff --no-ext-diff --name-only "$sha^" "$sha" --)
      [ "$paths" != README.md ] || continue
    fi
  fi
  printf '%s %s\n' "$sha" "$committed"
  exit 0
done <<<"$commits"

echo 'No commit to verify in the last 50 first-parent commits.' >&2
exit 1
