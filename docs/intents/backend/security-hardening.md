---
status: shipped
module: backend
created: 2026-10-22
updated: 2026-10-22
---

# Harden cookie authentication and public API boundaries

## Intent

The security review reproduced password-change token reuse, missing CSRF checks
on cookie-authenticated writes, forwarded-header throttle key changes, and
anonymous access to draft comments. The user authorized remediation.

## Spec

- Require Django CSRF verification for cookie-authenticated writes and login.
  Provide a non-cacheable token endpoint for the frontend on a separate origin.
- Reject access and refresh tokens issued before a password change, including
  refresh attempts for inactive users. Existing tokens without the password
  claim require signing in again after deployment.
- Use the trusted client IP helper for API throttles.
- Apply parent-post visibility to comment reads and writes; reject replies
  associated with another post.
- Exclude development origins in production CORS configuration and bound Docker
  logs to three 10 MB files per container.
- Files: backend authentication, throttles, comments, settings, URL routes and
  regression tests; frontend API client and tests; Compose; changelog and the
  backend rules needed to describe the changed behavior.
- Out of scope: dependency upgrades, image scanning, new authentication methods,
  and unrelated upload validation changes. Operational details stay private.
- Done when: regression tests reject the reproduced attacks, valid login and
  refresh work with CSRF, bearer clients remain supported, backend tests and
  relevant frontend checks pass, and the change receives independent review.

## Plan

1. Add CSRF bootstrap and enforcement, password-claim checks, trusted-IP throttles,
   comment authorization and production configuration restrictions.
2. Connect the frontend write interceptor to CSRF bootstrap; add regression tests.
3. Run backend tests/lint, frontend service tests/type-check/lint, and Compose
   configuration checks. Review against this spec before deployment.
4. Record results and deployment status. Deploy only a reviewed, tested commit.

## Outcome

Deployed on 2026-10-22 as `bab3c68b3b98b79142272edf9b0bd1199e7f2fd5`. Verification on
2026-10-22: all 411 backend tests passed, including 17 security regression tests;
all 1,284 frontend tests across 69 files passed. Type checking, frontend ESLint,
changed Python files' Black and flake8 checks, spelling and Compose configuration
validation passed. The reported Ruff I001, BLE001 and RUF012 diagnostics were
resolved with sorted imports, explicit logout exceptions and ClassVar annotations.
Logout database failures return 503 and clear cookies, covered by regression tests.
Coverage for authentication, throttles, views and serializers was 100% of
statements; combined statement/branch coverage was 99%, with the disabled
refresh-blacklisting configuration branch not exercised.

Real Chrome verification used isolated HTTPS origins, a production Vite bundle,
DEBUG=False, secure cookies, FileBasedCache and three Gunicorn workers. Login,
editor saves, expired-access refresh/retry, password-change token revocation and
logout passed. Missing CSRF and an untrusted-origin form with valid credentials
were rejected; anonymous draft comments were hidden. Three regression tests for
CSRF, forwarded-header throttling and draft comments failed against the original
commit and passed against the working tree. This did not exercise the full
prerender build pipeline or the deployed Cloudflare path.

Independent review found and resolved development proxy
Origin handling and anonymous throttle coupling in CSRF bootstrap; the follow-up
review found no remaining correctness gaps.

The editor-diagnostic follow-up preserves public-view exception boundaries while
recording tracebacks, annotates shared view configuration and optional IP values,
and simplifies chunked upload writes. Settings now import time utilities at module
start and use a string environment default. Generated Playwright artifacts are
excluded from spelling checks. The backend's 411 tests, selected Ruff rules across
the changed application modules, Black, flake8 and repository spelling checks
passed again; independent review found no concrete regression in this follow-up.

Frontend and backend were deployed together. All four containers are healthy
and use the configured log limits. Live checks confirmed secure CSRF cookies,
allowed production Origin, excluded localhost Origin and a 403 for login without
CSRF. Existing sessions must sign in again after this deployment.

Deployment verified against the public health endpoint, whose baked commit matched
the tested SHA. All five jobs in [Main CI/CD run 39746839447](https://github.com/researcherhojin/emelmujiro/actions/runs/39746839447)
succeeded. The deployed English homepage and sitemap were checked again.
