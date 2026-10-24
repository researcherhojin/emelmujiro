---
paths:
  - '.claude/hooks/**'
  - '.claude/settings.json'
---

# Claude Code guard hooks

The rule itself (which commands `.claude/hooks/guard-bash.sh` blocks, and which files `.claude/settings.json` denies) stays in `CLAUDE.md` › Security. This file holds its mechanics.

- It matches after removing heredoc bodies and multi-word quoted strings (a quoted single word such as `"frontend/build"` keeps its contents), so a commit message naming a command passes. So do `bash -c "…"` and a heredoc piped to `bash`: a backstop for habit, not a sandbox. It fails open without `jq`.
- The deny rules cover Claude's file tools and the Bash file commands Claude Code recognizes (`cat`, `head`, `tail`, `sed`, `tee`, and `>`/`<` redirection targets), but not `grep -r` from the directory holding the file or a script that opens it ([permissions](https://code.claude.com/docs/en/permissions)); OS-level blocking needs the sandbox. Patterns must start with `/` (anchored at the project root), not `./` (resolved against the session's current directory).
- A new "never run X" rule gets a guard plus a block and an adjacent allow case in `.claude/hooks/test-guard-bash.sh`, which `Repo Checks (informational)` runs. `settings.local.json` stays per-machine and gitignored.
