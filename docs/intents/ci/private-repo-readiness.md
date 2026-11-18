---
status: approved
module: ci
created: 2026-11-18
updated: 2026-11-18
---

# The repository can go private without losing CI, deploys or its safeguards

<!-- cspell:ignore lightningcss jitconfig cutover -->

## Intent

- **Problem**: on GitHub Free, a private repository loses or limits features this repository depends on. Measured or documented on 2026-11-18:
  - **Actions minutes.** Free includes $12 of Actions compute a month for private repositories. At the Linux 2-core rate of $0.006 a minute, that is about 2,000 minutes. Public repositories are free. From 2026-10-23 to 2026-11-18 (26 days, the 1,000 runs the API returns; 1,207 runs were created from 2026-10-19), jobs billed **5,044 minutes**, rounding each job up to a whole minute. Raw time was 2,364.2 minutes, so merging jobs alone cannot fit the allowance. Without a payment method, Actions stops once the allowance is used, and the deploy (`main-ci-cd.yml` › `Deploy to Mac Mini`) and both watchdogs stop with it.
  - **Per job, billed / raw minutes, same 26 days:**
    - Pull Request Checks: Lighthouse CI 746 / 624.8; E2E Tests 504 / 415.0; Docker Images 268 / 93.8; Test Affected Code 262 / 131.9; Security Scan 236 / 75.2; Repo Checks 233 / 97.9; Frontend Lint 230 / 121.7; Backend Lint 227 / 48.7; Build for Analysis 227 / 96.6; PR Summary 223 / 18.8; Auto-Merge Dependabot 96 / 25.9.
    - Main CI/CD: Frontend Tests 212 / 156.4; Backend Tests 188 / 66.1; Frontend Build 184 / 68.3; Sync README Badges 153 / 19.1; Deploy to Mac Mini 150 / 9.8.
    - Warm Shared Caches: Playwright browser 203 / 121.8; Trivy DB 176 / 49.0; Prune 79 / 5.1.
    - Auto Label 225 / 22.4.
    - Security Operations Watchdog 41 / 3.5, Pipeline Watchdog 26 / 3.0, Deploy Drift Check 26 / 2.4, Stale Issues 4 / 0.4.
    - Dependabot update jobs 125 / 86.8. They are free on GitHub-hosted runners, so the billable total is 4,919.
  - **The allowance is per account**, shared by every private repository the owner has. Their current usage is recorded in `.private/operations.md`; stage 4 measures the account total.
  - **Branch protection.** GitHub's plans page lists protected branches for private repositories under Pro, not Free. `main` is protected today against force pushes and deletion (`CLAUDE.md` › Branch protection).
  - **Secret scanning and push protection.** Both are enabled now. Secret scanning runs free only on public repositories, and is not offered for a personal account's private repository.
  - **Anonymous consumers of the repository URL.** A grep of every tracked non-Markdown file for `github.com/researcherhojin/emelmujiro` and `raw.githubusercontent.com/researcherhojin` found two:
    - `scripts/security/triage-alarm.ts` fetches `https://github.com/researcherhojin/emelmujiro.git` without credentials (`REPOSITORY`, `prepareClone()`), so it would fail at the clone. The production checkout fetches over SSH.
    - `NOTICE` line 7 links the source code, which would 404. That is the licensing question this intent leaves out of scope.
    - Host crontab and launchd entries are checked in stage 1.
  - **Artifact storage.** Free includes 500 MB, shared between Actions artifacts and Packages. Unexpired artifacts were 143 files, 191.8 MB. Caches are separate (10 GB per repository; 7 caches, 630,358,825 bytes).
  - **Runner pin and native bindings.** Every job runs on `ubuntu-24.04` (`ci.md` › Runners are pinned). No check asserts the lockfile's `linux-x64-gnu` bindings (Gotcha #13); `npm ci` on an x64 runner is what fails when one is missing. The lockfile lists `linux-arm64-gnu` for `@rolldown`, `@oxc-parser`, `@tailwindcss/oxide` and `lightningcss`, and no `@esbuild/linux-*`.
- **Outcome wanted**: switching the repository to private changes nothing a maintainer relies on:
  - Actions usage stays inside the Free allowance with a margin.
  - Every PR still gets the same checks.
  - A force push to `main` or its deletion is refused on both development machines, whether a person or Claude runs it. GitHub itself no longer refuses it; `--no-verify` and the web UI remain open, and that residual is accepted.
  - A secret is refused at commit and at push on both development machines, and a pushed one fails a gating CI check.
  - The triage, watchdogs and deploy keep working.
  - The work lands in stages, and the repository works normally after each one.
