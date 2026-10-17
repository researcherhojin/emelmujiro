---
paths:
  - '.github/**'
  - 'scripts/**'
  - '.husky/**'
  - 'Makefile'
  - 'docker-compose.yml'
  - 'cspell.json'
  - 'package.json'
  - 'README.md'
  - 'backend/config/settings.py'
---

<!-- Path-scoped rule: loads when Claude reads CI workflows, repo scripts, husky hooks, the Makefile, docker-compose.yml, cspell.json, the root package.json, README, or `backend/config/settings.py` (whose `LOG_DIR` the cron log paths must match). Moved verbatim from the root CLAUDE.md `Constraints` section on 2026-10-17 (`CHANGELOG entry` was written here directly in #575); Gotcha numbers cited here are root CLAUDE.md's. -->

# CI and repo-automation rules

**Compose-only images (`nginx`, `umami`, `postgres`) are pinned to exact versions in `docker-compose.yml` — never revert to a floating tag.** Nothing re-pulls a floating tag (`auto-deploy.sh` only builds the backend), which left all three 6–9 months stale until 2026-10-06.

- Dependabot's `docker-compose` ecosystem bumps the pins, and `auto-deploy.sh` applies them: `up -d umami-db umami` and the frontend's `up -d` pull a changed tag. Patch bumps auto-merge (Gotcha #12), so an Umami patch runs its DB migrations without review.
- **Postgres majors are dependabot-ignored**: a new major cannot read the `umami_db` volume. Upgrade by `pg_dump` → new volume → restore, as its own change.

**Operational logs: cron jobs must redirect output to `$(CURDIR)/backend/logs/<name>.log`.** That matches Django `LOG_DIR` (`backend/config/settings.py`), is already gitignored, and persists via the Docker logs volume. Never `/tmp`, `~/logs/` or `/var/log/`. Enforced by a `pr-checks.yml` grep: any `crontab` line with `>>` not targeting `backend/logs/` fails CI.

- **cron's `PATH` is `/usr/bin:/bin`, which has no `docker`.** Call it by absolute path (`make setup-cron` bakes in `command -v docker`) or prepend the Docker paths inside the script, as `auto-deploy.sh` and `health-check.sh` do. A bare `docker` made every `health-check.sh` cron run from 2026-04-13 to 2026-10-12 exit `127` before its first check: 51,463 runs, zero `✓`. Test a cron script with `env -i PATH=/usr/bin:/bin HOME=$HOME`, not from a login shell.
- **`access.log` is the one rotating log here**: `debug.log` and `security.log` use a plain `FileHandler`, but the API access log grows per request, so it is a `RotatingFileHandler` capped at 5 MB with 3 backups (`backupCount: 3`, so 4 files, ~20 MB). Copy that shape for anything else that logs per request.

**CI job gating: `quick-checks` checks only for merge conflicts, and every cosmetic or policy check lives in `Repo Checks (informational)`, which nothing depends on.**

- `quick-checks` gates the six substantive jobs (Frontend Lint, Backend Lint, Test Affected Code, Security Scan, Build for Analysis, E2E Tests); a merge conflict is the one condition that makes running the rest pointless. `Auto-Merge Dependabot` is gated transitively (`needs: affected-tests`, which needs `quick-checks`).
- `Repo Checks (informational)` holds commit-message format, file size, SEO files, i18n keys, the Claude Code guard-hook cases, README test counts and badges, route lists, **spelling**, cron log paths, and the CHANGELOG check's cases and entry check.
- **Do not move a check back into `quick-checks`**: when they sat there, a stale badge or a non-conventional subject skipped `npm ci` and the whole suite — that is how the jest-dom 7 lockfile drift reached a deploy. `main` has no required status checks, so that gating never blocked a merge; it only destroyed test signal.

**CHANGELOG entry: `scripts/check-changelog.sh <base> <head>` warns when a human change ships without a `CHANGELOG.md` entry, and never blocks.** It exits `1` when `<base>...<head>` changes anything outside `docs/intents/` (intent records link to their entry instead) without touching `CHANGELOG.md`, and `2` on an unreadable range rather than passing on zero files (Gotcha #11).

- Two call sites, as with `check-commit-msg.sh`: the `Check CHANGELOG entry` step, last in `Repo Checks (informational)` so a miss hides no other result, skipped for `dependabot[bot]`, whose PRs deliberately carry no entry; and `.husky/pre-push` for direct pushes to `main`, which the PR step never sees. The hook keys on the **remote** ref (`HEAD:main` from a feature branch counts), skips all-zero SHAs, and always exits `0`, because the owner chose a warning over a block; every command that can fail is guarded because husky runs it under `sh -e`. When `origin/main` has moved past the local clone (the badge bot's commit, say), the remote SHA is unknown locally, so the hook prints the exit-`2` "Could not read" line and git then rejects the push as non-fast-forward anyway — pull, then push again (observed 2026-10-18).
- `scripts/test-check-changelog.sh` holds the cases in a throwaway repo and runs in the same job; add a case with any change to the exempt list.

**Auto-merged commits do not deploy.** A push made with `GITHUB_TOKEN` creates no workflow run, and `Auto-Merge Dependabot` merges with that token, so its merge commit runs neither `deploy-mac-mini` nor `Sync README Badges`. Three mechanisms close it, each asserted by outcome:

- The auto-merge job dispatches the pipeline itself after its merge lands.
- `deploy-drift-check.yml` compares `/api/health/`'s baked commit with `main` nightly and dispatches on mismatch.
- `pipeline-watchdog.yml` fails when `main`'s newest non-skip-ci commit has no successful run for that **exact 40-character SHA** (an abbreviated SHA returns 0 runs and alarms on a healthy `main`).
- Both scheduled alarms file a GitHub issue, because a red scheduled run notifies nobody. **Both fire hours after their cron** — allow ~9 h for the drift check and ~7 h for the watchdog before treating a slot as missed, and do not re-cut the cron to compensate. `workflow_dispatch` always creates runs, so none of this needs a PAT.
- A green pipeline is not deploy evidence (Gotcha #17). Lag measurements and incident history: `.private/operations.md` and the journal Baselines.

**Spell check: `npm run spell` is `cspell --no-progress "**" ".claude/rules/**" ".claude/hooks/**" ".claude/skills/intent/**" ".claude/agents/**" ".github/**"`.** It runs in `Repo Checks (informational)` with `save-cache: false`, because parallel jobs save that cache. Three rules:

1. `ignorePaths` must keep excluding build output — `frontend/coverage/**`, `frontend/playwright-report/**`, `frontend/test-results/**`, `frontend/build/**`, `**/*.egg-info/**` — which carried 307 of the 314 findings in the first full scan. `CHANGELOG.md` is in `ignorePaths` too, so its prose is never spell-checked, while CLAUDE.md and the rule files are.
2. Deliberate non-words go in a file-scoped `# cspell:ignore`, **not** `cspell.json`'s `words`: `scripts/check-commit-msg.sh` intentionally contains `Mergeevil` and `depsnot`, and dictionary entries would let a real typo of that shape pass everywhere.
3. `"**"` does not match dot-directories, so the `.claude/rules/**`, `.claude/hooks/**`, `.claude/skills/intent/**`, `.claude/agents/**` and `.github/**` globs are load-bearing — without the first, the two path-scoped rule files were not scanned until 2026-09-21. **Do not reach for `--dot`**: it took the scan from 0 findings to 6458 when measured, because `ignorePaths` does not cover dot-directory build output. Scope to what git tracks instead — `.claude/*` is gitignored except `!.claude/rules/`, `!.claude/hooks/`, `!.claude/settings.json`, `!.claude/agents/` and `!.claude/skills/intent/` (`.gitignore:97-105`; the other per-machine skills stay ignored by `.claude/skills/*`), which is why the globs name those directories, not `.claude`.

**README drift gates: two CI guards, both auto-healed on `main` by the `Sync README Badges` job in `main-ci-cd.yml`** (it pushes with the CI-skip marker).

1. **Package badges** — 18 badges read-checked by `Repo Checks (informational)`, each showing the **installed** version: 14 frontend resolved from **`package-lock.json`** (`frontend/node_modules/<pkg>` first, since a de-hoisted copy is what ships), plus `Django` / `DRF` / `SimpleJWT` / `Gunicorn` from **`backend/uv.lock`**.
   - Never read `package.json` or `pyproject.toml`: a `^` range or a `>=` floor is not the installed version (until 2026-10-04 the frontend badges did, and 5 of 14 showed floors below what shipped). Backend versions match `[0-9]+(\.[0-9]+){1,2}` because PyPI ships two-component releases (Django `6.1`).
   - `scripts/sync-readme-badges.sh` anchors every replacement on the `/badge/<Name>-` prefix, because label `i18next` is a substring of `React_i18next`.
   - It ends with `git add README.md`, so the job's commit gate must be `git diff --quiet HEAD -- README.md`: a bare `git diff README.md` sees the staged fix as clean and skips the commit, which silently dropped badge-only drift between `01f748d8` and `55e8e57e`. Treat a green `readme-sync` as proof of nothing — confirm the badge moved on `main`.
2. **Test counts** — the same job sed-replaces counts from the `frontend-test`/`backend-test` job outputs; `make update-test-counts` is the local equivalent and exits non-zero if the README pattern is missing. The format `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet is matched in three places — `scripts/update-test-counts.sh` (the two `sedi` lines under `# 1.`), `main-ci-cd.yml`'s `Sync README Badges` job (two `sed -i -E` lines) and `pr-checks.yml`'s `Check README test counts exist` step (two `grep -oE`) — so change all three together; the workflow's `sed` is the one copy that changes nothing, silently, when the pattern is missing. **Do NOT grep test files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts.
