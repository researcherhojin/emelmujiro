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

<!-- Path-scoped rule: loads when Claude reads CI workflows, repo scripts, husky hooks, the Makefile, docker-compose.yml, cspell.json, the root package.json, README, or `backend/config/settings.py` (whose `LOG_DIR` the cron log paths must match). Moved verbatim from the root CLAUDE.md `Constraints` section on 2026-10-17 (`CHANGELOG entry` was written here directly in #575, the runner pin in #599); Gotcha numbers cited here are root CLAUDE.md's. -->

# CI and repo-automation rules

**Manual security audits include development dependencies and actual running images.**
Use `npm run security:setup` to install the checksum-pinned scanner, then
`npm run security:dependencies` or `npm run security:images`. These commands
install no scheduler and contact no notification service. Reports stay under
`backend/logs/security/`; scanner errors and missing inventories fail explicitly.
Never substitute an image tag for a running container's image ID.

- Operational TypeScript runs natively on Node 24. `npm run check:scripts`
  type-checks and tests it in `Repo Checks (informational)`; the existing webhook
  JavaScript path is a compatibility loader for service-manager configuration.
- Modules and manual operation: `docs/intents/infra/security-monitoring.md`.

**Runtime image recipes are versioned and must remain reproducible.** nginx uses an exact upstream Compose pin. Backend, PostgreSQL and Umami are built from their Dockerfile recipes; `auto-deploy.sh` rebuilds analytics images with Compose.

- `docker/postgres/` keeps PostgreSQL 15 and replaces the bundled privilege-switch tool with Alpine's maintained equivalent. Preserve root entrypoint ownership setup; test initialization and persistence after restart with `docker/postgres/verify.sh`.
- `docker/umami/` rebuilds the pinned application source with patched dependencies. Keep builder and runner dependency locks together, rebuild Next output, and verify tracking and database migrations in isolation.
- **Analytics builds set `provenance: false` and `sbom: false` (`docker-compose.yml`).** With attestations, every rebuild produced a new OCI index digest around an unchanged platform manifest, so Compose kept the container while `docker image inspect` could no longer read its exact `.Image`; `auto-deploy.sh` then force-recreated PostgreSQL and Umami on every deploy (3 of 3 on 2026-10-22). A single manifest keeps the ID stable. The script keeps that recreate as a fallback, reloads nginx whenever the umami container changes (nginx resolves the upstream only at start or reload), and requires a 4xx from `/umami/api/send` through nginx before reporting success.
- Dependabot watches all three Dockerfile directories. Local Compose image tags are not registry dependencies. PostgreSQL major upgrades remain excluded and require dump, new volume and restore as a separate change.

**Operational logs: cron jobs must redirect output to `$(CURDIR)/backend/logs/<name>.log`.** That matches Django `LOG_DIR` (`backend/config/settings.py`), is already gitignored, and persists via the Docker logs volume. Never `/tmp`, `~/logs/` or `/var/log/`. Enforced by a `pr-checks.yml` grep: every `Makefile` line holding both `crontab` and `>>`, in either order, must target `backend/logs/`, and finding no such line fails too. Until 2026-10-23 the grep required `crontab` first and matched nothing, because the targets pipe `echo "… >> log"` into `crontab -`.

- **cron's `PATH` is `/usr/bin:/bin`, which has no `docker`.** Call it by absolute path (`make setup-cron` bakes in `command -v docker`) or prepend the Docker paths inside the script, as `auto-deploy.sh` and `health-check.sh` do. A bare `docker` made every `health-check.sh` cron run from 2026-04-13 to 2026-10-12 exit `127` before its first check: 51,463 runs, zero `✓`. Test a cron script with `env -i PATH=/usr/bin:/bin HOME=$HOME`, not from a login shell.
- **All three Django file logs rotate**: `access.log`, `debug.log` and `security.log` are each a `RotatingFileHandler` capped at 5 MB with 3 backups (`backupCount: 3`, so 4 files, ~20 MB). `debug.log` and `security.log` were plain `FileHandler`s until #605 (2026-10-18). Copy that shape for any new file log; the cron-written `backend/logs/health-check.log` is outside Django and not rotated by it.

**CI job gating: no PR job waits on a precondition job, and every cosmetic or policy check lives in `Repo Checks (informational)`, which nothing depends on.**

- The seven substantive jobs (Frontend Lint, Backend Lint, Test Affected Code, Security Scan, Build for Analysis, E2E Tests, Docker Images) start at once, together with `Repo Checks (informational)`: all eight started at 18:24:31Z in #643's run `39831084138`. Only Lighthouse CI waits, because it needs Build for Analysis's artifact. `Auto-Merge Dependabot` needs `affected-tests`, `frontend-lint`, `backend-lint` and `docker-images` directly.
- `Docker Images` always runs, uses no layer cache and pushes nothing (`docs/intents/ci/docker-image-checks.md`). It builds and checks only the images whose inputs a PR touches:
  - the backend image, when its `Dockerfile`, `.dockerignore`, `pyproject.toml` or `uv.lock` changes
  - `docker/postgres` and `docker/umami`, each followed by its `verify.sh`
  - nginx, through `nginx -t` with `frontend/nginx.conf` on the Compose-pinned image, when `docker-compose.yml` or the config changes
  - Markdown files never count, because none is a build input: `docker/umami/.dockerignore` keeps only the build files, and `docker/postgres/Dockerfile` copies nothing. A Dockerfile that starts copying a `.md` file must drop that filter in `Detect image changes` (`docs/intents/ci/image-checks-skip-markdown.md`).
- `quick-checks`, a merge-conflict pre-check that gated the six that existed then, was removed on 2026-10-23 (`docs/intents/ci/remove-quick-checks.md`). GitHub documents that "Workflows will not run on `pull_request` activity if the pull request has a merge conflict", so the check could never fail. Its `git merge-base HEAD main` also printed `fatal: Not a valid object name main` on every run.
- `Repo Checks (informational)` holds commit-message format, file size, SEO files, i18n keys, the Claude Code guard-hook cases, README test counts and badges, route lists, the operational scripts' type-check and tests, sitemap generation, **spelling**, cron log paths, and the CHANGELOG check's cases and entry check.
- **Do not gate the suite on a cosmetic or policy check**: when those checks sat in `quick-checks`, a stale badge or a non-conventional subject skipped `npm ci` and the whole suite — that is how the jest-dom 7 lockfile drift reached a deploy. `main` has no required status checks, so that gating never blocked a merge; it only destroyed test signal.

**CHANGELOG entry: `scripts/check-changelog.sh <base> <head>` warns when a human change ships without a `CHANGELOG.md` entry, and never blocks.** It exits `1` when `<base>...<head>` changes anything outside `docs/intents/` (intent records link to their entry instead) without touching `CHANGELOG.md`, and `2` on an unreadable range rather than passing on zero files (Gotcha #11).

- Two call sites, as with `check-commit-msg.sh`: the `Check CHANGELOG entry` step, last in `Repo Checks (informational)` so a miss hides no other result, skipped for `dependabot[bot]`, whose PRs deliberately carry no entry; and `.husky/pre-push` for direct pushes to `main`, which the PR step never sees. The hook keys on the **remote** ref (`HEAD:main` from a feature branch counts), skips all-zero SHAs, and always exits `0`, because the owner chose a warning over a block; every command that can fail is guarded because husky runs it under `sh -e`. When `origin/main` has moved past the local clone (the badge bot's commit, say), the remote SHA is unknown locally, so the hook prints the exit-`2` "Could not read" line and git then rejects the push as non-fast-forward anyway — pull, then push again (observed 2026-10-18).
- `scripts/test-check-changelog.sh` holds the cases in a throwaway repo and runs in the same job; add a case with any change to the exempt list.

**Runners are pinned to `ubuntu-24.04`, never `ubuntu-latest`.** GitHub announced that `ubuntu-latest` moves to Ubuntu 26 from 2026-10-19 (actions/runner-images#14748); every job ran on `ubuntu-24.04` (image `20261012`) until then, and the Playwright system dependencies, the `@rolldown/binding-linux-x64-gnu` lockfile entry (Gotcha #13) and Trivy were all measured there. Move to a newer image deliberately, in one PR whose CI is the test, not by a label flip.

**Large shared caches are saved only in `main`'s scope; PR jobs restore them read-only.** A PR can restore caches from its base branch but not from other PRs, so a PR job that saves stores a private copy: 21 copies of the 279 MB Playwright browser and 18 of the 91 MB Trivy DB pushed the repo past GitHub's 10 GB cache limit on 2026-10-22. `Warm Shared Caches` (`cache-warm.yml`: push to `main`, daily, dispatch) saves them. `E2E Tests` uses `actions/cache/restore`, and `Security Scan` restores `cache-trivy-<UTC date>` and runs the trivy-action with `cache: "false"`. That action always sets `TRIVY_CACHE_DIR` to its `cache-dir` input, so a cache step for any other path stores nothing. Keep keys and paths identical in both workflows. Intent: `docs/intents/ci/actions-cache-scope.md`.

- **The same holds for the Playwright `.deb` packages and for `node_modules` (since 2026-10-23).**
  - Both workflows point apt's archive at `~/apt-archives` through `/etc/apt/apt.conf.d/99-playwright-archives`. `cache-warm.yml` saves `~/apt-archives/*.deb` as `Linux-playwright-apt-<version>-<ImageVersion>`, and `E2E Tests` restores it. Before that, a mirror at 79.3 kB/s made `install-deps` take 348 s and 584 s, and the second hit the 10-minute job limit.
  - `.github/actions/setup-node` saves only on `refs/heads/main`. On PRs it restores read-only.
  - Intent: `docs/intents/ci/apt-and-node-cache-scope.md`.

**Auto-merged commits do not deploy.** A push made with `GITHUB_TOKEN` creates no workflow run, and `Auto-Merge Dependabot` merges with that token, so its merge commit runs neither `deploy-mac-mini` nor `Sync README Badges`. Three mechanisms close it, each asserted by outcome:

- The auto-merge job dispatches the pipeline itself after its merge lands.
- `deploy-drift-check.yml` compares `/api/health/`'s baked commit with `main` nightly and dispatches on mismatch.
- `pipeline-watchdog.yml` fails when `main`'s newest non-skip-ci commit has no successful run for that **exact 40-character SHA** (an abbreviated SHA returns 0 runs and alarms on a healthy `main`).
- Each scheduled alarm files a GitHub issue for the failure it detects, because a red scheduled run notifies nobody. The watchdog files one when `main` HEAD has no successful run. The drift check files one when `/api/health/` is unreachable. On a commit mismatch it dispatches a deploy and records the target as a `drift-target` annotation. If production has not reached the previous run's target by the next run, it files "Deploy not landing" (`docs/intents/ci/deploy-not-landing-alarm.md`). A mismatch alone never alarms, because `main` moves most days. **Both fire hours after their cron** — allow ~9 h for the drift check and ~7 h for the watchdog before treating a slot as missed, and do not re-cut the cron to compensate. `workflow_dispatch` always creates runs, so none of this needs a PAT.
- A green pipeline is not deploy evidence (Gotcha #17). Lag measurements and incident history: `.private/operations.md` and the journal Baselines.

**An edit to `auto-deploy.sh` takes effect one deploy late.** The script checks out the target commit while running, and bash keeps executing the copy it opened, so the deploy of `9587ac3e` ran without that commit's new `up -d umami-db umami` line. Verify a deploy-script change on the deploy after it.

**Spell check: `npm run spell` is `cspell --no-progress "**" ".claude/rules/**" ".claude/hooks/**" ".claude/skills/intent/**" ".claude/agents/**" ".github/**"`.** It runs in `Repo Checks (informational)` with `save-cache: false`, because parallel jobs save that cache. Three rules:

1. `ignorePaths` must keep excluding build output — `frontend/coverage/**`, `frontend/playwright-report/**`, `frontend/test-results/**`, `frontend/build/**`, `**/*.egg-info/**` — which carried 307 of the 314 findings in the first full scan. `CHANGELOG.md` is in `ignorePaths` too, so its prose is never spell-checked, while CLAUDE.md and the rule files are.
2. Deliberate non-words go in a file-scoped `# cspell:ignore`, **not** `cspell.json`'s `words`: `scripts/check-commit-msg.sh` intentionally contains `Mergeevil` and `depsnot`, and dictionary entries would let a real typo of that shape pass everywhere.
3. `"**"` does not match dot-directories, so the `.claude/rules/**`, `.claude/hooks/**`, `.claude/skills/intent/**`, `.claude/agents/**` and `.github/**` globs are load-bearing — without the first, the two path-scoped rule files were not scanned until 2026-09-21. **Do not reach for `--dot`**: it took the scan from 0 findings to 6458 when measured, because `ignorePaths` does not cover dot-directory build output. Scope to what git tracks instead — `.claude/*` is gitignored except `!.claude/rules/`, `!.claude/hooks/`, `!.claude/settings.json`, `!.claude/agents/` and `!.claude/skills/intent/` (`.gitignore:97-105`; the other per-machine skills stay ignored by `.claude/skills/*`), which is why the globs name those directories, not `.claude`.

**README drift gates: two CI guards, both auto-healed on `main` by the `Sync README Badges` job in `main-ci-cd.yml`** (it pushes with the CI-skip marker).

1. **Package badges** — 18 badges read-checked by `Repo Checks (informational)`, each showing the **installed** version: 14 frontend resolved from **`package-lock.json`** (`frontend/node_modules/<pkg>` first, since a de-hoisted copy is what ships), plus `Django` / `DRF` / `SimpleJWT` / `Gunicorn` from **`backend/uv.lock`**.
   - Never read `package.json` or `pyproject.toml`: a `^` range or a `>=` floor is not the installed version (until 2026-10-04 the frontend badges did, and 5 of 14 showed floors below what shipped). Backend versions match `[0-9]+(\.[0-9]+){1,2}` because PyPI ships two-component releases (Django `6.1`).
   - **A badge the check cannot read is an error, never a skip.** That covers a badge missing from README, a package missing from its lockfile, and a lockfile `node` cannot parse. Until 2026-10-23 the step compared only when both versions were read, so a deleted badge, a removed package, or a corrupt `package-lock.json` printed `All README badges match` and exited `0` (`docs/intents/ci/badge-check-missing-fails.md`). The sync script still skips these with a warning, because it cannot heal them: restore the badge, or remove it from README, from the check and from the script together.
   - `scripts/sync-readme-badges.sh` anchors every replacement on the `/badge/<Name>-` prefix, because label `i18next` is a substring of `React_i18next`.
   - It ends with `git add README.md`, so the job's commit gate must be `git diff --quiet HEAD -- README.md`: a bare `git diff README.md` sees the staged fix as clean and skips the commit, which silently dropped badge-only drift between `01f748d8` and `55e8e57e`. Treat a green `readme-sync` as proof of nothing — confirm the badge moved on `main`.
2. **Test counts** — the same job sed-replaces counts from the `frontend-test`/`backend-test` job outputs; `make update-test-counts` is the local equivalent and exits non-zero if the README pattern is missing. The format `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet is matched in three places — `scripts/update-test-counts.sh` (the `sedi` lines under `# 1.` and `# 2.`), `main-ci-cd.yml`'s `Sync README Badges` job (two `sed -i -E` lines) and `pr-checks.yml`'s `Check README test counts exist` step (two `grep -oE`) — so change all three together; the workflow's `sed` is the one copy that changes nothing, silently, when the pattern is missing. The backend count is read with `grep -m1 -oE 'Found [0-9]+ test'` in both producers, never by whole-line capture: a fork-context `ProcessPoolExecutor` test pushes the block-buffered `Found N test(s).` behind stderr's progress dots, which wrote `Django unittest (..450 tests)` on `075aed8d`, and the README `[0-9]+` sed can never repair that afterwards. **Do NOT grep test files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts.

**Scheduled security operations** (`docs/intents/infra/security-operations.md`):
`make setup-security-cron` installs a daily 02:00 host job running backups,
isolated restore verification, and full dependency/image audits. The existing
manual commands remain scheduler-free. `/security-report` on the deployment
webhook requires its existing secret and returns only fresh boolean outcomes.
The Security Operations Watchdog rejects reports or independent backup receipts
older than 36 hours and files a generic GitHub issue; it closes that issue on
recovery. Package inventories, host details, backup contents, and keys must
never appear in issue bodies or workflow logs. Webhook code changes require the
service restart described in `.private/operations.md`.
The report is regenerated only at 02:00, so a dispatched watchdog re-reads the
old result: to confirm a fix sooner, rerun `scripts/scheduled-security.ts` on
the host (the cron line's command) and then `gh workflow run
security-operations.yml`. First live alarm: #660, 2026-10-24.