- **Affected systems**:
  - `.github/workflows/*.yml` and `.claude/rules/ci.md` (Runners pinned, Shared caches, CI job gating).
  - `scripts/security/triage-alarm.ts`.
  - `.claude/hooks/guard-bash.sh`.
  - `.husky/pre-commit`, `.husky/pre-push` and lint-staged.
  - `.github/actions/setup-node` and the Playwright and apt cache keys.
  - A new runner recipe on the deploy host.
  - `CLAUDE.md` › Branch protection.
- **Constraints**:
  - The deploy host's Docker runs `linux/arm64` and is shared with production (measured 2026-11-18; host details in `.private/operations.md`).
    - The lockfile already lists `@rolldown/binding-linux-arm64-gnu` beside `linux-x64-gnu`, so Gotcha #13 holds on arm64.
    - Google Chrome has no `linux/arm64` build. The Lighthouse job uses the image's preinstalled Chrome.
  - A runner given the Docker socket can control every production container. Docker Images needs Docker.
  - Dependabot PRs run new package install scripts. On a self-hosted runner they run on the deploy host.
  - The watchdogs watch the host, so running them on it would defeat them.
  - GitHub's guidance is to use self-hosted runners with private repositories only, since a public repository's fork PRs can run code on them.
  - `maintenance.lock` serializes deploys, backups and refreshes (`ci.md` › Nightly image refresh).
- **Open questions**: none. Answered by the owner on 2026-11-18:
  - Scope is the whole readiness work, not the runner alone.
  - Docker jobs stay GitHub-hosted.
  - Branch protection is replaced by the guard hook rather than Pro.
  - Secrets are checked by gitleaks in pre-commit and CI.
  - The order is four stages, with the runner first validated in a separate private test repository.
  - Reading the host's hardware was allowed.

## Spec

