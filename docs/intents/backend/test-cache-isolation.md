---
status: approved
module: backend
created: 2026-10-17
updated: 2026-10-17
---

# Backend tests use their own cache directory, and the dead `DummyCache` block is gone

## Intent

- **Problem**: `backend/config/settings.py` sets `CACHES` to `DummyCache` inside the early `if TESTING` block, with the comment "DummyCache prevents middleware rate limiting from leaking between test classes". The unconditional `CACHES` (`FileBasedCache`, `backend/.cache`) further down overrides it. Measured 2026-10-16: `settings.CACHES` under `manage.py test` is `FileBasedCache`. Tests therefore share `backend/.cache` with the local dev server.
- **Outcome wanted**: under `manage.py test`, `CACHES` is a `FileBasedCache` in a test-only location; no setting claims to do something it does not.
- **Affected systems**: `backend/config/settings.py`.
- **Constraints**: several test classes now depend on a real cache (`CategoryCacheTestCase`, `RateLimitWindowTestCase`, which tests on the production backend on purpose — `.claude/rules/backend.md`). Moving the `DummyCache` block below the real one would break them.
- **Open questions**: none.

## Spec

- **Approach**: give tests their own `LOCATION` (a temporary directory) for the same `FileBasedCache` backend, and delete the dead `DummyCache` block and its comment. Rejected: moving the block so it wins, which breaks the tests above.
- **Files and interfaces**: `backend/config/settings.py` `CACHES`.
- **Out of scope**: test-ordering fixes, and `cache.clear()` in individual test classes.
- **Done when**: `settings.CACHES` printed under `manage.py test` shows `FileBasedCache` with a location outside `backend/.cache`; the full suite passes with `DATABASE_URL=""`; `backend/.cache` is unchanged after a test run.

## Plan

<!-- Filled before the first edit. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
