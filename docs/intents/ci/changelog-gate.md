---
status: draft
module: ci
created: 2026-10-17
updated: 2026-10-17
---

# A human change that reaches `main` without a CHANGELOG entry is flagged

## Intent

- **Problem**: `CLAUDE.md` `Development Flow` states "CHANGELOG on Ship", and nothing checks it.
  - #456 (2026-08-18) shipped a security patch whose entire diff was `backend/uv.lock`; it merged with no entry and needed a backfill PR (#457).
  - 2026-10-17: `d92a0054` (a `CLAUDE.md` fix pushed straight to `main`) shipped without an entry; `a4956754` added it afterwards.
  - Same class as the badge and test-count gates, which exist because "remember to update it" does not hold.
- **Outcome wanted**: a human PR or push that changes shipped files without touching `CHANGELOG.md` produces a visible warning; dependabot PRs produce none.
- **Affected systems**: `.github/workflows/pr-checks.yml` (`Repo Checks (informational)`), possibly `main-ci-cd.yml` for direct pushes.
- **Constraints**:
  - "Any PR touching a lockfile must touch `CHANGELOG.md`" fires on **every dependabot PR**. Those deliberately carry no entry, and `semver-patch` ones auto-merge with no human in the loop. A check that reddens every bot PR gets ignored within a week, which is worse than no check. Exempt `github.actor == 'dependabot[bot]'`, as `scripts/check-commit-msg.sh` exempts the bot's commit formats.
  - Informational, not blocking: it belongs in `Repo Checks (informational)`, which nothing depends on (`.claude/rules/ci.md`, CI job gating).
  - Direct pushes to `main` are the intended hotfix path, so a PR-only check misses the 2026-10-17 case.
- **Open questions**: which paths count as "shipped"? Answered by listing what a docs-only or CI-only change looks like in recent history.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
