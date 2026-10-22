---
status: in-progress
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# PR jobs no longer wait on a merge-conflict check that cannot fail

## Intent

- **Problem**: `quick-checks` (`Quick Validation`) has one step, `Check for merge conflicts`. Six jobs needed it: Frontend Lint, Backend Lint, Test Affected Code, Security Scan, Build for Analysis and E2E Tests.
  - **The step can never fail.** GitHub's `pull_request` event documentation says: "Workflows will not run on `pull_request` activity if the pull request has a merge conflict. The merge conflict must be resolved first." So no run ever sees a conflict.
  - **It is also broken.** It runs `git merge-base HEAD "$BASE_REF"` with `BASE_REF=main`, but a PR checkout has no local `main`. All 40 sampled runs printed `fatal: Not a valid object name main` and exited 0 (the 2026-10-22 audit, `docs/intents/ci/silent-check-failures.md`).
  - **It costs a little time.** In #634's run `39810738738` the job took 6 s (16:04:17–16:04:23), and the six jobs started at 16:04:25–26. Every PR pays that delay plus one extra runner job.
  - **The docs describe it wrongly.** `ci.md` "CI job gating" says it gates on merge conflicts, "the one condition that makes running the rest pointless".
  - On 2026-10-23 the owner chose to remove it.
- **Outcome wanted**: the six jobs start without a pre-check, and the docs describe the job graph as it is.
- **Affected systems**: `.github/workflows/pr-checks.yml` and `.claude/rules/ci.md` ("CI job gating").
- **Constraints**:
  - The lesson behind the old gate stays recorded: cosmetic or policy checks must not gate the suite.
  - `Auto-Merge Dependabot` still requires `affected-tests`, `frontend-lint` and `backend-lint` to succeed.

## Spec

- **Approach**:
  - Delete the job and the six `needs: quick-checks` lines.
  - Reword the comments that assumed a skipped state behind it. With no `needs`, `affected-tests` and the two lint jobs always report success or failure.
  - Rewrite "CI job gating" in `ci.md`. It now states that no job waits on a precondition, gives the removal with the docs quote, and keeps the rule against gating the suite on policy checks.
- **Files and interfaces**: `pr-checks.yml` (job graph and comments) and `ci.md`.
- **Out of scope**: the history in shipped intents and the CHANGELOG, such as `automerge-gate.md` mentioning `quick-checks`.
- **Done when**:
  - The parsed job graph shows no `quick-checks`, and the dependents have no `needs`.
  - `actionlint` reports nothing new.
  - This PR's run starts the six jobs without a `Quick Validation` job, and the checks are green.
  - The PR Summary still renders.

## Plan

- **Changes**: `pr-checks.yml`, `ci.md`, the CHANGELOG entry.
- **Risks**: none for merges, because `main` has no required status checks. An external branch-protection rule naming `Quick Validation` would wait forever, but there is none (`required_status_checks: null`).
- **Verification**: the Done-when items.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
