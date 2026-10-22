---
status: in-progress
module: ci
created: 2026-10-22
updated: 2026-10-22
---

# PR runs reuse `main`'s Playwright and Trivy caches instead of saving their own

## Intent

- **Problem**: on 2026-10-22 the repository held 86 Actions caches totalling 11,066,677,423 bytes, over GitHub's 10 GB per-repository limit.
  - All but 13 were scoped to closed pull requests (`refs/pull/N/merge`).
  - `Linux-playwright-1.64.1` (279 MB) was stored 21 times and `cache-trivy-<date>` (91 MB) 20 times. Both are saved only by `pull_request` jobs (`E2E Tests` and `Security Scan`), because `main-ci-cd.yml` runs neither.
  - A PR can restore only its own caches and its base branch's, so each PR downloaded and saved a fresh copy. Once the limit is passed, least-recently-used eviction can drop `main`'s caches too.
  - The 86 stale caches were deleted by hand the same day, leaving `main`'s current `Linux-node-modules-d523128e…` and `setup-uv-…-066a13b`.
- **A dead step was found along the way**: `Security Scan`'s `Cache Trivy DB` caches `~/.cache/trivy`, but the pinned `aquasecurity/trivy-action` (v0.36.0, `ed142fd0`) always sets `TRIVY_CACHE_DIR` to its `cache-dir` input (default `${{ github.workspace }}/.cache/trivy`). It caches that path itself under `cache-trivy-<date>`. No `Linux-trivy` cache ever appeared in the listing.
- **Outcome wanted**: PR runs restore the Playwright browser and the Trivy DB from `main` and save neither. The cache total stays well under 10 GB as Dependabot PRs accumulate.
- **Affected systems**: `.github/workflows/pr-checks.yml` (`e2e-tests`, `security-scan`), a new `.github/workflows/cache-warm.yml`, and `.claude/rules/ci.md`.
- **Constraints**:
  - Runners stay on `ubuntu-24.04` (`ci.md`).
  - Keep the same Trivy action pin and Playwright version source, so cached content matches what PRs use.
  - `${{ }}` values are bound through `env:` in `run:` blocks (`CLAUDE.md` Security).
  - Pushes made with `GITHUB_TOKEN` (auto-merged Dependabot commits) start no workflow, so the warm job also needs a schedule.

## Spec

- **Approach**: a separate `cache-warm.yml` on `push` to `main`, a daily `schedule` and `workflow_dispatch`. It restores, or creates and saves, the two caches in `main`'s scope with the same keys and paths PRs use. PR jobs switch to `actions/cache/restore` and do not save.
  - For Trivy, the PR job sets the action input `cache: false`, which stops its internal restore-and-save. A separate restore step uses the action's own key scheme: `cache-trivy-<UTC date>` with restore-key `cache-trivy-`.
  - Rejected: adding the warm-up to `main-ci-cd.yml`. It would add work to the deploy pipeline, and `pipeline-watchdog` judges that workflow's runs.
  - Rejected: deleting PR caches on PR close. That needs a `pull_request: closed` workflow with `actions: write`, and it still downloads everything once per PR.
- **Files and interfaces**:
  - `cache-warm.yml` with two jobs. `playwright` uses the setup-node composite, `npx playwright --version` and `actions/cache` keyed `${{ runner.os }}-playwright-<version>`, then `npx playwright install chromium` on a miss. `trivy` runs the pinned trivy-action with `cache: true` and `exit-code: 0`.
  - `pr-checks.yml`: `Cache Playwright browsers` becomes `actions/cache/restore`. In `security-scan`, the dead `Cache Trivy DB` step is removed, a date step and `actions/cache/restore` for `${{ github.workspace }}/.cache/trivy` are added, and the action gets `cache: "false"`.
- **Out of scope**:
  - Per-PR `Linux-node-modules-*` caches. They are legitimately different whenever a PR changes the lockfile.
  - `setup-uv` caches.
  - Playwright's apt system dependencies, which `install-deps` keeps installing per run.
- **Done when**:
  - `actionlint` passes and both workflows run green.
  - After the warm run on `main`, `gh cache list` shows `Linux-playwright-*` and `cache-trivy-*` under `refs/heads/main`.
  - A PR run then reports a Playwright cache hit, and **no** new `Linux-playwright-*` or `cache-trivy-*` entry appears under that PR's ref.

## Plan

- **Changes**: `cache-warm.yml`, then `pr-checks.yml`, then the `ci.md` bullet and the CHANGELOG entry.
- **Risks**:
  - If `main` has no cache yet, or the Playwright version changes in a PR, the PR misses and installs as today, without saving. That costs the same time as today and does not break anything.
  - A Trivy DB older than its next-update time is downloaded again by Trivy itself.
  - A date-keyed Trivy cache accumulates one entry per warm day. Entries not accessed for 7 days are evicted by GitHub.
- **Verification**:
  - Run `actionlint` on both files.
  - Check the PR run log for `Cache restored from key: Linux-playwright-…` and for the absence of `Cache saved`.
  - Run `gh cache list --ref refs/pull/<n>/merge` before and after.
  - Check the warm-up run's cache listing on `main`.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
