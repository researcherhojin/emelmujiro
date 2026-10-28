---
status: shipped
module: infra
created: 2026-10-28
updated: 2026-10-28
---

# Running images pick up OS patches without waiting for a deploy

## Intent

- **Problem**: the locally built images (`backend`, `umami`, `umami-db`) get Alpine package fixes only when a deploy rebuilds them, and only if the host's build cache misses the `apk` layer.
  - #689: the host reports of 2026-10-26T17:00Z and 2026-10-27T17:00Z had `images` false. The second, the only one whose per-service result was read, had 48 findings in `umami`, all Alpine `curl` / `libcurl` `8.22.0-r0`, fixed in `8.23.0-r0`. Alpine's `v3.24/main` served `8.23.0-r0` when checked at about 2026-10-27T17:55Z; when it was published was not measured.
  - In the host deploy log, `[umami base 2/2] RUN apk upgrade` was `CACHED` on all five 2026-10-26 deploys (KST 09:28, 09:43, 09:52, 10:46, 18:10), ran fresh on the #690 deploy (KST 2026-10-28 02:49), and was `CACHED` again on the deploy after (KST 03:19). The fresh rebuild of the unchanged `3.4.0-security-2` recipe already carried `8.23.0-r0`.
  - Why the cache missed on the #690 deploy is unmeasured. Around 2026-10-27T17:45Z, `docker buildx du` on the host reported 10.55 GB reclaimable of 10.55 GB, while `docker system df` reported 3.167 GB reclaimable of 10.74 GB; neither confirms builder garbage collection.
  - On 2026-10-28 the owner pruned the host build cache (10.1 GB freed; 636.5 MB left), so the next deploy rebuilds most layers and will look like a cache miss.
  - The frontend is out of this: it runs the upstream `nginx:1.31.8-alpine-slim` pin, and #673 showed that a re-pull cannot fix a package upstream has not rebuilt.
