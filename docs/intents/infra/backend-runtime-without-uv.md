---
status: in-progress
module: infra
created: 2026-10-29
updated: 2026-10-29
---

# The backend runtime image ships no uv binaries

<!-- cspell:ignore rustls -->

## Intent

- **Problem**: Since the 2026-10-28T17:00Z host report, `images` and `refresh` are false (#705, `security-operations.md` › Fourth alarm). The only findings are 4 rustls advisories, each reported in both `bin/uv` and `bin/uvx` of the backend image (8 findings). `backend/Dockerfile:23` copies uv `0.12.24` into the runtime stage. Every released uv up to `0.13.6` locks rustls `0.23.45` (checked 2026-10-29T01:13Z), so a uv bump cannot fix it yet. The runtime image uses uv only as a launcher (`uv run`), not to install anything.
- **Outcome wanted**: the runtime image contains no `/bin/uv` or `/bin/uvx`, the image scan reports 0 backend findings, and every command that runs inside the container still works.
- **Affected systems**: `backend/Dockerfile` (`CMD`, `HEALTHCHECK`, `collectstatic`), `scripts/verify-backend-image.sh` (refresh candidate check), `Makefile` (`migrate`, `shell`, `createsuperuser`, `cleanup-sitevisits`, `setup-cron`, `setup-token-cron`), `.claude/rules/backend.md` › Tooling, `AGENTS.md`, and the two installed host cron lines (2 lines matched `uv run` in the host crontab on 2026-10-29).
- **Constraints**: Gotcha #17 (verify the deploy by commit). Migrations still run in the container before gunicorn (`backend.md` › Deployment). The refresh rollback rehearsal in `verify-backend-image.sh` runs the same `docker exec` against the previous image, which still has uv and no venv on `PATH`. The builder stage keeps uv, and the `backend.md` rule to re-lock with the image's uv still applies.
- **Open questions**: none. The owner chose this over waiting for a uv release or an image-scan ignore (2026-10-29).

## Spec

- **Approach**: Drop the `COPY … /uv /uvx` line from the runtime stage. Set `VIRTUAL_ENV=/app/.venv` and put `/app/.venv/bin` first on `PATH`, so `python`, `gunicorn` and `python manage.py …` resolve to the venv. Every in-container caller in the repo calls `/app/.venv/bin/python` by absolute path. That path exists in both old and new images, so the rollback rehearsal and the host cron lines keep working across a rollback.
  - Rejected: a `uv` shell shim in the image. It would keep `uv run` callers working, but it hides a binary name that no longer exists.
  - Rejected: an image-scan ignore. That is what the owner declined.
  - Rejected: waiting for a uv release. No release date exists.
- **Files and interfaces**:
  - `backend/Dockerfile`: runtime stage `ENV`, `collectstatic`, `CMD`, `HEALTHCHECK`.
  - `scripts/verify-backend-image.sh:30`.
  - `Makefile` lines 125, 128, 131, 141, 152, 169.
  - `.claude/rules/backend.md` › Tooling, `AGENTS.md:53`, CHANGELOG.
  - Host: rerun `make setup-cron` and `make setup-token-cron`. Both replace their own line.
- **Out of scope**: the uv pin in the builder stage and in `setup-uv`. A later uv bump moves both together, as before. CI and local dev keep `uv run`.
- **Done when**:
  1. `docker run --rm --entrypoint sh <image> -c 'command -v uv uvx'` prints nothing and exits non-zero.
  2. `scripts/verify-backend-image.sh <new> <commit> <current production image> <its commit>` passes. This covers health, `migrate --check` on both images, and the rollback.
  3. Trivy image scan of the new image: 0 findings.
  4. CI `Docker Images` is green.
  5. After deploy: `/api/health/` reports the merge commit, and the container is `healthy`.
  6. On the host, `crontab -l | grep -c 'uv run'` is `0`, and both cron commands run once by hand.
  7. End-to-end: refresh succeeds, the rerun host job reports `images` and `refresh` true, and a dispatched watchdog closes #705.

## Plan

- **Changes**:
  1. `backend/Dockerfile` runtime stage: remove the uv `COPY`, drop the `UV_*` env, add `VIRTUAL_ENV` and `PATH`, and run `collectstatic`, `CMD` and `HEALTHCHECK` through `/app/.venv/bin/python` and `/app/.venv/bin/gunicorn`.
  2. `scripts/verify-backend-image.sh:30`: change to `/app/.venv/bin/python manage.py migrate --check`.
  3. `Makefile`: change the 6 `uv run python` container calls to `/app/.venv/bin/python`.
  4. Update `.claude/rules/backend.md` › Tooling, `AGENTS.md:53`, `ci.md` › Runtime image recipes (one clause), and CHANGELOG.
  5. After the deploy, on the host: rerun `make setup-cron` and `make setup-token-cron`, run `scripts/refresh-images.ts` (owner approved 2026-10-29), rerun the host job, and dispatch the watchdog.
- **Risks**:
  - The venv's `python` symlink must resolve in the runtime stage. Both stages use the same base image, so it should. A broken link would fail Done-when 2 locally.
  - `exec gunicorn` must stay PID 1. Signals would show as slow container stops.
  - Each installed host cron line breaks between the deploy and step 5. Both run at 03:00 and 03:15 KST, so finish step 5 the same day.
- **Verification**: the Spec's Done-when 1–7, in order. Run 1–3 locally on an image built from the branch.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
