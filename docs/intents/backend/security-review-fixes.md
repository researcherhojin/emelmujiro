---
status: shipped
module: backend
created: 2026-10-23
updated: 2026-10-23
---

# Security review fixes

## Intent

The review reproduced staff deleting or disabling a superuser, password changes
bypassing configured validators, and verified contact submissions failing because
the reCAPTCHA token reaches the model constructor.

## Spec

- Reject staff PATCH and DELETE requests targeting superusers, while preserving
  reads and existing management of ordinary users.
- Apply Django password validators before saving a changed password; failures
  return 400 without changing the password or issuing cookies.
- Remove the verification-only reCAPTCHA field before creating a Contact.
- Add regression tests for rejected requests and permitted operations.
- Files: `backend/api/admin_views.py`, `backend/api/auth.py`,
  `backend/api/serializers.py`, `backend/api/test_review_regressions.py`,
  and `CHANGELOG.md`.
- Inspect running images on the deployment host using the existing scanner.
- Logout must revoke the refresh cookie and clear cookies even when access has
  expired; explicit CSRF checks remain mandatory. Missing tokens are idempotent.
- Authentication inputs reject non-string and oversized values; profile writes
  validate email and field lengths before saving. Ambiguous email login fails.
- Add `Makefile` token cleanup scheduling, preserve existing cron entries, and
  verify the command on the deployment host. Include `backend/api/tests.py` for
  the revised logout contract and the backend rule for its CSRF invariant.
- Verify Cloudflare login limits if an authorized dashboard session is available;
  otherwise report that access blocker without assuming protection exists.
- Commit and deploy the verified fixes, checking the live commit afterward.

## Plan

1. Update admin permissions, password validation, and contact serialization.
2. Run regression tests, the backend suite, formatting, and lint checks.
3. Review the diff and record running-image scan results privately.
4. Add a CHANGELOG entry, commit, deploy, and verify the live commit.

## Done when

The reproduced failures are covered by passing regression tests, the backend
suite and lint pass, and image scan results or an explicit blocker are reported.

## Verification

- 2026-10-23: The expanded regression file contains 19 tests.
- The full backend suite passed: 446 tests.
- Black, flake8, spelling, and `git diff --check` passed.
- Independent review found no material correctness or spec-compliance gaps.
- The existing running-image scanner completed with zero findings for each of
  the four services. Operational reports remain on the host under
  `backend/logs/security/`; host details stay in `.private/operations.md`.
- Daily expired-token cleanup was installed idempotently and existing cron
  entries were preserved. The cleanup command was exercised in the container.
- Cloudflare dashboard inspection is blocked: Computer Use denied access to
  Brave Browser. No edge rule changes are claimed.

## Outcome

Shipped in `0960ed63d797795e70881fa0d2ad8568e5604c9b` on 2026-10-23.
[Main CI/CD run](https://github.com/researcherhojin/emelmujiro/actions/runs/39906738779)
passed all five jobs. The public health endpoint returned that exact commit.
The deployed container passed 52 targeted security tests in an isolated test
database, and all four running-image scans reported zero findings.

The additional authentication defects and the earlier account/password/contact
findings are fixed. Daily expired-token cleanup is installed and verified.
Cloudflare edge-rate-limit inspection remains unverified because Computer Use
refused browser access; no edge configuration was changed.
