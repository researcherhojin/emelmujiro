---
status: shipped
module: infra
created: 2026-10-23
updated: 2026-10-28
---

# Verify and automate security operations

## Intent

The owner authorized login defense hardening, backup restoration verification,
and scheduled dependency and running-image audits with failure notifications.
Earlier manual-only scheduling preferences are superseded by this request.

## Spec

- Serialize the existing login throttle's cache read/write across workers and
  threads; preserve its configured rate and trusted client identity. Fail closed
  if the lock cannot be acquired. Record dashboard configuration evidence
  separately from live enforcement tests; application throttles are not a
  DDoS boundary.
- Snapshot SQLite with its online backup API, archive uploaded files, and dump
  analytics PostgreSQL. Verify SQLite integrity and restore PostgreSQL into an
  isolated disposable container without writing production databases.
- Keep archives and diagnostics private, with restrictive permissions. Confirm
  the destination for an independent backup copy with the owner. After the
  optional destination question received no answer, use the stated conservative
  default: encrypted copies on the development machine, with its private key
  kept outside the repository and private-file synchronization.
- Use AES-256-GCM CMS encryption with a recipient public certificate on the
  server. Verify decryption, manifest hashes, and SQLite integrity on the second
  machine. The watchdog checks both receipt age and original snapshot age.
- Schedule the existing full dependency and exact running-image scans daily.
  Failures and findings generate a deduplicated GitHub issue containing only a
  generic status; never publish package inventories or host details. Recovery
  closes the issue. Preserve existing cron entries.
- Add regression tests, run backend and script checks, review independently,
  deploy, and verify the public commit and actual scheduled commands.

## Plan

1. Implement and test worker-safe login throttling.
2. Implement private backup and isolated restore verification; exercise on host.
3. Add scheduled audit wrapper and test its failure and notification paths.
4. Install schedules, deploy verified code, record evidence and any blockers.

## Done when

Concurrent login attempts observe the configured limit, a production snapshot
restores successfully in isolation, daily audit scheduling is installed and its
error/recovery behavior is tested. Independent backup destination is verified or
explicitly remains pending the owner's decision.

## Outcome

