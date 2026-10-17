---
status: draft
module: ci
created: 2026-10-17
updated: 2026-10-17
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

<!-- Filled when status becomes shipped or dropped. -->
