---
status: shipped
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

Shipped in #631 (`553b92ba`, merged and deployed 2026-10-22). Done-when
evidence:

- **`actionlint` 1.7.12**: its own rules pass on `cache-warm.yml` and
  `pr-checks.yml` as of `e96f27c8`. With the shellcheck 0.11.0 integration on,
  it reports 5 findings in `pr-checks.yml`, none in lines #631 or #632 touched:
  - 4 × SC2155 (`local x=$(…)` masks the exit status) in the step
    `Check README badge versions match package-lock.json and uv.lock`
    (`01a9a46e`, `19bd9c6e`)
  - 1 × SC2086 (info) in `Check bundle size` (`f93baa5b`)
- **Warm run**: both workflows ran green. The first warm run on `main`
  (`39794157925`, 2026-10-22T14:15:44Z) saved under `refs/heads/main`:

  | Key                              |       Bytes |
  | -------------------------------- | ----------: |
  | `Linux-playwright-1.64.1`        | 293,399,028 |
  | `cache-trivy-2026-10-22`         |  95,471,439 |
  | `trivy-binary-v0.70.0-Linux-X64` |  43,751,181 |

- **PR runs saved nothing**:
  - #631's own run (`39792803659`) found neither cache, since `main` held
    neither yet. It saved none.
  - The first PR run after the warm run, #632's `39795710174`:
    - restored `Linux-playwright-1.64.1` in `E2E Tests` and
      `cache-trivy-2026-10-22` in `Security Scan`
    - printed no `Cache saved` line
    - left nothing under `refs/pull/632/merge` (`gh cache list --ref` empty,
      exit 0)

**E2E setup time**: the time saved is small, so the gain is storage, not speed.
The table shows single runs, using `E2E Tests` step durations from the jobs API.

| Run                              | Playwright cache         | Playwright steps            | Job   |
| -------------------------------- | ------------------------ | --------------------------- | ----- |
| #630, first run (`39790166301`)  | PR-scope miss, then save | 22 s install + 5 s save     | 116 s |
| #631 (`39792803659`)             | miss, restore-only       | 26 s install                | 103 s |
| #632 (`39795710174`), after warm | hit from `main`          | 3 s restore + 17 s apt deps | 103 s |

The 17 s of Playwright's apt system dependencies now dominates. They are out of
scope here.

**Cache totals**: after the warm run for `e96f27c8` (`39798612636`), the
repository holds 5 caches, all under `refs/heads/main`, totalling 517,603,982
bytes. Before the cleanup it held 86 caches and 11,066,677,423 bytes.

**Trivy binary**: under `cache: "false"`, `setup-trivy` skips both restoring
and saving the Trivy binary, so each PR run installs it with the upstream
install script. The `trivy-binary-*` cache on `main` is used only by the warm
job.
