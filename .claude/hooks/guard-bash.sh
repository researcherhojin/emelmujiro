#!/bin/bash
# PreToolUse hook for Claude Code's Bash tool: blocks the commands CLAUDE.md
# says never to run, so the rule holds even when the doc is not re-read.
#
# Input: the hook JSON on stdin (tool_input.command, cwd).
# Exit 0 lets the command run; exit 2 blocks it and returns stderr to Claude.
#
# Each block cites the rule it enforces. A guard here is a backstop for
# Claude's tool calls only: it does not run for a human's own shell, and the
# authoritative rule stays in CLAUDE.md.

set -u

# Fail open without jq: a missing parser must not block every Bash call.
command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
[ -n "$cmd" ] || exit 0

# Match against the command with heredoc bodies and multi-word quoted strings
# removed, so a commit message, `grep` pattern or `echo` that only mentions a
# blocked command still runs. A quoted single word keeps its contents, so
# `rm -rf "frontend/build"` is still caught. One alternation handles both
# quote kinds, so an apostrophe inside "..." cannot pair with a later quote.
# `bash -c "npm audit fix"` and a heredoc fed to `bash` slip through: this
# guards against the habit, not against a deliberate bypass.
cmd=$(printf '%s\n' "$cmd" | perl -0pe '
  s/<<-?[ \t]*([\x27"]?)(\w+)\1[^\n]*\n.*?\n[ \t]*\2[ \t]*(\n|\z)/ /gs;
  s/\x27([^\x27]*)\x27|"((?:\\.|[^"\\])*)"/my $q = defined $1 ? $1 : $2; $q =~ \/\s\/ ? " " : $q/ges;
')

block() {
  printf 'Blocked by .claude/hooks/guard-bash.sh: %s\n' "$1" >&2
  exit 2
}

# Gotcha #6: `npm audit fix --force` downgrades @lhci/cli to 0.1.0.
if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]_-])npm[[:space:]]+audit[[:space:]]+fix([^[:alnum:]_-]|$)'; then
  block 'never run `npm audit fix` (CLAUDE.md Gotcha #6). Bump the direct parent instead; plain `npm audit` is fine.'
fi

# Deployment: removing the directory itself breaks the nginx volume mount.
# `frontend/build/*` passes; `frontend/build` and `frontend/build/` do not.
rm_dir='rm[[:space:]]+(-[[:alpha:]]+[[:space:]]+)*'
if printf '%s' "$cmd" | grep -Eq "${rm_dir}[^;&|]*(^|[[:space:]/])frontend/build/?([[:space:];&|]|\$)"; then
  block 'never remove frontend/build itself (CLAUDE.md Constraints > Deployment). Use `rm -rf frontend/build/*`.'
fi
# The cwd test sees where the shell starts, not a `cd frontend` inside the
# command, so that prefix counts as being in frontend/ too.
in_frontend=false
case "$cwd" in */frontend) in_frontend=true ;; esac
printf '%s' "$cmd" | grep -Eq '(^|[;&|][[:space:]]*)cd[[:space:]]+(\./)?frontend/?([[:space:]]|$)' && in_frontend=true
if $in_frontend &&
  printf '%s' "$cmd" | grep -Eq "${rm_dir}[^;&|]*(^|[[:space:]])(\\./)?build/?([[:space:];&|]|\$)"; then
  block 'never remove frontend/build itself (CLAUDE.md Constraints > Deployment). Use `rm -rf build/*`.'
fi

# Gotcha #15: a non-bot push to a dependabot branch silently closes the PR.
if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]_-])git[[:space:]]+push([^[:alnum:]_-]|$)'; then
  if printf '%s' "$cmd" | grep -q 'dependabot/'; then
    block 'never push to a dependabot/* branch (CLAUDE.md Gotcha #15). Comment `@dependabot rebase` instead.'
  fi
  if [ -n "$cwd" ]; then
    branch=$(git -C "$cwd" symbolic-ref --short -q HEAD 2>/dev/null || true)
    case "$branch" in
      dependabot/*)
        block "the checked-out branch is $branch; never push to a dependabot/* branch (CLAUDE.md Gotcha #15). Comment \`@dependabot rebase\` instead."
        ;;
    esac
  fi
fi

# Gotcha #7: frontend/.env.production is tracked on purpose; auto-deploy.sh needs it.
if printf '%s' "$cmd" | grep -Eq '(^|[^[:alnum:]_-])git[[:space:]]+rm([^[:alnum:]_-]|$).*\.env\.production'; then
  block 'frontend/.env.production is tracked on purpose (CLAUDE.md Gotcha #7); do not git rm it.'
fi

exit 0
