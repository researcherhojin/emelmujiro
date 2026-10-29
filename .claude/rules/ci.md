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
`npm run security:setup` installs the checksum-pinned scanner; then run
`npm run security:dependencies` or `npm run security:images`. They install no
scheduler and contact no notification service. Reports stay under
`backend/logs/security/`; scanner errors and missing inventories fail explicitly.
Never substitute an image tag for a running container's image ID.

- Operational TypeScript runs natively on Node 24. `npm run check:scripts`
  type-checks and tests it in `Repo Checks (informational)`; the webhook
  JavaScript path is a compatibility loader for service-manager configuration.
- Modules and manual operation: `docs/intents/infra/security-monitoring.md`.

**Runtime image recipes are versioned and must remain reproducible.** nginx uses an exact upstream Compose pin, on the `-alpine-slim` variant (#673, #686): the full variant adds modules `nginx.conf` never loads, and its `brotli-libs` kept the image scan red. Backend, PostgreSQL and Umami are built from their Dockerfile recipes; `auto-deploy.sh` rebuilds analytics images with Compose.

- `docker/postgres/` keeps PostgreSQL 15 and replaces the bundled privilege-switch tool with Alpine's maintained equivalent. Preserve root entrypoint ownership setup; test initialization and persistence across restart with `docker/postgres/verify.sh`.
- `docker/umami/` rebuilds the pinned application source with patched dependencies and ships no curl since #691 (#689; the healthcheck uses BusyBox `wget`; `verify.sh` fails if curl returns). Keep builder and runner locks together, rebuild Next output, and verify tracking and database migrations in isolation.
- The Umami builder's `deepmerge@4.3.1` is patched locally from deepmerge PR #274 (unmerged) because npm has no fixed release for CVE-2026-93753; the Docker build runs its prototype-poisoning regression cases. `@svgr/cli` is build-only and belongs in `devDependencies`; the separate runner lock excludes `deepmerge`. The scheduled scan accepts that one CVE for that lock only, via `docker/umami/trivyignore.yaml` (expires 2027-01-27); every other target keeps `/dev/null` as its ignore file, and image scans take no ignore file (#705).
- **All locally built services set `provenance: false` and `sbom: false` (`docker-compose.yml`).** With attestations each rebuild changes the OCI index digest, so `docker image inspect` could not read the container's exact `.Image` and `auto-deploy.sh` force-recreated PostgreSQL and Umami on every deploy (#630). A single manifest keeps the ID stable. The script keeps that recreate as a fallback for analytics and backend, reloads nginx whenever the umami container changes (nginx resolves the upstream only at start or reload), and requires a 4xx from `/umami/api/send` through nginx before reporting success.
- Dependabot watches all three Dockerfile directories. Local Compose image tags are not registry dependencies. PostgreSQL major upgrades stay excluded; they need dump, new volume and restore as a separate change.
- Two base-image ignores live in Dependabot's stored state, not in `dependabot.yml`: `python:3.15-alpine3.x` for `backend/` (`@dependabot ignore this minor version` on #685; the runtime stays on 3.12, like CI and dev) and `node:26-alpine` for `docker/umami/` (`ignore this major version` on #683; Umami's own build base, Gotcha #16). Check them with `@dependabot show <dependency> ignore conditions`; move to a new Python deliberately, in its own change.

**Operational logs: cron jobs must redirect output to `$(CURDIR)/backend/logs/<name>.log`.** That matches Django `LOG_DIR` (`backend/config/settings.py`), is gitignored, and persists via the Docker logs volume. Never `/tmp`, `~/logs/` or `/var/log/`. A `pr-checks.yml` grep enforces it: every `Makefile` line holding both `crontab` and `>>`, in either order, must target `backend/logs/`, and finding no such line fails too. The grep once required `crontab` first and matched nothing, because the targets pipe `echo "… >> log"` into `crontab -` (#634).

- **cron's `PATH` is `/usr/bin:/bin`, which has no `docker`.** Call it by absolute path (`make setup-cron` bakes in `command -v docker`) or prepend the Docker paths in the script, as `auto-deploy.sh` and `health-check.sh` do. A bare `docker` made every `health-check.sh` cron run exit `127` before its first check (28727c6a). Test a cron script with `env -i PATH=/usr/bin:/bin HOME=$HOME`, not from a login shell.
- **All three Django file logs rotate**: `access.log`, `debug.log` and `security.log` are each a `RotatingFileHandler` capped at 5 MB with 3 backups (`backupCount: 3`, so 4 files, ~20 MB). Copy that shape (#605, #606) for any new file log; the cron-written `backend/logs/health-check.log` is outside Django and not rotated by it.

**CI job gating: no PR job waits on a precondition job, and every cosmetic or policy check lives in `Repo Checks (informational)`, which nothing depends on.**

- The seven substantive jobs (Frontend Lint, Backend Lint, Test Affected Code, Security Scan, Build for Analysis, E2E Tests, Docker Images) start at once with `Repo Checks (informational)` (#643, #645). Only Lighthouse CI waits, for Build for Analysis's artifact. `Auto-Merge Dependabot` needs `affected-tests`, `frontend-lint`, `backend-lint` and `docker-images` directly.
- `Docker Images` always runs, uses no layer cache and pushes nothing (`docs/intents/ci/docker-image-checks.md`). It builds and checks only the images whose inputs a PR touches:
  - the backend image, when its `Dockerfile`, `.dockerignore`, `pyproject.toml` or `uv.lock` changes
  - `docker/postgres` and `docker/umami`, each followed by its `verify.sh`
  - nginx, through `nginx -t` with `frontend/nginx.conf` on the Compose-pinned image, when `docker-compose.yml` or the config changes
  - Markdown files never count, because none is a build input: `docker/umami/.dockerignore` keeps only the build files, and `docker/postgres/Dockerfile` copies nothing. A Dockerfile that starts copying a `.md` file must drop that filter in `Detect image changes`.
- `quick-checks`, a merge-conflict pre-check that gated the six jobs then existing, was removed (#636): GitHub does not run `pull_request` workflows on a conflicted PR, so it could never fail, and its `git merge-base HEAD main` printed `fatal: Not a valid object name main` on every run.
- `Repo Checks (informational)` holds commit-message format, file size, SEO files, i18n keys, the Claude Code guard-hook cases, README test counts and badges, route lists, the operational scripts' type-check and tests, sitemap generation, **spelling**, cron log paths, and the CHANGELOG check's cases and entry check.
- **Do not gate the suite on a cosmetic or policy check**: a stale badge or non-conventional subject once skipped `npm ci` and the whole suite (#400). `main` has no required status checks, so the gating never blocked a merge; it only destroyed test signal.

**CHANGELOG entry: `scripts/check-changelog.sh <base> <head>` warns when a human change ships without a `CHANGELOG.md` entry, and never blocks.** It exits `1` when `<base>...<head>` changes anything outside `docs/intents/` (intent records link to their entry) without touching `CHANGELOG.md`, and `2` on an unreadable range rather than passing on zero files (Gotcha #11).

- Two call sites, as with `check-commit-msg.sh`: the `Check CHANGELOG entry` step, last in `Repo Checks (informational)` so a miss hides no other result, skipped for `dependabot[bot]`, whose PRs deliberately carry no entry; and `.husky/pre-push` for direct pushes to `main`, which the PR step never sees. The hook keys on the **remote** ref (`HEAD:main` from a feature branch counts), skips all-zero SHAs, and always exits `0` (the owner chose a warning over a block); every command that can fail is guarded because husky runs it under `sh -e`. When `origin/main` has moved past the local clone (the badge bot's commit, say), the remote SHA is unknown locally, so the hook prints the exit-`2` "Could not read" line and git rejects the push as non-fast-forward anyway: pull, then push again (#578).
- `scripts/test-check-changelog.sh` holds the cases in a throwaway repo and runs in the same job; add a case with any change to the exempt list.

**Runners are pinned to `ubuntu-24.04`, never `ubuntu-latest`.** `ubuntu-latest` moves to Ubuntu 26 from 2026-10-19 (actions/runner-images#14748, #599); the Playwright system dependencies, the `@rolldown/binding-linux-x64-gnu` lockfile entry (Gotcha #13) and Trivy are validated on `ubuntu-24.04`. Move to a newer image in one PR whose CI is the test, not by a label flip.

**Large shared caches are saved only in `main`'s scope; PR jobs restore them read-only.** A PR can restore caches from its base branch but not other PRs, so a saving PR job stores a private copy per PR, which pushed the repo past GitHub's 10 GB cache limit (#631). `Warm Shared Caches` (`cache-warm.yml`: push to `main`, daily, dispatch) saves them. `E2E Tests` uses `actions/cache/restore`, and `Security Scan` restores `cache-trivy-<UTC date>` and runs the trivy-action with `cache: "false"`. That action always sets `TRIVY_CACHE_DIR` to its `cache-dir` input, so a cache step for any other path stores nothing. Keep keys and paths identical in both workflows. Intent: `docs/intents/ci/actions-cache-scope.md`.

- **The same holds for the Playwright `.deb` packages and for `node_modules` (since 2026-10-23).**
  - Both workflows point apt's archive at `~/apt-archives` through `/etc/apt/apt.conf.d/99-playwright-archives`. `cache-warm.yml` saves `~/apt-archives/*.deb` as `Linux-playwright-apt-<version>-<ImageVersion>`, and `E2E Tests` restores it. Without it a slow mirror made `install-deps` hit the 10-minute job limit (#654, e4c1933a).
  - `.github/actions/setup-node` saves only on `refs/heads/main`. On PRs it restores read-only.
  - Intent: `docs/intents/ci/apt-and-node-cache-scope.md`.

**Auto-merged commits do not deploy.** A push made with `GITHUB_TOKEN` creates no workflow run, and `Auto-Merge Dependabot` merges with that token, so its merge commit runs neither `deploy-mac-mini` nor `Sync README Badges`. Three mechanisms close it, each asserted by outcome:

- The auto-merge job dispatches the pipeline itself after its merge lands.
- `deploy-drift-check.yml` compares `/api/health/`'s baked commit with `main` nightly and dispatches on mismatch.
- `pipeline-watchdog.yml` fails when `main`'s newest non-skip-ci commit has no successful run for that **exact 40-character SHA** (an abbreviated SHA returns 0 runs and alarms on a healthy `main`).
- Each scheduled alarm files a GitHub issue, because a red scheduled run notifies nobody. The watchdog files one when `main` HEAD has no successful run. The drift check files one when `/api/health/` is unreachable; on a commit mismatch it dispatches a deploy and records the target as a `drift-target` annotation, and if production has not reached the previous run's target by the next run, it files "Deploy not landing" (`docs/intents/ci/deploy-not-landing-alarm.md`). A mismatch alone never alarms, because `main` moves most days. **Both fire hours after their cron**: allow ~9 h for the drift check and ~7 h for the watchdog before treating a slot as missed, and do not re-cut the cron to compensate. `workflow_dispatch` always creates runs, so none of this needs a PAT.
- A green pipeline is not deploy evidence (Gotcha #17). Lag measurements and incident history: `.private/operations.md` and the journal Baselines.

**An edit to `auto-deploy.sh` takes effect one deploy late.** The script checks out the target commit while running and bash keeps executing the copy it opened, so a deploy runs without that commit's own change (c2d8f10e, `9587ac3e`). Verify a deploy-script change on the next deploy.

**Spell check: `npm run spell` is `cspell --no-progress "**" ".claude/rules/**" ".claude/hooks/**" ".claude/skills/intent/**" ".claude/skills/gotchas/**" ".claude/agents/**" ".github/**"`.** It runs in `Repo Checks (informational)` with `save-cache: false` (parallel jobs save that cache). Three rules:

1. `ignorePaths` must keep excluding build output — `frontend/coverage/**`, `frontend/playwright-report/**`, `frontend/test-results/**`, `frontend/build/**`, `**/*.egg-info/**` (45850d13). `CHANGELOG.md` is in `ignorePaths` too, so it is never spell-checked, while CLAUDE.md and the rule files are.
2. Deliberate non-words go in a file-scoped `# cspell:ignore`, **not** `cspell.json`'s `words`: `scripts/check-commit-msg.sh` intentionally contains `Mergeevil` and `depsnot`, and dictionary entries would let a real typo of that shape pass everywhere.
3. `"**"` does not match dot-directories, so the `.claude/rules/**`, `.claude/hooks/**`, `.claude/skills/intent/**`, `.claude/skills/gotchas/**`, `.claude/agents/**` and `.github/**` globs are load-bearing (7c5a0b15). **Do not reach for `--dot`**: it scans dot-directory build output that `ignorePaths` does not cover (6458 findings). Scope to what git tracks instead — `.claude/*` is gitignored except `!.claude/rules/`, `!.claude/hooks/`, `!.claude/settings.json`, `!.claude/agents/`, `!.claude/skills/intent/` and `!.claude/skills/gotchas/` (`.gitignore:97-106`; the other per-machine skills stay ignored by `.claude/skills/*`), so the globs name those directories, not `.claude`.

**README drift gates: two CI guards, both auto-healed on `main` by the `Sync README Badges` job in `main-ci-cd.yml`** (it pushes with the CI-skip marker).

1. **Package badges** — 18 badges read-checked by `Repo Checks (informational)`, each showing the **installed** version: 14 frontend resolved from **`package-lock.json`** (`frontend/node_modules/<pkg>` first, since a de-hoisted copy is what ships), plus `Django` / `DRF` / `SimpleJWT` / `Gunicorn` from **`backend/uv.lock`**.
   - Never read `package.json` or `pyproject.toml`: a `^` range or `>=` floor is not the installed version (the frontend badges once did, and 5 of 14 showed floors below what shipped; 19bd9c6e). Backend versions match `[0-9]+(\.[0-9]+){1,2}` because PyPI ships two-component releases (Django `6.1`).
   - **A badge the check cannot read is an error, never a skip.** That covers a badge missing from README, a package missing from its lockfile, and a lockfile `node` cannot parse. A step that compared only when both versions were read printed `All README badges match` and exited `0` on a deleted badge, a removed package or a corrupt `package-lock.json` (#646). The sync script still skips these with a warning, since it cannot heal them: restore the badge, or remove it from README, the check and the script together.
   - `scripts/sync-readme-badges.sh` anchors every replacement on the `/badge/<Name>-` prefix, because label `i18next` is a substring of `React_i18next`.
   - It ends with `git add README.md`, so the job's commit gate must be `git diff --quiet HEAD -- README.md`: a bare `git diff README.md` sees the staged fix as clean and skips the commit, which silently dropped badge-only drift (`01f748d8`..`55e8e57e`, 1dcfcdb9). A green `readme-sync` proves nothing: confirm the badge moved on `main`.
2. **Test counts** — the same job sed-replaces counts from the `frontend-test`/`backend-test` job outputs; `make update-test-counts` is the local equivalent and exits non-zero if the README pattern is missing. The format `Vitest (N tests) + Django unittest (N tests)` in the `**Tests** —` bullet is matched in three places — `scripts/update-test-counts.sh` (the `sedi` lines under `# 1.` and `# 2.`), `main-ci-cd.yml`'s `Sync README Badges` job (two `sed -i -E` lines) and `pr-checks.yml`'s `Check README test counts exist` step (two `grep -oE`) — so change all three together; the workflow's `sed` silently changes nothing when the pattern is missing. The backend count is read with `grep -m1 -oE 'Found [0-9]+ test'` in both producers, never by whole-line capture: a fork-context `ProcessPoolExecutor` test pushes the block-buffered `Found N test(s).` behind stderr's progress dots and wrote `Django unittest (..450 tests)` (`075aed8d`), which the README `[0-9]+` sed can never repair. **Do NOT grep test files for Vitest counts** — `it.each([...])` rows expand at runtime, so grep undercounts.

**Scheduled security operations** (`docs/intents/infra/security-operations.md`):
`make setup-security-cron` installs a daily 02:00 host job running backups,
isolated restore verification, and full dependency/image audits. The manual
commands stay scheduler-free. `/security-report` on the deployment
webhook requires its existing secret and returns only fresh boolean outcomes.
The Security Operations Watchdog rejects reports or independent backup receipts
older than 36 hours and files a generic GitHub issue, closing it on recovery.
Package inventories, host details, backup contents, and keys never appear in
issue bodies or workflow logs. Webhook code changes require the
service restart described in `.private/operations.md`.
The report regenerates only at 02:00, so a dispatched watchdog re-reads the
old result: to confirm sooner, rerun `scripts/scheduled-security.ts` on
the host (the cron line's command) and then `gh workflow run
security-operations.yml`. After an image fix, wait for the container on the new
image first: `/api/health/` reports the new commit once the backend is up,
before `auto-deploy.sh` reaches the analytics rebuild (#689). Alarm history: #660 (2026-10-24), #673 (2026-10-26), #689 (2026-10-27), #705 (2026-10-29) (`docs/intents/infra/security-operations.md`, 506187fc).

**Nightly image refresh is separate from auditing and shares a maintenance lock with deployment and scheduled security operations.** `scripts/refresh-images.ts` builds from the deployed SHA, verifies disposable candidates and fresh backups, then applies and checks actual running image IDs. It retains two generations of owned candidate/rollback tags, with no broad cache pruning. `make setup-image-refresh-cron` enables 00:30 local-time execution and arms the refresh freshness check; deployment alone never enables it. `refresh` in the authenticated security report becomes false for a failed, pending or stale refresh. Restart the webhook before enabling this report contract.

- `backend/logs/maintenance.lock` is never stolen by age or PID. After an interrupted operation, inspect the owner and its descendant processes before removing the lock by hand. A surviving Docker operation may outlive its caller; fail closed rather than overlap it with another deploy or backup.
- A successful image rollback does not restore database contents; failed recovery remains a failure. Candidate findings or scanner failures prevent replacement. Daily scheduling is not a guarantee that upstream patches exist or pass validation.
