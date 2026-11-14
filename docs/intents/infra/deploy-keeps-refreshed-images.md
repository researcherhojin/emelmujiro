---
status: shipped
module: infra
created: 2026-11-09
updated: 2026-11-10
---

# A deploy keeps the analytics images the nightly refresh verified

## Intent

- **Problem**: every deploy runs `docker compose up -d --build umami-db umami` (`scripts/deploy/auto-deploy.sh`, "Build the reviewed analytics recipes"). That build uses the layer cache, so it can bring back an older image than the one the nightly refresh just verified and applied.
  - The 2026-11-09 00:30 KST refresh replaced all three services with zlib `1.4-r0` candidates (CVE-2026-4738, #739).
  - At 2026-11-09T00:15:27Z (09:15 KST), the deploy of #753/#754 recreated `emelmujiro-umami` from `sha256:ab24adc6…`. That image was created 2026-11-01T16:21:28Z, and its `apk upgrade` layer dates from 2026-11-02 01:20 KST, so it carries zlib `1.3.2-r1`. Neither refresh candidate (`6637720a…`, `43155ed0…`) was used.
  - In the same deploys `umami-db` stayed on a `1.4-r0` image. Backend rebuilt its `apk upgrade` layer at 09:34 KST, because #755 changed `backend/uv.lock` and so the `dependencies` stage; `GIT_COMMIT` sat below that layer until #776 and did not invalidate it.
  - Measured with read-only host commands on 2026-11-09 (`.private/journal.md`, 2026-11-09 entry).
- **Outcome wanted**: a deploy whose commit range does not touch the analytics build inputs leaves the running `umami` and `umami-db` images as they are. A deploy that does touch them still rebuilds, as it does today.
- **Affected systems**: `scripts/deploy/auto-deploy.sh`; `.claude/rules/ci.md` › Runtime image recipes and Nightly image refresh; `CLAUDE.md` › Deployment (constraint pointer only).
- **Constraints**:
  - An edit to `auto-deploy.sh` takes effect one deploy late (`ci.md`).
  - The image-identity fallback (#630) must stay.
  - The nginx reload when the umami container changes, and the `/umami/api/send` 4xx check, must stay.
- **Open questions**: none. On 2026-11-09 the owner chose "build only when inputs change" over "always `--pull --no-cache`", which adds the full Umami build to every deploy and replaces images without the refresh's verification, and over "record only".

## Spec

- **Approach**: before the analytics step, compute `ANALYTICS_INPUTS_CHANGED` from `git diff --quiet "$PREV_HEAD" HEAD -- docker/umami docker/postgres docker-compose.yml`, the same pattern as `NGINX_CONF_CHANGED`. Build (`up -d --build`) when the inputs changed, or when either configured analytics image is missing locally (a fresh host). Otherwise run `docker compose up -d --no-build umami-db umami`, which starts whatever the tag points to; after a refresh, that is the verified candidate. Log which branch ran.
  - Rejected: `--pull --no-cache` on every deploy. It is slow, and it replaces images without candidate scans or backups.
  - Rejected: pinning refresh images by digest in Compose. The refresh already re-points the Compose tag, so that would add a second source of truth.
- **Files and interfaces**:
  - `scripts/deploy/auto-deploy.sh`: the analytics step only. Its log line, the #630 fallback, `ANALYTICS_RECREATED` and the nginx reload are unchanged.
  - `.claude/rules/ci.md`: one sentence each under Runtime image recipes and Nightly image refresh.
  - `CHANGELOG.md`: one entry.
  - `docs/intents/infra/security-operations.md`: the #739 regression bullet and one lesson.
- **Out of scope**:
  - Backend. The reason given here, that its build arg busts the cache on every deploy, was false: `ARG GIT_COMMIT` came after `RUN apk upgrade`. The 2026-11-14 deploy of `fd17f997` regressed it (#776), and `backend/Dockerfile` now declares the arg before the upgrade.
  - nginx: an upstream pin that refresh does not touch (#739).
  - Whether refresh should also cover `frontend`.
- **Done when**:
  1. `bash -n scripts/deploy/auto-deploy.sh` passes. `shellcheck`, if installed, reports nothing new.
  2. `npm run check:scripts` passes, and `npm run spell` reports 0 issues.
  3. End to end, on the second deploy after merge (the first runs the old script), with no `docker/` change in its range:
     - the host deploy log shows the "inputs unchanged" line;
     - `emelmujiro-umami`'s image ID equals its value before that deploy;
     - `apk info -v` in `emelmujiro-umami` reports zlib `1.4-r0`, given that the preceding 00:30 refresh succeeded.

## Plan

- **Changes**:
  1. `auto-deploy.sh`: add the `ANALYTICS_INPUTS_CHANGED` block next to `NGINX_CONF_CHANGED`.
  2. `auto-deploy.sh`: in the analytics step, choose `--build` or `--no-build` from that flag, or from a missing image found by `docker image inspect` on `docker compose config --images umami-db umami`.
  3. `ci.md` and `CHANGELOG.md`.
- **Risks**:
  - The first deploy after a `docker/` change in an earlier, skipped range: `PREV_HEAD` is the last deployed commit, so the range covers everything since then and nothing is skipped.
  - A missing local image: handled by the explicit check. It would otherwise show as a `no such image` failure in the deploy log.
  - `docker compose config --images` failing: `set -e` aborts the deploy before any container changes, which is visible in the log.
- **Verification**: Done when 1–2 locally and in CI; Done when 3 on the host after the second post-merge deploy.

## Outcome

Shipped in PR #757 (`69c2861e`); the `CHANGELOG.md` entry is under `## Merged since [1.0.0]`. Done when 1–2 passed in the PR and in CI. Done when 3 was verified on the host with read-only commands:

- The second deploy (run 42543784607, 2026-11-09T01:07Z) logged `Analytics inputs unchanged — keeping the current umami-db and umami images`.
- The 2026-11-10 00:30 KST refresh then replaced both containers (StartedAt 2026-11-09T15:33Z): `emelmujiro-umami` `sha256:ff5aeda6…`, `emelmujiro-umami-db` `sha256:dd650255…`, both zlib `1.4-r0`.
- The next deploy (run 42679114655, 2026-11-09T19:01Z, `/api/health/` commit `69c2861e`) logged the same line. Both image IDs and both StartedAt values were unchanged, and both containers still reported zlib `1.4-r0`.

The file stays because `security-operations.md` cites it for the #739 regression.
