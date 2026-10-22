---
status: shipped
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# CI checks fail when what they check fails

## Intent

- **Problem**: on 2026-10-22 a read-only audit looked for checks that end green without checking anything. It covered every workflow, composite action and deploy script, plus the annotations and logs of the newest 40 `pr-checks` runs and the newest 40 `main-ci-cd` runs. Each finding below was re-checked against the file and a run log.
  - **Test failures pass on `main`.**
    - `main-ci-cd.yml` pipes both test suites into `tee`: `:52` (vitest) and `:138` (Django).
    - The workflow sets no `shell:`, so GitHub runs each step with `bash -e {0}`, which has no `pipefail`. A failing suite therefore leaves its step green.
    - Run `36376897291` (2026-09-28) shows it. vitest failed all 65 files, yet `Run frontend tests with coverage` reported `success`. The job turned red only because the next step's coverage `sed` found no `lcov.info`.
    - The Django step has no such fallback: `coverage xml` succeeds after failing tests.
    - `deploy-mac-mini` `needs` both test jobs, and these are the only tests a direct push to `main` runs.
  - **Commit messages are never checked.**
    - `Check commit messages` in `pr-checks.yml` reads `git log -z` through command substitution, which drops NUL bytes. Every run logs `warning: command substitution: ignored null byte in input`.
    - Without the NULs, the `read -d ''` loop never sees a record, so it checks zero messages.
    - The check has done nothing since `b1e6df2e` (2026-09-28). A local reproduction runs the loop 0 times.
  - **The cron log check matches nothing.**
    - `Check cron log redirect paths` greps for `crontab.*>>`.
    - Both cron targets in the `Makefile` (lines 149 and 156) write `>>` before `| crontab -`.
    - So the grep finds nothing and the check passes whatever the redirect target is.
  - **Root lockfile changes skip the unit tests.**
    - `Test Affected Code` runs the frontend suite only when a changed path contains `frontend/`.
    - Frontend dependencies resolve from the root `package-lock.json`, so a change confined to the root runs no unit test.
    - #608, #625 and #627 each skipped both test steps.
    - `Auto-Merge Dependabot` depends on this job.
  - **Lighthouse waits on a pattern it never sees.**
    - `frontend/lighthouserc.js` waits for `Local:`.
    - Vite prints `Local` and `:` with an ANSI reset between them, so the pattern never matches.
    - Every run logs `Timed out waiting for the server to start listening` and waits out the 10 s default.
- **Outcome wanted**: each check fails when what it checks fails, and reports how much it checked, so a future zero is visible.
- **Affected systems**:
  - `.github/workflows/main-ci-cd.yml`
  - `.github/workflows/pr-checks.yml`
  - `frontend/lighthouserc.js`
  - `.claude/rules/ci.md`
- **Constraints**:
  - Pass `${{ }}` values only through `env:` (CLAUDE.md Security).
  - `scripts/check-commit-msg.sh` stays the single source of the message rules (CLAUDE.md Code Conventions).
  - `Repo Checks (informational)` stays informational (`ci.md`, CI job gating).

## Spec

- **Approach**:
  - **Test steps**: the two test steps in `main-ci-cd.yml` set `shell: bash`, which GitHub runs as `bash --noprofile --norc -eo pipefail {0}`. The change is per step, not workflow-wide, so the pipelines that extract test counts keep their current behavior.
  - **Commit check**: it writes `git log -z` to a file under `$RUNNER_TEMP` and reads the loop from that file. It counts the messages it checks and fails on zero.
  - **Cron check**: it matches `>>` and `crontab` in either order, and fails when it finds no cron redirect at all.
  - **Frontend tests**: their condition also matches `package-lock.json`.
  - **Lighthouse**: `startServerReadyPattern` becomes `Local`. The colored line still contains it, and LHCI matches case-insensitively.
- **Files and interfaces**:
  - The four files above.
  - `ci.md` "Operational logs": the enforcement wording.
  - `ci.md` drift-check bullet (`:62`): it says both scheduled alarms file an issue, but the drift check files one only when `/api/health/` is unreachable.
- **Out of scope**: the items below are owner decisions, listed in the maintainer's notes.
  - An alarm for a deploy that keeps failing.
  - Removing `quick-checks`. Its conflict check cannot fire, because GitHub starts no `pull_request` run for a conflicted PR.
  - Building Docker images in CI.
  - The efficiency findings: the setup-uv cache, the unused `frontend-build` artifact, and the Codecov key 404.
- **Done when**:
  - `actionlint` 1.7.12 reports nothing new on the two workflows.
  - The fixed commit loop, run locally on a temporary repository, fails a bad subject and passes a good one.
  - The same check, run on the 42 commits of the last 40 merged PRs (18 from Dependabot, full messages from the API), fails none of them.
  - The cron check passes the current `Makefile` and fails a copy that redirects to `/tmp`.
  - This PR's run logs `Checked N commit message(s)` with N > 0, the cron step lists the redirects it found, and the Lighthouse log has no `Timed out waiting`.
  - After the merge, the `main-ci-cd` test steps log `shell: /usr/bin/bash --noprofile --norc -eo pipefail {0}` and pass.

## Plan

- **Changes**: the four files, `ci.md`, then the CHANGELOG entry.
- **Risks**:
  - Fixing the commit check enforces the full-message rules in CI for the first time. The dry run in Done when is the evidence that this will not turn ordinary PRs red.
  - With `pipefail`, a failing suite turns `main` red, and that skips the deploy. The latest run (`39806048512`) passed 427 backend and 1,284 frontend tests.
- **Verification**: the Done when checks.

## Outcome

Shipped in #634 (`5ff20006`, merged 2026-10-22T16:26:36Z). The Done-when
evidence follows.

- **Local checks**, before the PR:
  - `actionlint` reported only the 5 findings that predate the change.
  - The extracted commit loop passed a good range (`Checked 2`) and failed on a
    bad subject, an empty range and an unknown base.
  - The dry run over the 42 commits of the last 40 merged PRs (18 from
    Dependabot) failed none.
  - The extracted cron check passed the current `Makefile` and failed on a
    `/tmp` redirect and on a copy with no cron line.
- **PR run `39810738738`**:
  - It printed `Checked 2 commit message(s)` (the PR commit and GitHub's
    merge commit) and no `ignored null byte` warning.
  - The cron step listed its redirects and ended `Cron log paths OK`.
  - The Lighthouse log has no `Timed out waiting`.
- **`main` run `39814117853`**:
  - Both test steps logged
    `shell: /usr/bin/bash --noprofile --norc -e -o pipefail {0}`.
  - 427 backend and 1,284 frontend tests passed.
  - Production `/api/health/` reports `5ff20006`.
- **Not yet observed**: no run has exercised the root `package-lock.json`
  condition. The next PR that changes only that file should show
  `Test frontend changes` running, not skipped.

The owner decided the out-of-scope items on 2026-10-23:

- An alarm for a deploy that stays undeployed: do it.
- Removing `quick-checks`: do it.
- Building Docker images in CI: do it.
- The efficiency findings: declined.

Each item that is going ahead gets its own intent and PR.
