---
status: shipped
module: infra
created: 2026-11-10
updated: 2026-11-10
---

# The frontend nginx image takes Alpine fixes without waiting for an upstream rebuild

## Intent

- **Problem**: `frontend` runs the upstream pin `nginx:1.31.8-alpine-slim` (`docker-compose.yml`), so only a Docker Hub rebuild can patch its Alpine packages. Alarm #739 has been open since 2026-11-08 for that reason.
  - The 2026-11-09T17:00Z host report had `images: false` only, with one finding: `frontend` zlib `1.3.2-r1`, CVE-2026-4738 (MEDIUM), fixed in `1.4-r0`. `backend`, `umami` and `umami-db` were clean.
  - On 2026-11-10 Docker Hub still showed `1.31.8-alpine-slim` `last_updated` 2026-11-05T22:08:32Z. Every `*-alpine-slim` tag was last pushed on 2026-11-05.
  - Alpine published zlib `1.4-r0` on 2026-11-06. The three services built from local recipes picked it up through the nightly refresh (`security-operations.md` › #739).
  - Refresh never rebuilds `frontend`, because it has no recipe (`scripts/maintenance/refresh.ts`, `REFRESH_SERVICES`).
- **Outcome wanted**: `frontend` is built from a reviewed local recipe on the same nginx upstream, with `apk upgrade`. The nightly refresh rebuilds, verifies and applies it like the other three, so an Alpine fix reaches all four running images without a code change. #739 closes.
- **Affected systems**:
  - `docker-compose.yml` (`frontend`), a new `docker/nginx/`, and `scripts/deploy/auto-deploy.sh` (frontend step).
  - `scripts/maintenance/refresh.ts` and its tests, `.github/workflows/pr-checks.yml` (`Docker Images`), and `.github/dependabot.yml`.
  - `.claude/rules/ci.md`: Runtime image recipes, CI job gating, Nightly image refresh.
- **Constraints**:
  - An `auto-deploy.sh` edit takes effect one deploy late (`ci.md`).
  - A nginx.conf change must still be validated before the frontend container is recreated.
  - Locally built images set `provenance: false` and `sbom: false` (#630).
  - Refresh holds the maintenance lock and rolls back every replaced service on failure.
  - The `-alpine-slim` variant stays (#673, #686).
- **Open questions**: none.
  - On 2026-11-08 the owner chose to wait for upstream. On 2026-11-10 the owner reversed that, choosing a local recipe and including `frontend` in the nightly refresh over the "recipe only, refresh later" option.

## Spec

- **Approach**: a fourth local recipe on the existing pattern.
  - `docker/nginx/Dockerfile`: `FROM nginx:1.31.8-alpine-slim`, then `RUN apk upgrade --no-cache`, and nothing else. `nginx.conf` and `frontend/build` stay bind mounts, so the image carries no site content.
  - Compose builds it as `emelmujiro/nginx:1.31.8-security-1`.
  - `auto-deploy.sh` builds it only when `docker/nginx` or `docker-compose.yml` changed in the deployed range, or when the image is missing locally. Otherwise it starts what the tag points to, which after a refresh is the verified candidate. This is the #757 rule.
  - Refresh adds `frontend` last in `REFRESH_SERVICES`, with candidate verification by `docker/nginx/verify.sh`.
  - Rejected:
    - Recipe without refresh. Every later Alpine fix would need a recipe-tag bump by hand or by triage.
    - Pinning the upstream by digest. It changes nothing while upstream has not rebuilt.
    - A Trivy ignore. The finding remains, and image scans take no ignore file (#705).
- **Amended 2026-11-10 (#774)**: when the frontend inputs changed or its image is missing, `auto-deploy.sh` now runs `docker compose build --pull --no-cache frontend` and starts both frontend `up -d` calls with `--no-build`, instead of `--build` on the `up -d`.
- **Files and interfaces**:
  - `docker/nginx/Dockerfile` (new).
  - `docker/nginx/verify.sh <image> <nginx.conf>` (new). It must:
    - pass `nginx -t` on the candidate with the given config, with `backend` and `umami` mapped to loopback as the CI step does;
    - start nginx with that config and a throwaway html directory holding `index.html` and `app.html`, with no network;
    - get `200` for `/` through the image's own BusyBox `wget`, which the Compose healthcheck uses;
    - print `nginx -v` and the zlib version, then `PASS`.
  - `docker-compose.yml` › `frontend`: `build` (context `./docker/nginx`, `provenance: false`, `sbom: false`) and `image: emelmujiro/nginx:1.31.8-security-1`. Volumes, healthcheck and ports are unchanged.
  - `scripts/deploy/auto-deploy.sh`: a `FRONTEND_INPUTS_CHANGED` block next to `ANALYTICS_INPUTS_CHANGED`, and a build flag on the frontend `up -d` (`--build` or `--no-build`). The nginx.conf pre-validation and the force-recreate path stay. Each branch logs which one ran.
  - `scripts/maintenance/refresh.ts`:
    - `REFRESH_SERVICES` gains `frontend` (last) and `contexts` gains `frontend: 'docker/nginx'`.
    - The verify phase runs `docker/nginx/verify.sh` on the candidate with the source tree's `frontend/nginx.conf`.
    - The #739 audit exemption comment goes away, because all four services are now refreshed.
  - `scripts/tests/refresh.test.ts`: the frontend candidate is built, verified, scanned and applied after `backend`. A frontend finding now rolls back. This replaces the #739 "frontend findings alone do not roll back" test, which is inverted.
  - `.github/workflows/pr-checks.yml` › `Docker Images`:
    - the `nginx` flag also matches `^docker/nginx/`;
    - the step builds `./docker/nginx` and runs `verify.sh` on it, instead of grepping `image: nginx:` from Compose.
  - `.github/dependabot.yml`: add `/docker/nginx` to the `docker` directories. Rewrite the `docker-compose` entry's comment, which says it watches nginx, and fix the stale lines 37–39 comment the journal Backlog defers to "the next real edit".
  - `.claude/rules/ci.md`: the Runtime image recipes lead sentence and a `docker/nginx/` bullet, the Docker Images nginx bullet, and the Nightly image refresh lines (four services, and a deploy keeps the refreshed `frontend` too).
  - `CHANGELOG.md`: one entry.
- **Out of scope**:
  - The `#739` Recovery line and dropping `open: …` from the `ci.md` alarm list. Both happen after the host job reports `images: true`, in the close-out commit.
  - nginx version changes. Dependabot proposes them through `/docker/nginx`.
  - `scan-running-images.ts` and the triage allowlist. Both already cover a Dockerfile-built `frontend`.
- **Done when**:
  1. `bash -n scripts/deploy/auto-deploy.sh` and `shellcheck scripts/deploy/auto-deploy.sh docker/nginx/verify.sh` report nothing new.
  2. `npm run check:scripts` passes, including the updated refresh tests. The inverted #739 test fails on the old `refresh.ts`. `npm run spell` reports 0 issues.
  3. In the PR, `Docker Images` runs the nginx step: it builds `docker/nginx`, and `verify.sh` prints `PASS` with zlib `1.4-r0`.
  4. End to end on the host, after the merge deploy:
     - `emelmujiro-frontend` runs an `emelmujiro/nginx` image with zlib `1.4-r0`, and `https://emelmujiro.com/` answers `200`;
     - the next 00:30 refresh ends `success: true, phase: complete` with a `frontend` candidate;
     - a host job rerun reports `images: true`, and the dispatched watchdog closes #739.

## Plan

- **Changes**, in order:
  1. Add `docker/nginx/Dockerfile` and `docker/nginx/verify.sh`. The script uses `--network none` with `--add-host backend:127.0.0.1 --add-host umami:127.0.0.1`, mounts the config read-only, and mounts a `mktemp -d` html directory read-only. A `trap` removes the container and the directory.
  2. `docker-compose.yml` › `frontend`: add `build` and the local image tag.
  3. `auto-deploy.sh`:
     - set `FRONTEND_INPUTS_CHANGED` from `git diff --quiet "$PREV_HEAD" HEAD -- docker/nginx docker-compose.yml`;
     - set `FRONTEND_BUILD` from that flag, or a missing `docker compose config --images frontend` image;
     - pass `--build` or `--no-build` to both frontend `up -d` calls, and log the branch.
  4. `refresh.ts`: add `frontend` to `REFRESH_SERVICES` and `contexts`, add the verify call, and drop the #739 exemption comment. The service-name filter in the audit stays, because `scan-running-images.ts` may report services outside `REFRESH_SERVICES`.
  5. `refresh.test.ts`: four services; the inverted #739 test; a check that the frontend verify call receives the source tree's `frontend/nginx.conf`.
  6. `pr-checks.yml`: the `nginx` flag and step. `dependabot.yml`: the directory and the two comments.
  7. `ci.md` and `CHANGELOG.md`.
- **Risks**:
  - The first deploy after the merge runs the #757 script. Compose changed, so it rebuilds `umami-db` and `umami` from cache and may bring back a zlib `1.3.2-r1` layer, as on 2026-11-09. It shows in `docker exec emelmujiro-umami apk info -v`. Then rerun the refresh by hand, or wait for 00:30.
  - On that first deploy, the old script's plain `up -d frontend` builds the missing `emelmujiro/nginx` image because Compose builds a missing image by default. If it does not, the deploy fails on `up` before any frontend change, and the log shows it.
  - nginx resolves `backend` and `umami` at start. `verify.sh` maps both to loopback, as CI does today. On the host the Compose network resolves them.
  - Refresh now recreates `frontend` every night, for a few seconds at 00:30 KST, because a `--no-cache` build yields a new image ID.
- **Verification**: Done when 1–2 locally, Done when 3 in the PR's CI (no local Docker on this MacBook), and Done when 4 on the host after the merge.

## Outcome

Shipped in PR #758 (`6b34ce34`); the `CHANGELOG.md` entry is under `## Merged since [1.0.0]`.

- Done when 1–2 passed locally (`check:scripts` 73/73; 8 of 20 refresh tests fail on the old `refresh.ts`; spell 0; shellcheck clean).
- Done when 3: PR #758's `Docker Images` printed `Upgrading zlib (1.3.2-r1 -> 1.4-r0)`, `syntax is ok`, `zlib-1.4-r0` and `PASS`.
- Done when 4:
  - After the merge deploy, `emelmujiro-frontend` runs `emelmujiro/nginx:1.31.8-security-1` (zlib `1.4-r0`, healthy), and `/` answers `200`.
  - A manual run of the refresh cron command ended `success: true, phase: complete` with a `frontend` candidate. This was its first live run with four services.
  - The host job at 2026-11-09T21:20:14Z reported `images: true` with all four services `clean`, and watchdog run 42701539583 succeeded.
  - #739 had been closed at the merge (20:44:44Z), before this verification.
- Departures:
  - Implemented in the same session rather than a fresh one, at the owner's request.
  - The refresh check used a manual run of the cron command, not the 00:30 slot.
- Lesson: the Plan's first-deploy risk happened as written. `umami` went back to `ab24adc6…` (`1.3.2-r1`) because the old script saw the `docker-compose.yml` change and rebuilt from cache. Any change that touches `docker-compose.yml` will do this once until the next refresh, so plan a manual refresh after such a merge.
