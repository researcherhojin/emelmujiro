---
status: shipped
module: backend
created: 2026-10-17
updated: 2026-10-18
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

- **Changes**: (1) delete the `DummyCache` line and its comment from the early `if "test" in sys.argv` block; (2) in the `Test environment overrides` block at the end of `settings.py`, after the real `CACHES` is defined, set `CACHES["default"]["LOCATION"]` to `tempfile.mkdtemp(prefix="emelmujiro-test-cache-")` and remove it at exit with `atexit.register(shutil.rmtree, …, ignore_errors=True)`. Backend, `TIMEOUT` and `MAX_ENTRIES` stay those of production, which `RateLimitWindowTestCase` relies on.
- **Risks**: a parallel test run would need one directory per worker; no caller passes `--parallel` (`Makefile`, `pr-checks.yml`, `main-ci-cd.yml`, `scripts/update-test-counts.sh`), and `coverage run manage.py test` keeps `sys.argv[1] == "test"`.
- **Results** (2026-10-18): `settings.CACHES` under `manage.py test` prints `FileBasedCache` with `LOCATION` `$TMPDIR/emelmujiro-test-cache-<random>`; `DATABASE_URL="" uv run python manage.py test` → `Ran 387 tests`, `OK`; `ls -lT backend/.cache | md5 -q` is `d82a4697…` before and after, and no `emelmujiro-test-cache-*` directory remains. Control: the same run with `main`'s settings changed it to `633e8b26…`.
- **Verification**: the `Done when` list; `backend/.cache` compared by a listing of names, sizes and modification times before and after a full run.

## Outcome

**Shipped 2026-10-18 in #576** (`3bad07d2`); production reports `3bad07d2`. Every `Done when` item passed; the evidence is in `Plan` › `Results` and the PR body.

- **Departure:** none in the code. The first CI run failed `Spell check` on `atexit`, `shutil`, `rmtree` (added to `cspell.json`) and one abbreviation (reworded).
- **Lesson:** run `npm run spell` before pushing an intent whose Plan names code identifiers; the reviewer ran `black` and `prettier` but not spell.