Deployed `05a0fcb921a0af13ae793db14e11094aabe5d5de`; the public health
endpoint returned that commit after all five main CI jobs passed in
[run 39908886089](https://github.com/researcherhojin/emelmujiro/actions/runs/39908886089).

- Backend: 450 tests passed. Both thread and process contention tests accepted
  exactly 10 of 30 concurrent attempts for the configured login bucket.
- Operational TypeScript: 31 tests and strict type checking passed. Four Python
  backup tests cover restoration, unsafe paths, corruption, and cleanup errors.
- The deployed backend passed 40 targeted authentication and concurrency tests.
- SQLite, uploaded files and analytics PostgreSQL were backed up; PostgreSQL
  restoration used a temporary network-isolated container, not production.
- The encrypted copy was decrypted on the independent machine; all manifest
  hashes and SQLite integrity were verified. The private key stays outside the
  repository and private-file synchronization. The copy job runs hourly.
- The 02:00 host schedule was installed twice with one resulting entry; existing
  jobs were preserved. The actual scheduled command reported clean dependencies,
  clean running images, verified backup restoration, and a fresh independent copy.
- Unauthenticated requests to the summary endpoint returned 401. Restarting the
  existing webhook loaded the new authenticated read-only route.
- [Alert exercise](https://github.com/researcherhojin/emelmujiro/actions/runs/39909193880)
  deliberately failed and opened [test issue 659](https://github.com/researcherhojin/emelmujiro/issues/659).
  [Recovery verification](https://github.com/researcherhojin/emelmujiro/actions/runs/39909221906)
  passed against the real summary and automatically closed the issue.
- Independent review found plaintext cleanup failure paths; those were fixed,
  regression-tested and reviewed again before deployment.
- On 2026-10-23, the owner deployed the Cloudflare login rate limiting rule
  through the dashboard. Shared screenshots confirmed the configured rule and
  its presence in the rule list after deployment. No live blocking test was run;
  the dashboard settings and remaining account tasks are recorded privately.

Limits: Login locking is single-host and does not prevent cache eviction
or restart from resetting counters. Independent copies require connectivity;
receipts or original snapshots older than 36 hours trigger the watchdog.
Archives have no automatic pruning yet, and a separate secure copy of the
restore key remains pending. Restore-key custody and exact host
paths are documented privately in `.private/operations.md`.

## Alarm history

<!-- cspell:ignore rustls -->

Each alarm filed a generic issue. The cause was in the host report (`.private/operations.md`). Every recovery ran the same way: fix and deploy, rerun the host job by hand, then dispatch the watchdog, which closed the issue. No diagnostics reached GitHub.

- **#660** (run 40041667665, 2026-10-24; `dependencies`, `images`)
  - Cause: 3 `umami` findings, the Next 16.3.8 advisories published 2026-10-22. The lock-file scans also flagged `body-parser`, `zod`, `undici`, `fast-uri` and `serialize-javascript`.
  - Fix: #661 (Next 16.4.2, raised builder override floors), #662 (`body-parser`, `zod`), #663 (CI). Production `84c1e765`, Umami `3.4.0-security-2`.
  - Recovery: host job at 05:09Z, then run 40065154092.
- **#673** (2026-10-25 run; `images`)
  - Cause: 1 HIGH in `frontend`, `brotli-libs 1.2.0-r1` (fixed in `1.2.1-r0`, published 2026-10-22).
  - Fix: #686 (`ccc7c411`) moved the Compose pin to `nginx:1.31.8-alpine-slim`.
  - Recovery: host job at 00:54Z, then run 40251602783.
- **#689** (run 40425595419, 2026-10-27T00:18Z, from the reports of 2026-10-26T17:00:23Z and 2026-10-27T17:00:19Z; `images`)
  - Cause: 48 `umami` findings. 24 CVEs (1 HIGH CVE-2026-92392, 1 MEDIUM, 22 LOW) were each reported in both Alpine `curl` and `libcurl` `8.22.0-r0` (fixed in `8.23.0-r0`). The other services had 0.
  - Fix: #691 (`bb5648d2`) removed curl and moved the tag to `3.4.0-security-3`. `verify.sh` now fails if curl returns.
  - Recovery: host job at 2026-10-27T17:59:37Z, then run 40555781773.
- **#705** (run 40795848396, from the report of 2026-10-28T17:00:16Z; `dependencies`, `images`, `refresh`)
  - Cause, part 1: Trivy began matching CVE-2026-93753 in the already-patched `deepmerge@4.3.1`. The 2026-10-27T17:59:37Z run had been clean.
  - Cause, part 2: 8 `backend` findings, 4 rustls 0.23.45 advisories (GHSA-c8m5-c952-6cm4 MEDIUM; GHSA-h2v8-394m-p7vv, GHSA-vp88-798v-h67f, GHSA-w44r-93j7-qv28 LOW) each in `bin/uv` and `bin/uvx`. The fix is rustls 0.23.46, which only uv `main` had. The 00:30 refresh rejected its backend candidate for the same 8.
  - Fix: #706 (`f78abaca`) added an expiring ignore in `docker/umami/trivyignore.yaml` for that lock file only. Its findings went from 1 to 0, with 1163 packages unchanged. #707 (`bf7a3be3`) removed uv from the runtime stage, and the host's `manage.py` cron lines were reinstalled.
  - Recovery: refresh at 2026-10-29T01:39:31Z, host job at 01:39:47Z, then run 40801768627.

Lessons, each measured in one of these alarms:

- **A Dependabot alert lags its fix by hours, so never dismiss one to clear it.** The six `next` alerts for #660 turned `fixed` on their own at 07:52Z, about 3 h after the deploy (compare `fc9e1704...84c1e765`). A dismissed alert never turns `fixed`.
- **The exception is a locally patched version that stays in the graph.** deepmerge has no npm fix. #699 (`e09ca677`, runs 40653616066 and 40654083076, deployed 2026-10-28T08:05:26Z) backported deepmerge PR #274 and checks both exploit shapes in the image build. Alerts #7 and #8 were then dismissed as `tolerable_risk`. Replace the patch once npm ships a fix.
- **A re-pull fixes nothing until upstream rebuilds.** `nginx:1.31.8-alpine` (`sha256:1ef7ca94…`) and `1.31-alpine` still shipped `brotli-libs 1.2.0-r1`, and no `1.31.9-alpine` existed. The slim variant has no `brotli-libs`, and `nginx.conf` loads no module.
- **A deploy picks up Alpine patches only when the `apk upgrade` layer misses the build cache.** It was `CACHED` on all five 2026-10-26 deploys. It ran fresh on #690's deploy (KST 2026-10-28 02:49), which already carried curl `8.23.0-r0`. The nightly image refresh closes this gap.
- **Drop a component the runtime does not use instead of waiting for its fix.**
  - Umami: nothing called curl at runtime. The healthcheck uses BusyBox `wget`, there is no `curl` in `/app/scripts` or `/app/server.js`, and `verify.sh` curls from the host.
  - backend: uv only launched the venv. Every uv from `0.12.24` to `0.13.6` locks rustls 0.23.45 (checked 2026-10-29T01:13Z).
- **`/api/health/` reports the new commit before `auto-deploy.sh` reaches the Umami rebuild.** Wait for the umami container before rerunning the host job.
- **A local scan can find what the host has not reported yet.** `qs` 6.16.0 (GHSA-6pq8-jhm2-2vcw, 2026-10-27T16:10Z, dev-only through `@lhci/cli`) failed a local run while the host still reported `dependencies` true. #690 (`32885898`) moved it to 6.16.1.
