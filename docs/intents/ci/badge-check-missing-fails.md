---
status: in-progress
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# A README badge the check cannot read fails the check

## Intent

- **Problem**: `Check README badge versions match package-lock.json and uv.lock` (`pr-checks.yml`, in `Repo Checks (informational)`) compares a badge only when both versions were read. `check_badge` and `check_backend_badge` test `[ -n "$pkg_ver" ] && [ -n "$badge_ver" ]` before comparing and have no other branch.
  - Measured on 2026-10-23 by running the step's script, extracted verbatim, under `bash -e`:
    - A README copy with the React badge deleted exits `0` and prints `All README badges match package-lock.json and uv.lock`.
    - A copy whose React badge shows another version exits `1`, as it should.
  - So these drift silently: a dropped dependency whose badge stays, a badge whose label or format changes, or a package missing from its lockfile. `scripts/sync-readme-badges.sh` cannot heal any of them; it prints a skip warning on `main` that nothing reads.
  - The `local x=$(…)` assignments are 4 of the 5 shellcheck findings `actionlint` reports for `pr-checks.yml` (SC2155): `local` hides the command's exit status.
  - The fifth, SC2086 in `Check bundle size`, is cosmetic. A missing build directory already fails that step one line earlier, at `du -sh` (reproduced).
- **Outcome wanted**: every badge the step lists is found in README and resolved in its lockfile, or the step fails and says which one is missing. `actionlint` reports nothing for `pr-checks.yml`.
- **Affected systems**: `.github/workflows/pr-checks.yml` (that step, and the `[` test in `Check bundle size`), `.claude/rules/ci.md` › README drift gates, `CHANGELOG.md`.
- **Constraints**:
  - Today all 18 badges resolve, so the stricter check must pass on `main` unchanged.
  - The sync script keeps skipping with a warning: an auto-healer cannot invent a missing badge, and the check is the gate.
  - Cite steps by name (Gotcha #12).
- **Open questions**: none. The owner approved this on 2026-10-23.

## Spec

- **Approach**: declare the locals first, then assign them, so a failing `awk` or `node` stops the step under `bash -e`. Then branch three ways: package missing from its lockfile, badge missing from README, versions differ. Each counts as an error, with its own message. The summary says that a missing badge or package needs a hand fix, not the sync script. `Check bundle size` quotes its operands.
  - Rejected: making the sync script fail instead. It runs on `main` after the merge, and a red `Sync README Badges` would block nothing and tell no one before the merge.
- **Files and interfaces**: the two functions and the summary in that step; one `[` test in `Check bundle size`; the README drift gates bullet in `ci.md`.
- **Out of scope**: the sync script, the test-count gate, and which badges are listed.
- **Done when**:
  - The step's script, extracted verbatim and run under `bash -e` on copies of the repo files, gives:
    - real files: exit `0`
    - React badge deleted: exit `1`, naming it
    - React badge version changed: exit `1`
    - `axios` removed from the `package-lock.json` copy: exit `1`, naming it
    - `gunicorn` removed from the `uv.lock` copy: exit `1`, naming it
    - an unreadable `package-lock.json`: a non-zero exit
  - The same cases on `main`'s version show the bug: the deleted badge exits `0`.
  - `actionlint` with shellcheck reports nothing for `pr-checks.yml`.
  - This PR's own `Repo Checks (informational)` passes on the real files.

## Plan

- **Changes**: this intent; `pr-checks.yml`; `ci.md`; the `CHANGELOG.md` entry.
- **Risks**: a badge that was being skipped without anyone knowing would turn the step red on every PR. All 18 resolve today, which the first case checks.
- **Verification**: the Done-when checks. Review is the cases plus the advisor; the owner excluded review tools this session.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