- **Outcome wanted**: a fix published in the image's Alpine branch reaches the running `backend`, `umami` and `umami-db` containers within a set time, with no code change and no deploy.
- **Affected systems**: `scripts/auto-deploy.sh` (build steps), `Makefile` (`setup-security-cron` or a new cron target), `docker-compose.yml`, `.claude/rules/ci.md` › Runtime image recipes and Operational logs.
- **Constraints**:
  - Analytics builds keep `provenance: false` and `sbom: false`, so a rebuild leaves the image ID readable (`ci.md`).
  - A recreated umami container needs the nginx reload and the `/umami/api/send` 4xx check that `auto-deploy.sh` already runs.
  - The backend image bakes `GIT_COMMIT`, and `/api/health/` must keep reporting the deployed SHA (Gotcha #17).
  - Cron output goes to `backend/logs/<name>.log`, and cron's `PATH` has no `docker` (`ci.md`).
- **Decisions (2026-10-28)**: the owner confirmed build/verification and automatic application are both required. Use a separate nightly refresh with serialized maintenance, fresh backup verification, failure recovery and explicit scheduler activation. Current GC policy was inspected; the historical cache miss remains unproven.

## Spec

### Approved direction on 2026-10-28

The owner confirmed that candidate build/verification and automatic application are sequential parts of the same task. Implement nightly automatic replacement after successful verification and backup; enable the schedule only after a supervised run.

### Pre-implementation findings (2026-10-28)

- `backend/Dockerfile` has no `apk upgrade` in its runtime stage; `docker/postgres/Dockerfile` installs a pinned privilege-switch package without upgrading existing packages. Repeating those recipes cannot promise all Alpine fixes. `docker/umami/Dockerfile` already upgrades its base stage.
- `scripts/deploy/manager.ts` and `scripts/scheduled-security.ts` use separate locks. The deployment lock expires by age even if its PID remains alive; neither lock excludes the proposed refresh. Checking a lock once before building is insufficient.
- The existing image scanner verifies actual container and image IDs before and after scanning; retain that contract.
- `docker/postgres/verify.sh` tests a disposable volume; `docker/umami/verify.sh` tests a disposable database, migration, tracking, persistence and restart. Neither requires production data.
- The host builder exposes an active GC policy. Its current settings do not establish why the historical layer missed cache. Host measurements remain in `.private/journal.md`.

### Required behavior

1. Keep security auditing observational. Run a separate refresh command nightly at 00:30 host local time, before the existing 02:00 audit. These are proposed slots, not a guarantee of completion: lock contention, build duration or upstream failures must be visible. Do not install either schedule implicitly during deployment.
2. Coordinate deploy, refresh and scheduled backup/scan operations with one exclusive maintenance lock. Acquisition must be atomic; release must require ownership; a live owner must never be evicted merely by age. Invalid ownership or uncertain liveness fails closed. Direct deploy-script invocation must participate too. A busy refresh records a retryable result; it must not claim a successful refresh.
3. Freeze the source at the verified deployed backend SHA. Require a clean tracked checkout and agreement between the checkout and `/api/health/`; otherwise stop. Do not fetch, pull, migrate application versions or use an unverified newer main commit during refresh. Build from an isolated archive of that SHA, and pass it as `GIT_COMMIT`.
4. Add explicit Alpine upgrades to backend runtime and PostgreSQL recipes, preserving the base Alpine branch, PostgreSQL major, application source pins and lock files. Use `--pull --no-cache` for refresh builds; digest pins remain pinned. A pull does not override a digest pin, and package refresh does not patch bundled application/runtime binaries outside Alpine packages.
5. Build unique candidate tags; never overwrite the tags used by ordinary deployment before verification. Keep `provenance: false` and `sbom: false`, verify Docker can inspect each candidate image ID, and use a private per-run Docker client configuration so a concurrent process cannot remove a shared configuration directory.
6. Verify candidates before any production mutation: disposable backend startup/migration/health with temporary SQLite, followed by rollback to the current image and reapplication with a persisted sentinel row; PostgreSQL initialization/restart/persistence; Umami against the candidate PostgreSQL image; full candidate vulnerability scan with a refreshed database. Scanner errors or findings stop automatic promotion; retain details privately. Do not mistake a candidate tag scan for verification of a running image.
7. **Automatic application:** obtain a fresh successful backup/restore verification before replacement, preserve old image IDs under rollback tags, then replace database, analytics and backend in dependency order without rebuilding or pulling at promotion. Keep volumes. Check each replacement before proceeding. Reload nginx after analytics replacement and verify its tracking route. Verify backend commit, application health and actual running image IDs; then run the ordinary running-image audit.
8. Preserve two generations of task-owned candidate and rollback tags. Remove older tags without force, never prune unrelated images or volumes, and remove extracted source trees. Preserve compact result/error records; retain full candidate scan inventories for the two generations.
9. Failure after replacement triggers an attempt to restore the previous images using the unchanged application version and existing volumes, followed by the same health/identity checks. This is image rollback, not a database restore. Never overwrite live data automatically; report a failed recovery if the previous images cannot serve it. Test partial replacement failures and failed recovery before enabling automation.
10. Publish an atomic private result containing source SHA, old/candidate/running image IDs, start/end times, mode, phase, outcome and recovery outcome. Public watchdog output remains boolean/generic. Extend watchdog validation to detect refresh failure and stale/missing results: a vulnerability-free running-image scan alone cannot prove the scheduled refresh ran. Extend the existing version-1 response with an explicit refresh boolean (true while disabled); restart the webhook and verify that field before enabling the scheduler.

### Scope and acceptance

- Expected files: runtime Docker recipes; a dedicated refresh entry/module; shared locking and runtime-check helpers; `auto-deploy.sh`; deployment entry wrapper; scheduled-security entry; operations report/validation and tests; `Makefile`; security watchdog; `.claude/rules/ci.md`. Compose changes only if explicit candidate/rollback overrides require them.
- Out of scope: nginx upstream patch production, PostgreSQL major changes, application dependency upgrades, automatic build-cache pruning, deleting backups/volumes, zero-downtime claims, exposing private inventory in GitHub.
- First live activation requires measured build duration, disposable candidate tests, an injected failed candidate and a recovery rehearsal, followed by one supervised successful host run. The scheduler is enabled only for the selected mode.
- Daily execution is a target cadence, not a hard promise that every advisory will be patched within 24 hours. Missing upstream patches, validation failures and recovery incidents remain actionable alarms.

### Evidence

- Docker documents that a cached RUN does not inspect the result of package-manager commands: [Build cache invalidation](https://docs.docker.com/build/cache/invalidation/).
- Compose documents that changed images recreate containers while preserving mounted volumes, and distinguishes no-build, no-deps and wait options: [docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/). These options do not provide application rollback or a zero-downtime guarantee.

## Plan

Implementation sequence for the approved automatic build, verify and apply mode.

1. Selected: nightly automatic build, verify and apply at 00:30 host local time. The owner approved the sequential flow.
2. Implement the common maintenance lock. Test atomic acquisition with competing processes, live old owners, malformed ownership, killed owners, owner-only release and cleanup on signals. Include direct deploy invocation and webhook lifecycle handling.
3. Add recipe upgrades and isolated candidate builds with injectable command runners. Test source-SHA preservation, image identity and the absence of production mutation after each candidate failure.
4. Implement the selected promotion behavior, private reports and recovery checks. Inject failures before and after every replacement boundary, including failed rollback. Add freshness and failed-run watchdog cases without weakening backup/offsite checks.
5. Run operational TypeScript checks, shell syntax checks, Docker Images CI and disposable container verification. Use a fresh reviewer for the spec and correctness review.
6. Merge and verify the deployed SHA; restart the webhook if needed. Deploy-script changes must also be verified on the following deploy. Rehearse one failed candidate and recovery, then one supervised successful run. Only then install the selected schedule.
7. Record the first supervised result by source SHA and image IDs, fill Outcome and retire the intent unless a living document needs it.

Pre-implementation baseline (2026-10-28): `npm run check:scripts` passed TypeScript checks, 33 Node tests and 4 Python tests. The initial sandbox attempt could not bind the local test server; the allowed rerun passed. No refresh implementation or runtime validation is claimed by this baseline.

## Outcome

Shipped in PRs #696 and #697. PR #697 merged as `440bf40785d34785e96455b5a5060ef991befba6`; the main deployment workflow `40645656297` passed, and `/api/health/` reported that exact SHA. CI passed the repository, backend, frontend, Docker Images, E2E, Lighthouse and security checks. The intent remains because `docs/intents/infra/security-operations.md` cites it as follow-up context.

### First supervised run (2026-10-28)

PR #696 passed CI and deployed as `e16a1e60`; a second deployment through the shared maintenance wrapper completed and released its lock. The restarted webhook passed Security Operations Watchdog run `40642872946` with the new refresh field while scheduling remained disabled.

The first refresh stopped in preflight because the running backend image ID could not be inspected; no Compose replacement was called. PR #697 disabled backend provenance and SBOM generation and added a verified backend recreation fallback to deployment.

The supervised rerun on `440bf40785d34785e96455b5a5060ef991befba6` completed successfully from `2026-10-28T06:46:43Z` to `2026-10-28T06:49:45Z`. Its report has `phase: complete`, `recovery: not-needed`, and `success: true`. All three candidate IDs matched the running containers: backend `sha256:ba440f98d54671d79903345084b89db4b6e9d7137eb460a0f616d039659815d1`, Umami `sha256:8978fa5b090ef75af28602574c3a5eb3f46727ee37751a71a41ecf0f720bb0c8`, and Umami DB `sha256:d07035ef377492965ff4a3e3c5a3cf33813b2059f7fc455b4a40069683a97cd0`. The API health endpoint returned healthy with the same source SHA after replacement.

After that successful run, the host cron was enabled for 00:30 local time daily. The Security Operations Watchdog run `40646319288` passed with scheduling enabled. Failed candidate checks and rollback incidents remain visible to the watchdog; an interrupted maintenance lock still requires manual process inspection and is never automatically stolen.
