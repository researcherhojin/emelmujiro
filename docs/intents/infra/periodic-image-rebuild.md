---
status: draft
module: infra
created: 2026-10-28
updated: 2026-10-28
---

# Running images pick up OS patches without waiting for a deploy

## Intent

- **Problem**: the locally built images (`backend`, `umami`, `umami-db`) get Alpine package fixes only when a deploy rebuilds them, and only if the host's build cache misses the `apk` layer.
  - #689: the 2026-10-26 and 2026-10-27 02:00 runs reported 48 findings in `umami`, all Alpine `curl` / `libcurl` `8.22.0-r0`, fixed in `8.23.0-r0`. Alpine's `v3.24/main` served `8.23.0-r0` when checked on 2026-10-27.
  - In the host deploy log, `[umami base 2/2] RUN apk upgrade` was `CACHED` on the 2026-10-26 deploys, and ran fresh on the #690 deploy (2026-10-27T17:49Z). That rebuild of the unchanged `3.4.0-security-2` recipe already carried `8.23.0-r0`. The alarm lasted because no deploy happened between the Alpine fix and the 02:00 run, not because the recipe was wrong.
  - Why the cache missed on 2026-10-27 is unmeasured. `docker buildx du` on the host reported 10.55 GB reclaimable on 2026-10-28, which points to builder garbage collection, but nothing confirms it.
  - The frontend is out of this: it runs the upstream `nginx:1.31.8-alpine-slim` pin, and #673 showed that a re-pull cannot fix a package upstream has not rebuilt.
- **Outcome wanted**: a fix published in the image's Alpine branch reaches the running `backend`, `umami` and `umami-db` containers within a set time, with no code change and no deploy.
- **Affected systems**: `scripts/auto-deploy.sh` (build steps), `Makefile` (`setup-security-cron` or a new cron target), `docker-compose.yml`, `.claude/rules/ci.md` › Runtime image recipes and Operational logs.
- **Constraints**:
  - Analytics builds keep `provenance: false` and `sbom: false`, so a rebuild leaves the image ID readable (`ci.md`).
  - A recreated umami container needs the nginx reload and the `/umami/api/send` 4xx check that `auto-deploy.sh` already runs.
  - The backend image bakes `GIT_COMMIT`, and `/api/health/` must keep reporting the deployed SHA (Gotcha #17).
  - Cron output goes to `backend/logs/<name>.log`, and cron's `PATH` has no `docker` (`ci.md`).
- **Open questions**:
  - Cadence: daily before the 02:00 scan, or weekly? The owner's tolerance for an alarm that a rebuild would clear decides it.
  - Mechanism: a separate cron job (`docker compose build --pull --no-cache` and then `up -d`), or a step inside `scripts/scheduled-security.ts` before the image scan. The second keeps one job but makes the scan change what it measures.
  - Is an unattended recreate of `backend` acceptable? It reuses `auto-deploy.sh`'s checks only if that logic moves into a shared script.
  - Is the cache miss builder GC? Reading the Docker Desktop builder GC settings on the host answers it.

## Spec

<!-- Filled when status becomes approved. -->

## Plan

<!-- Filled before the first edit. Plan mode output goes here. -->

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
