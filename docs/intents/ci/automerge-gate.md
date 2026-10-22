---
status: shipped
module: ci
created: 2026-10-17
updated: 2026-10-22
---

# A dependabot patch that breaks lint or types is not auto-merged

## Intent

- **Problem**: `Auto-Merge Dependabot` in `pr-checks.yml` merges `semver-patch` PRs once `affected-tests` succeeds (`needs: affected-tests`, added `2ba36943` on 2026-09-28). That gate covers tests only.
  - **Measured 2026-10-06**: #543 (`@tiptap/core` 3.31.4) auto-merged at 04:26:32Z while `Frontend Lint` had been `FAILURE` since 04:24:00Z (tsc, the Gotcha #14 split) and `Test Affected Code` was `SUCCESS`. Production sat on `4421cb99` for 24.5 h until `de3c667d`.
  - **Before the gate (measured 2026-09-28)** across 9 auto-merged PRs, every gating job completed after the merge, and #517, #521 and #522 merged with `Test Affected Code = failure`.
- **The gate does run on its live path — measured 2026-10-17** from GitHub job timestamps for the five PRs auto-merged on 2026-10-12 (#561, #563, #564, #565, #566): in every case `Auto-Merge Dependabot` started after `Test Affected Code` completed, and the merge landed 3 min 27 s to 10 min 6 s after PR creation, against about 15 s before the gate. Not yet observed: a failing `Test Affected Code` leaving the PR open, and the 6-attempt merge retry past attempt 1.
- **First observed block on a real PR — 2026-10-17T17:40Z (02:40 KST on 10-18)**, from the run that #585's `dependabot.yml` edit triggered:
  - #589 (`@vitest/ui` 5.0.3 → 5.0.4, `semver-patch`) pulled a second `vitest` into the tree, so `jest-dom`'s matcher types failed tsc. `Frontend Lint` failed at 17:41:30Z, `Test Affected Code` failed at 17:41:44Z, and `Auto-Merge Dependabot` was `skipped` at 17:41:44Z. The PR stayed open and was closed by the bundled bump #602. This answers "a failing `Test Affected Code` leaving the PR open".
  - It does not separate the two jobs: both failed, so whether a lint-only failure would still merge (the #543 shape) remains open.
  - The seven patches that passed merged without a human: #587 and #588 (backend) 45 s and 49 s after creation, #594, #596, #597, #598 (frontend) 2 min 53 s to 4 min 3 s, and #601 1 min 44 s.
- **Outcome wanted**: a dependabot patch whose `Frontend Lint` (which runs `tsc`) or `Test Affected Code` fails stays open; one that passes both still merges without a human.
- **Affected systems**: `.github/workflows/pr-checks.yml` (`dependabot-auto-merge` job).
- **Constraints**: required status checks on `main` are rejected for the solo two-device hotfix workflow (`CLAUDE.md` `Branch protection`). `Main CI/CD Pipeline` does not run E2E or Lighthouse, so moving them post-merge is a coverage change, not a relocation. A conflicted dependabot PR skips `affected-tests` and therefore auto-merge, and needs `@dependabot rebase` by hand.
- **Options**: (1) add `Frontend Lint` to the job's `needs` and `if`, at the cost of a little merge latency; (2) leave it and rely on `pipeline-watchdog`, whose measured scheduler lag means a broken `main` can sit most of a day.
- **Open questions**: does adding `Frontend Lint` change the billed minutes noticeably? Irrelevant while the repo is public (unlimited minutes); measured 2026-09-28, 1,056 of 1,099 billed `Pull Request Checks` minutes per month were dependabot PRs.

## Spec

- **Approach** (owner chose option 1 on 2026-10-18, without waiting for a lint-only failure to be observed): `dependabot-auto-merge` needs `affected-tests`, `frontend-lint` and `backend-lint`, and its `if:` requires all three `success`. `Backend Lint` is included as well as the `Frontend Lint` the Intent names, because a formatter bump (black) can fail lint with every test green. Neither lint job has a job-level `if:`, so each is `skipped` only behind a failed `quick-checks`, which must block too — testing for `success` covers it with no escape hatch.
- **Files and interfaces**: `.github/workflows/pr-checks.yml` (`dependabot-auto-merge` `needs` and `if`, plus its comment); `CLAUDE.md` Gotcha #12 (edited in place, number unchanged); `.claude/rules/ci.md` `CI job gating`; `CHANGELOG.md`.
- **Out of scope**: E2E, Lighthouse and Security Scan as gates; the merge-retry loop; required status checks on `main`.
- **Done when**: the workflow parses and the job's `needs` lists the three jobs; `CLAUDE.md` stays at 199 lines with 19 Gotchas; the next patch PR after merge is auto-merged only after both lint jobs report `success` (job timestamps), recorded in `Outcome`.

## Plan

- **Change**: one `needs` list and one `if:` in `pr-checks.yml`; the docs that quote the old `needs: affected-tests`.
- **Cost, measured**: across the 7 auto-merged PRs of 2026-10-17 (#587, #588, #594, #596, #597, #598, #601), the later lint job finished 0 s to 38 s after `Test Affected Code` — the added wait before a merge.
- **Risk**: a lint job that starts failing for a reason unrelated to the bump would hold every patch open; it shows as open dependabot PRs with a red lint check, and the fix is the lint, not the gate.

## Outcome

Shipped in #607 (`33a513c2`, merged 2026-10-17T19:10:47Z). Done-when evidence
from GitHub job timestamps (UTC): every `semver-patch` Dependabot PR auto-merged
after #607 started `Auto-Merge Dependabot` only after both lint jobs succeeded.

| PR           | Frontend Lint done | Backend Lint done | Test Affected Code done | Auto-Merge started |
| ------------ | ------------------ | ----------------- | ----------------------- | ------------------ |
| #614 (10-19) | 00:11:05           | 00:10:40          | 00:11:14                | 00:11:22           |
| #613 (10-19) | 00:13:32           | 00:13:35          | 00:14:05                | 00:14:11           |
| #616 (10-19) | 00:13:59           | 00:14:16          | 00:14:13                | 00:14:18           |
| #618 (10-19) | 00:20:00           | 00:20:37          | 00:20:41                | 00:21:27           |
| #623 (10-22) | 09:15:28           | 09:14:52          | 09:15:37                | 09:15:39           |

#615 (cspell 10.3.6 → 10.4.0, a minor) was merged by the owner, as the policy
holds minors for review. A patch whose only failure is a lint job has not yet
occurred, so the blocking half is verified by configuration (`needs` plus `if`),
not by an observed held PR.
