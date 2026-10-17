---
status: approved
module: ci
created: 2026-10-17
updated: 2026-10-18
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
- **Measured 2026-10-18**: of the 166 first-parent commits on `main` since 2026-09-01, 59 are dependabot squash merges (56 without a `CHANGELOG.md` change), 18 are the README badge bot, and 89 are human. 14 of the 89 changed no `CHANGELOG.md` in the same commit: 2 are intent `Outcome` records (`docs/intents/` only), 4 CI, 3 `CLAUDE.md`, 1 README/CONTRIBUTING, 3 code or lockfile, 1 `Makefile`. Two of those (`1f5356ea`, `dab0f334`) were backfilled later by hash; entries rarely cite a hash, so how many of the other 12 were backfilled under a different wording is not determinable mechanically.
- **Open questions**: none. The owner chose on 2026-10-18: warn on every human change outside an exempt list, in both the PR checks and a local pre-push hook.

## Spec

- **Approach**: one script is the single source of truth, called from two places, in the same shape as `scripts/check-commit-msg.sh` (called by `.husky/commit-msg` and by the `Check commit messages` step).
  - `scripts/check-changelog.sh <base> <head>` exits `0` when the range changes `CHANGELOG.md`, when the range is empty, or when every changed path is exempt; otherwise it prints the changed paths and exits `1`.
  - Exempt paths: `docs/intents/**` (intent records link to their CHANGELOG entry instead of repeating it; `docs/intents/README.md`).
  - **PR**: a `Check CHANGELOG entry` step in `Repo Checks (informational)`, skipped when `github.actor == 'dependabot[bot]'`, with `BASE_SHA`/`HEAD_SHA` bound through `env:` (`CLAUDE.md` Security). A miss reddens only that informational job.
  - **Direct push to `main`**: `.husky/pre-push` reads the refs being pushed and, for `refs/heads/main`, runs the script on `<remote sha>..<local sha>`. It prints a warning and always exits `0`: the owner chose a warning, not a block, and a new branch's all-zero remote SHA is skipped.
  - Rejected: path rules per lockfile (fires on every dependabot PR, per the Constraints above); a Claude Code `PreToolUse` hook on `git push` (would miss a human's own pushes, which husky covers for both).
- **Files and interfaces**: new `scripts/check-changelog.sh`, `scripts/test-check-changelog.sh`, `.husky/pre-push`; `.github/workflows/pr-checks.yml` (`Repo Checks (informational)`); `.claude/rules/ci.md` (one rule paragraph); `CHANGELOG.md`.
- **Out of scope**: backfilling the 12 undetermined misses; blocking anything; `main-ci-cd.yml`.
- **Done when**:
  - `scripts/test-check-changelog.sh` builds a temp repo and passes cases for: a code-only range (exit `1`), the same range plus `CHANGELOG.md` (`0`), a `docs/intents/`-only range (`0`), an empty range (`0`), and a range mixing `docs/intents/` with code (`1`). The test runs in `Repo Checks (informational)`.
  - The pre-push hook, fed a `refs/heads/main` line for a code-only range on stdin, prints the warning and exits `0`; fed a non-`main` ref, prints nothing.
  - End to end: the PR for this change itself passes the new step (it touches `CHANGELOG.md`).
  - `npm run spell` 0 issues; `shellcheck` clean on the new scripts if available; `CLAUDE.md` still below 200 lines.

## Plan

- **Changes**: (1) `scripts/check-changelog.sh`; (2) `scripts/test-check-changelog.sh`; (3) `.husky/pre-push`; (4) `pr-checks.yml`: one step after `Check commit messages`, running the test and then the check, with `if: github.actor != 'dependabot[bot]'` on the check; (5) `.claude/rules/ci.md`: a bold-lead paragraph naming the script, the exemption and the two call sites; (6) `CHANGELOG.md`.
- **Risks**: `git diff --name-only <base>...<head>` on a shallow checkout fails, so the step relies on the job's existing `fetch-depth: 0`; the check must fail loudly on an unreadable range rather than pass on zero files (the same trap the commit-message step guards, Gotcha #11). A pre-push hook that errors would block pushes, so it wraps the script and exits `0` regardless.
- **Verification**: the `Done when` list; then the `intent-reviewer` subagent in a fresh session.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