- **Approach**: four stages, one PR each, all linked to this file.
  1. **Prepare while public.** Nothing here depends on visibility:
     - The triage fetches with its existing fine-grained token, through a credential that the agent never sees. The token stays out of the clone's `.git/config` and remote URL, since the agent can read the clone. This matches `publish()`.
     - Artifact `retention-days` drops to the minimum each consumer needs, and a daily step in Deploy Drift Check fails when unexpired artifacts exceed 400 MB, below the 500 MB allowance.
     - gitleaks, pinned to an exact version, runs in `pre-commit` on staged changes, in `pre-push` over the pushed range, in the `Security Scan` job over the PR range, and in `main-ci-cd.yml` over each push range, since a direct push to `main` runs no PR check (`CLAUDE.md` › Branch protection). In PRs it is its own job, `Secret Scan`, added to Auto-Merge Dependabot's `needs`. `main` has no required checks, so for a person's PR the red check is the signal, as for every other job.
     - `.husky/pre-push` refuses, for `refs/heads/main`, a deletion (local SHA all zeros) and any update whose remote SHA is not an ancestor of the local SHA. Reading git's pre-push stdin catches every spelling (`--force`, `-f`, `--force-with-lease`, `+HEAD:main`, `:main`, `--delete`). `guard-bash.sh` refuses `--no-verify` on a push for Claude, since a hook only binds a shell that runs it.
     - Every cache key that holds binaries (`setup-node`'s `node_modules`, Playwright browsers, the apt archive, and `setup-uv`'s if its key lacks the architecture) gains `runner.arch`. Today every runner is `X64`, so the keys change once and nothing else does.
     - A script under `scripts/repo/`, run in the Frontend Lint job, derives every package family in the lockfile that has a `linux-x64-gnu` or `linux-arm64-gnu` binding (today `@rolldown`, `@oxc-parser`, `@oxc-resolver`, `@tailwindcss/oxide`, `lightningcss`, among others) and asserts each has both, since after stage 3 no job runs `npm ci` on x64.
     - gitleaks also runs once over the full history; each finding is fixed or recorded with its reason in an allowlist file. This replaces what secret scanning did for history.
     - The host's crontab and launchd entries are checked for the repository URL.
  2. **Build the runner on the deploy host and prove it on a private mirror.**
     - The runner image is a pinned `linux/arm64` image with the Playwright system dependencies, `uv`, `gh` and `jq` preinstalled, so no job needs `sudo` or `apt`. Jobs skip their apt and `install-deps` steps on self-hosted runners.
     - Each container is ephemeral, re-registered for every job, non-root, with no Docker socket, no host bind mounts, and capped CPU and memory.
     - Its only network is a Docker `internal` network whose one exit is an HTTP(S) proxy container. The proxy refuses, by the resolved destination IP rather than the hostname, loopback, RFC 1918, link-local, carrier-grade NAT (`100.64.0.0/10`), IPv6 private ranges and `host.docker.internal`, and allows the rest of the internet. Jobs use it through `HTTPS_PROXY`/`HTTP_PROXY`, with `NO_PROXY=localhost,127.0.0.1,::1` so E2E, `lhci` and the Django test server reach their own loopback.
     - A launchd supervisor keeps one job slot alive. While `maintenance.lock` exists it registers no new runner and `docker pause`s a running one, resuming when the lock is gone; a job that hits its timeout this way is rerun.
     - A separate fine-grained token with repository Administration stays in a host-only directory like the triage's. The supervisor, outside the container, uses it to mint a single-use just-in-time runner configuration per job, and the container receives only that configuration.
     - The runner image is refreshed before GitHub stops accepting its runner version, by the nightly refresh or its own job (window checked against GitHub's docs in the Plan).
     - Proof: a private copy of this repository, with the stage-3 workflow changes applied, runs every job that will move. The copy has no `dependabot.yml`, no `schedule:` triggers, no `Deploy to Mac Mini` or `Sync README Badges` job and no production secrets, so it files no issues, deploys nothing and bills little of the shared allowance.
     - Caps: the runner's CPU and memory limits leave production its measured `docker stats` peak plus headroom inside the Docker VM (numbers set in the Plan from a measurement).
  3. **Cut over on one day.**
     - Set the repository private.
     - Move these jobs to the self-hosted label: every Pull Request Checks job except Docker Images, Auto-Merge Dependabot and PR Summary; Main CI/CD Frontend Tests, Backend Tests and Frontend Build; Warm Shared Caches; Auto Label.
     - Lighthouse installs Playwright's Chromium (restored from the Playwright cache) and passes it through `CHROME_PATH`.
     - `frontend/lighthouserc.js` stops uploading to `temporary-public-storage`, whose report links anyone can open, and keeps reports in the job's artifact only.
  4. **Measure 30 days** and close.
  - **Kept GitHub-hosted:**
    - Docker Images: Docker on the host is production.
    - Auto-Merge Dependabot: it runs no Docker itself, but it is an API-only job of 25.9 raw minutes that gates on Docker Images, and keeping it hosted keeps Dependabot's merge path off the host.
    - Deploy to Mac Mini, Sync README Badges and PR Summary: short jobs.
    - Security Operations Watchdog, Pipeline Watchdog, Deploy Drift Check: they watch the host.
    - Stale Issues.
    - Their measured total is 987 billed minutes per 26 days: Docker Images 268, Auto-Merge Dependabot 96, Deploy 150, Badges 153, PR Summary 223, watchdogs and drift 93, Stale 4. Scaled by days, that is 1,139 per 30 days, inside 2,000. The 26-day window holds the newest 1,000 of the runs since 2026-10-19, so the scale is by days, not by runs.
  - **Rejected:**
    - Paying for minutes: 4,919 billable minutes in 26 days scales to 5,676 per 30 days, 3,676 over the allowance.
    - Merging jobs only: raw time (2,364.2 minutes) already exceeds the allowance.
    - A runner with the Docker socket or rootless DinD: host root equivalent, or a second container engine competing with production.
    - Firewall rules inside the runner container: they need `NET_ADMIN`, which a job could undo.
    - Running the watchdogs on the host.
    - Attaching the runner to this repository while it is public.
    - A macOS-native runner: the jobs assume Linux.
    - GitHub Pro: owner chose the hooks.
- **Files and interfaces**:
  - `scripts/security/triage-alarm.ts` (`prepareClone()`, `REPOSITORY`) and `scripts/tests/triage-alarm.test.ts`.
  - `.github/workflows/pr-checks.yml`, `main-ci-cd.yml`, `cache-warm.yml`, `auto-label.yml`, `deploy-drift-check.yml` (`runs-on`, `retention-days`, cache keys, a gitleaks step in `security-scan`, apt steps gated by runner).
  - `.github/actions/setup-node/action.yml` (cache key) and `frontend/lighthouserc.js` (upload target).
  - `.husky/pre-commit`, `.husky/pre-push` and the lint-staged config.
  - `.claude/hooks/guard-bash.sh` and `.claude/hooks/test-guard-bash.sh`.
  - A runner recipe under `docker/runner/` (runner image, proxy, compose file), a launchd supervisor under `scripts/maintenance/` or `scripts/deploy/`, and a `Makefile` setup target, following `scripts/` layout rules.
  - `.claude/rules/ci.md` (Runners pinned, Shared caches, CI job gating), `CLAUDE.md` › Branch protection and Security, and `AGENTS.md` where its one-line summaries change.
  - Host-only: the runner token directory and its expiry, recorded in `.private/operations.md` and the journal Backlog.
- **Out of scope**:
  - Moving the Docker jobs or the watchdogs to the host.
  - Paying for Pro or minutes.
  - Re-tuning Lighthouse thresholds. If arm64 scores shift, that goes to its own intent.
  - Codecov on a private repository (the owner excluded it from this question).
  - The AGPL and other licensing consequences of a private source repository.
- **Done when**:
  1. Stage 1:
     - `.husky/pre-push`, fed git's pre-push stdin, refuses a deletion and a non-fast-forward of `refs/heads/main` and allows a fast-forward and any other branch (scripted cases). `.claude/hooks/test-guard-bash.sh` passes with a `git push --no-verify` refusal case.
     - A staged test token fails `pre-commit`; the same token in an already-made commit fails `pre-push`; a PR containing one fails `Security Scan`.
     - `scripts/tests/triage-alarm.test.ts` proves the fetch uses the token and that neither the agent's environment, its settings file, nor the clone's `.git/config` contains it.
     - The bindings script fails on a lockfile copy with one `linux-arm64-gnu` or `linux-x64-gnu` entry removed, and passes on the tracked one.
     - The full-history gitleaks run reports 0 findings outside the allowlist file.
     - A direct push to `main` containing a test token fails `main-ci-cd.yml`'s gitleaks step (exercised on a throwaway branch with the same step).
     - Every binary cache key includes `runner.arch`, and the next `Warm Shared Caches` run saves the new keys.
     - Every `upload-artifact` step names a `retention-days`, and the unexpired artifact total stays under 500 MB in a week of normal PRs.
  2. Stage 2, against the private copy:
     - Every job that stage 3 moves passes on the self-hosted runner, including Backend Lint, Test Affected Code (Django and Vitest), Security Scan (Trivy and gitleaks), Lighthouse with `CHROME_PATH`, E2E, the cache warm and prune, and Auto Label.
     - `prepareClone()` with the triage token clones the private copy.
     - Neither a runner's environment nor its filesystem contains the Administration token.
     - From inside a runner, a direct TCP connection to any address other than its own loopback and the proxy fails, and through the proxy every published port of `host.docker.internal`, the host's LAN address, the LAN gateway, `169.254.169.254` an IPv6 ULA address and a hostname that resolves to a LAN address (`192-168-0-1.nip.io` style) are refused while `https://api.github.com` succeeds. `docker` is absent.
     - Two consecutive jobs see no file left by the first.
     - With `maintenance.lock` present, no job starts; a job already running when the lock appears is paused and resumes after it is removed, tested for the longest lock hold measured in the Plan. If a paused job cannot survive that, the pause is dropped and the caps alone protect production.
  3. Stage 3:
     - The repository reports `"visibility": "private"`.
     - A Lighthouse CI run's log shows no `temporary-public-storage` upload.
     - A PR shows every check name it showed before, all green, with the moved jobs on the self-hosted runner (job `runner_name`).
     - A merge deploys, and `/api/health/` reports its commit (Gotcha #17).
     - A dispatched Security Operations Watchdog succeeds.
     - The next 02:40 triage run fetches successfully (its log shows the clone step passed).
  4. Stage 4, end to end:
     - Thirty days after stage 3, the same per-job billing calculation over GitHub-hosted jobs, excluding Dependabot and adding the account's other private repositories, is under 2,000 minutes, and no Actions run was blocked for usage.
     - A daily step in Deploy Drift Check, which fails when unexpired artifacts exceed 400 MB, never failed in that period.
     - The pre-push guard, gitleaks and the triage each worked at least once in that period.

## Plan

Each stage starts from `main` on its own branch and ends in one PR of at most 3 commits (`CLAUDE.md` › PR discipline). Stage 1 is split in two PRs so each stays one issue.

- **Changes**:
  1. **Stage 1a, local guards** (`fix/private-readiness-guards`):
     1. `scripts/repo/check-push-main.sh` reads git's pre-push stdin (`<local ref> <local sha> <remote ref> <remote sha>`) and exits 1 for `refs/heads/main` when the local SHA is all zeros, or when the remote SHA is not all zeros and `git merge-base --is-ancestor <remote> <local>` fails. `.husky/pre-push` runs it before the existing `check-changelog.sh` call. Cases go in `scripts/repo/test-check-push-main.sh`.
     2. `.claude/hooks/guard-bash.sh` refuses `git push … --no-verify` (not `-n`, which is `--dry-run` for push), with cases in `test-guard-bash.sh`.
     3. gitleaks at one exact version, installed by `scripts/dev/setup-dev-machine.sh` and checked by `make verify-setup`. That changes the "10-check" count in `CLAUDE.md`, and the new count is written there. `.gitleaks.toml` holds the allowlist. `.husky/pre-commit` scans staged changes, and `.husky/pre-push` scans each pushed range.
     4. A one-time `gitleaks git` over the full history; each finding is fixed or allowlisted with its reason.
     5. CI: a `Secret Scan` job in `pr-checks.yml` (binary downloaded by exact version and SHA-256, like Trivy), added to Auto-Merge Dependabot's `needs`, and a step in `main-ci-cd.yml` over `github.event.before..github.sha`. A new branch's all-zero `before` scans the pushed commits only.
  2. **Stage 1b, CI hygiene** (`fix/private-readiness-ci`):
     1. `triage-alarm.ts`: `prepareClone()` passes the token to `git fetch` and `git clone` only through `GIT_CONFIG_COUNT`/`GIT_CONFIG_KEY_0=http.extraHeader`/`GIT_CONFIG_VALUE_0` in that child's environment. Nothing is written to `.git/config` or the remote URL, and the agent's environment is unchanged. The token is read before `prepareClone()`, not only in `publish()`.
     2. Cache keys gain `runner.arch`: `setup-node` (`node_modules`), the Playwright browser and apt keys in both `cache-warm.yml` and `pr-checks.yml`, identical in both (`ci.md` › Shared caches), and `setup-uv` if its documented key lacks the architecture (else `cache-suffix`). The prune step's family regex (`cache-warm.yml` around line 136, `[A-Za-z]+-node-modules-` and siblings) changes with them, or old and new keys stop being pruned.
     3. `scripts/repo/check-native-bindings.sh` (+ test) runs in Frontend Lint.
     4. `retention-days`: `pr-build` stays 1 (Lighthouse reads it in the same run), `lighthouse-results` and `e2e-results` go 7 → 3, and `frontend-build` goes 7 → 1, since no job downloads it. Deploy Drift Check gains the daily artifact-total step.
     5. Read-only on the host: grep the crontab and LaunchAgents for the repository URL, and record the result in this file.
     6. Docs: `ci.md`, `CLAUDE.md` › Branch protection and Security, the `gotchas` skill #13 section (the new script), `AGENTS.md`, and `CHANGELOG.md`.
  3. **Stage 2, runner** (`feature/ci-runner`):
     1. `docker/runner/Dockerfile`: `ghcr.io/actions/actions-runner` pinned by digest (`linux/arm64`), plus Playwright system dependencies for the lockfile's Playwright version, `uv`, `gh` and `jq` at exact versions. Non-root user.
     2. `docker/runner/proxy/`: squid pinned by digest. `acl` lists with `dst` (matched on the resolved IP) for `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `100.64.0.0/10`, `::1`, `fc00::/7`, `fe80::/10`, deny those (CONNECT included), and allow the rest.
     3. `docker/runner/compose.yml`: `runner-net` (`internal: true`) holds the runner and the proxy; the proxy alone also joins a bridge. Initial caps: runner 4 CPUs and 3 GiB, proxy 0.5 CPU and 128 MiB. The arithmetic: the Docker VM has 7.748 GiB, and production used 373 MiB in the 2026-11-18 snapshot (backend 161.5, umami 175.9, umami-db 23.88, frontend 11.99 MiB). That leaves 4.4 GiB for production and its image builds. A stage-2 `docker stats` peak during an E2E or Lighthouse job that overlaps a deploy sets the final caps.
     4. `scripts/maintenance/ci-runner.ts` under a new LaunchAgent, installed by `make setup-ci-runner`:
        - It loops: when `maintenance.lock` is absent, it calls `POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig` with the labels `self-hosted, linux, arm64, emelmujiro`, then `docker run --rm` with only the encoded config, and waits for the container to exit.
        - While a job runs, it `docker pause`s on the lock and unpauses when the lock is gone.
        - It reads the Administration token from `~/.config/emelmujiro-runner/github-token` (0600).
        - Read the `gotchas` skill #17 section first: `docker` under launchd hit the credsStore trap, so the agent gets a `DOCKER_CONFIG` without one.
     5. Private copy: `emelmujiro-runner-test`, created by the owner, with `main` pushed and `dependabot.yml`, every `schedule:`, `Deploy to Mac Mini` and `Sync README Badges` removed, plus the stage-3 workflow changes. Delete it after stage 3.
     6. Runner version: check GitHub's support window for self-hosted runner versions at the start of this stage. Rebuild the image within it, through the nightly image refresh or a dedicated weekly job.
  4. **Stage 3, cutover** (`feature/ci-runner-cutover`, one day):
     1. Owner flips visibility: `gh repo edit --visibility private --accept-visibility-change-consequences`. Then point the supervisor at this repository and start it. The order matters: the runner never serves this repository while it is public.
     2. The PR moves the jobs:
        - `runs-on: [self-hosted, linux, arm64, emelmujiro]`, and apt and `install-deps` steps gain `if: runner.environment == 'github-hosted'`.
        - Lighthouse restores the Playwright cache, runs `npx playwright install chromium` and sets `CHROME_PATH` from `require('playwright').chromium.executablePath()`.
        - `lighthouserc.js` `upload.target` changes to `filesystem`.
        - `main-ci-cd.yml` gains a `workflow_dispatch` input `hosted` that selects `ubuntu-24.04` for its moved jobs, so a deploy can still run when the runner is down.
        - The PR's own checks run on the runner and are the first live test.
     3. Docs: `ci.md` › Runners pinned (rewritten: hosted jobs on `ubuntu-24.04`, moved jobs on the runner label, and the `hosted` fallback), `CLAUDE.md` › Branch protection (GitHub no longer enforces it; the pre-push guard does), `AGENTS.md`, `CHANGELOG.md`, and `.private/operations.md` for the runner.
  5. **Stage 4**: the per-job billing calculation from the Intent becomes `scripts/repo/actions-usage.ts`, run at day 30 for this repository and the account's others. Then fill Outcome.
- **Risks**:
  - **Runner down.** If the Mac mini or Docker Desktop restarts, PR jobs queue and deploys stop, because `deploy-mac-mini` needs Frontend Tests, Frontend Build and Backend Tests. It shows as queued checks and as Deploy Drift Check finding a stale commit. The `hosted` dispatch input is the fallback.
  - **A paused job times out.** Refresh held the lock 166 to 246 s in its last 10 runs (2026-11-09 to 11-18), and the E2E and Lighthouse jobs have 10-minute limits. A pause during a long deploy could exceed that. The stage-2 check measures it, and the fallback is to drop the pause.
  - **Cache prune regex.** If it misses the new keys, caches grow until the 10 GB limit evicts them. It shows in `actions/cache/usage`.
  - **arm64 differences.** Chromium's rendering or Lighthouse scores may shift. Lighthouse cannot stay hosted (its 746 minutes would push the hosted total to 1,733 per 26 days, 2,000 per 30), so a threshold failure blocks the cutover until its own intent resolves it.
  - **Supply chain.** A Dependabot PR's install scripts run on the host, inside the runner's limits. A breakout from the container or the proxy would reach production. That is why there is no socket, no mounts, the internal network and the IP-based ACL.
  - **Proxy compatibility.** A tool that ignores `HTTPS_PROXY`, such as a raw socket download, fails. Stage 2's full-job run is where it shows.
  - **Token expiry.** The runner and triage tokens expire silently. Their dates go in the journal Backlog.
- **Verification**: each stage's `Done when` list above, in order, with its output in the PR body. Stage 2's network checks run from a throwaway job on the private copy. Stage 4 is `node scripts/repo/actions-usage.ts --since <stage-3 date>`.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
