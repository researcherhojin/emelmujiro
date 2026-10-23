---
status: shipped
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# A deploy that keeps not landing files an issue

## Intent

- **Problem**: a deploy can keep failing without anyone being notified.
  - `deploy-mac-mini` is `continue-on-error` and goes green as soon as the webhook accepts the trigger (Gotcha #17). It also exits 0 when its secret is missing, and it accepts any 3xx response.
  - `deploy-drift-check.yml` is the nightly backstop. On a commit mismatch it only writes `::warning::`, dispatches `Main CI/CD Pipeline` and exits 0. It files an issue only when `/api/health/` is unreachable.
  - So when a deploy keeps failing, every run stays green and production stays on an old commit.
  - The 2026-10-22 silent-failure audit found this (`docs/intents/ci/silent-check-failures.md`, out of scope there; that intent was deleted after it shipped, and git history keeps it). On 2026-10-23 the owner chose: file an issue when the mismatch persists.
- **Outcome wanted**: the drift check files an issue when production has not reached the commit that the previous drift check dispatched a deploy for, and closes the issue once deploys land again.
- **Why not literally "two mismatches in a row"**: `main` gets a new commit most days. Two consecutive mismatches can therefore mean two successful deploys, each followed by a newer commit, which would be a false alarm. The thing to track is one dispatched commit that is still undeployed at the next check.
- **Affected systems**: `.github/workflows/deploy-drift-check.yml` and `.claude/rules/ci.md` (the scheduled-alarm bullet).
- **Constraints**:
  - `${{ }}` goes only through `env:` (CLAUDE.md Security).
  - The unreachable path stays as it is.
  - Runs fire up to about 9 hours after their cron (`ci.md`), so the design must not depend on run times.

## Spec

- **Approach**:
  - **Record the target**: when the check dispatches a deploy, it records the target commit as a `::notice title=drift-target::<sha>` annotation.
  - **Read the previous target**: the next run reads the newest completed run of this workflow and takes its `drift-target` annotation, through the jobs API and the check-run annotations API.
    - A previous run that finished less than 2 hours ago is not judged. That covers a manual re-run whose dispatched deploy may still be in flight.
  - **Compare**: on a mismatch with a known `LIVE`, it compares that previous target with `LIVE` (`GET /compare/{target}...{LIVE}`).
    - `identical` or `ahead`: production reached the target, so deploys are landing. Close any open alarm.
    - `behind` or `diverged`: the dispatched deploy never landed. File the issue, or comment on the open one. Dispatch again, then exit 1.
    - An API error writes a warning and does not alarm.
  - **When production is on `main` HEAD**: close any open alarm.
  - **Unknown `LIVE`**: the path where the image was built without `GIT_COMMIT` stays as it is, and is not judged.
- **Files and interfaces**:
  - `deploy-drift-check.yml`: the dispatch step, plus job permission `checks: read` for the annotations.
  - `ci.md`: the alarm bullet.
- **Out of scope**:
  - Making `deploy-mac-mini` itself fail on a failed deploy (Gotcha #17 keeps it `continue-on-error`).
  - A verification job right after each deploy. The owner chose the nightly design.
- **Done when**:
  - The dispatch step, extracted and run with a stubbed `gh`, gives the expected result for each case:
    - production on HEAD, with and without an open alarm
    - a mismatch with no previous target
    - a new commit every night while every deploy succeeds: no issue
    - two dispatches in a row that never land: issue, dispatch, exit 1
    - a compare error: warning, no issue
    - an unknown `LIVE`
    - a previous run that finished 10 minutes ago: not judged
  - `actionlint` reports nothing new.
  - After the merge, a manual `workflow_dispatch` run of the drift check behaves as expected on the live repo. With production on HEAD it closes nothing and dispatches nothing. When it dispatches, it records `drift-target`.

## Plan

- **Changes**: the workflow step and the permission, the `ci.md` bullet, and the CHANGELOG entry.
- **Risks**:
  - The annotations API returns at most 50 annotations per page by default. The check job writes at most 3.
  - If a run is cancelled before it writes its notice, the next run sees no target and does not alarm. That costs one day of delay, not a false alarm.
- **Verification**: the Done-when items.

## Outcome

Shipped in #635 (`ad533aa5`, merged 2026-10-22T16:51:06Z, deployed and
verified by `/api/health/` commit).

- **Before the PR**:
  - `actionlint` and shellcheck were clean.
  - The Markdown backticks in the issue body carry a scoped `SC2016`
    disable.
  - The step, extracted and run with a stubbed `gh`, passed all 12 cases.
    Cases 6 and 7 were the only ones to exit 1.
  - On the live repo, the jq age expression returned `39687663189 64740`.
- **Manual `workflow_dispatch` run `39817827716`**, with production on main:
  - It printed `✅ production is on ad533aa5… — nothing to deploy`.
  - It wrote no annotations and dispatched no `Main CI/CD Pipeline` run.
  - No "Deploy not landing" issue is open.
- **Not yet observed live**: the dispatch path. Whether it writes the
  `drift-target` notice, and how the next run judges it, has only been seen
  in the stubbed cases. The first scheduled run that finds a mismatch will
  show it.
