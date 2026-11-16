---
status: dropped
module: ci
created: 2026-10-17
updated: 2026-11-16
---

# Auto-merged dependabot commits start their own workflow runs

## Intent

- **Problem**: a merge made with `GITHUB_TOKEN` creates no workflow run, so `dependabot-auto-merge` polls for `merged == true` and calls `gh workflow run` (`548e2260`, 2026-09-21). The dispatched run builds whatever `--ref main` resolves to at dispatch time, so two patches merging seconds apart can produce two runs on the same `head_sha`, and a run's SHA can differ from the merge that triggered it.
- **Outcome wanted**: each auto-merge commit gets its own `Main CI/CD Pipeline` run on its own SHA, with no dispatch poll.
- **Affected systems**: `.github/workflows/pr-checks.yml`; repository secrets.
- **Constraints**:
  - Needs `AUTOMERGE_APP_CLIENT_ID` and `AUTOMERGE_APP_PRIVATE_KEY` from a GitHub App installed on the repo with `contents: write`, `pull requests: write` **and `workflows: write`**. The last is not optional: GitHub refuses auto-merge on any PR touching `.github/workflows/`, which is every `github-actions` ecosystem bump.
  - Without those secrets, the token-mint step fails on every dependabot patch PR and stops auto-merge outright. A PAT works, but its expiry silently reopens the same gap.
- **Prior art**: PR #512 (closed unmerged 2026-09-21) carried a working implementation; recover it from commit `55203c78`. Its description has two factual errors that `pipeline-watchdog.yml`'s header corrects; check those before reusing its prose.
- **Open questions**: blocked on creating and installing the App, which only the owner can do.
- **Not urgent**: the dispatch poll closes the gap, and `pipeline-watchdog.yml` alarms if both dispatch paths fail.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

Dropped on 2026-11-16 (owner delegated the decision). The gap this would close is closed by outcome, without a GitHub App:

- The dispatch step gives each auto-merge its own run. Its first live exercise (2026-09-28, #517/#521/#522/#524) dispatched 2–3 s after each merge, every run on that PR's own merge commit, including two merges 11 s apart; the SHA drift in Problem did not occur. The concurrency group cancelling all but the newest run is intended: the survivor tests the newest `main`. On 2026-11-16, #800's merge `cfb23d43` got its own `workflow_dispatch` run, which succeeded.
- `deploy-drift-check.yml` and `pipeline-watchdog.yml` alarm if both paths fail (`.claude/rules/ci.md` › Auto-merged commits do not deploy).

The App would add two repository secrets and a failure mode that stops every auto-merge when the token mint fails, which is worse than the gap. Re-raise if a dispatched run is measured on a SHA other than its merge commit, or the watchdog fires on an auto-merge.
