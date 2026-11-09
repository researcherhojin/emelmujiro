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

<!-- cspell:ignore rustls redocly -->

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
- **#713** (run 41254737901, from the report of 2026-10-31T17:00:52Z; `dependencies`)
  - Cause: two advisories published 2026-10-30. GHSA-g3hv-75wg-m249 (minimatch `<11.0.1`, MEDIUM) hit root `minimatch@10.2.6` and Umami's builder `3.1.4`, `5.1.8`, `5.1.9` and `9.0.7`. GHSA-mrwp-f3q8-3g9p (follow-redirects `1.16.0`–`1.16.1`, HIGH) hit root `1.16.1`. GHSA-3g3m-2fjr-6pw4 (glob `9.0.0`–`14.0.1`) hit Umami's builder `glob@10.5.0`. npm audit counted 22, of which 20 were transitive parents.
  - Fix: root override `minimatch>=11.0.1` (11.0.3) and follow-redirects 1.16.2. Expiring ignores for the Umami builder lock only: minimatch 11 drops the API glob up to 14.0.1 uses, and the runner lock has neither package.
  - Fix commit: #714 (`77ffad61`).
  - Recovery: host job at 2026-11-01T11:30:20Z, then run 41302177201.
  - Follow-up (2026-11-02, Dependabot alert #10): the two Umami builder ignores were replaced by real fixes. Overrides now set minimatch 11.0.3 and glob 14.0.3, and a one-line patch makes `@redocly/openapi-core` 1.34.19 import minimatch's named export. Umami moves to `3.4.0-security-5`.
- **#739** (run 42429236282, from the report of 2026-11-07T17:00:09Z; `images`; open as of 2026-11-08)
  - Cause: CVE-2026-4738 (MEDIUM), with 1 finding in each of `backend`, `frontend`, `umami` and `umami-db`: Alpine zlib `1.3.2-r1`, fixed in `1.4-r0`. Alpine v3.24 built `1.4-r0` at 2026-11-06T18:22Z. Every nginx `*-alpine-slim` tag was last pushed 2026-11-05, and the newest nginx push of any tag was 2026-11-06T16:52Z (checked 2026-11-08).
  - Why the refresh did not fix it: the 2026-11-07T15:30Z refresh built all three candidates with zlib `1.4-r0`. Its post-apply audit also scanned `frontend`, which refresh never rebuilds, and so rolled them back (`phase: audit`, `recovery: passed`).
  - Fix: #740 (`3d7525f4`) audits only the replaced services. A manual refresh on 2026-11-08 succeeded (`phase: complete`), and running `backend`, `umami` and `umami-db` report zlib `1.4-r0`.
  - Regression (2026-11-09): the 00:30 KST refresh again ended `phase: complete` with all three candidates on zlib `1.4-r0`. At 2026-11-09T00:15:27Z the deploy of #753/#754 recreated `emelmujiro-umami` from `sha256:ab24adc6…`. That image was created 2026-11-01T16:21:28Z and its `apk upgrade` layer dates from 2026-11-02, so `auto-deploy.sh`'s cached `docker compose up -d --build umami` overwrote the refreshed image with zlib `1.3.2-r1`. `umami-db` and `backend` stayed on `1.4-r0`. Fix: `docs/intents/infra/deploy-keeps-refreshed-images.md`. Verified on 2026-11-10: a deploy after the 00:30 refresh kept umami's refreshed image, still on zlib `1.4-r0`.
  - On 2026-11-08 the owner chose to wait for an upstream nginx rebuild rather than add a local recipe, so `frontend` stayed on `1.3.2-r1`. On 2026-11-10 the owner reversed that, and #758 superseded it (Recovery below).
  - `offsite` was also false from about 05:00Z to 13:05Z on 2026-11-08, because the MacBook was off the host's LAN (`docs/intents/infra/offsite-remote-path.md`).
  - Recovery: upstream still had not rebuilt `1.31.8-alpine-slim` on 2026-11-10, so `frontend` moved to a local recipe (`docs/intents/infra/frontend-nginx-recipe.md`, #758, `6b34ce34`). The old deploy script's cached analytics rebuild put `umami` back on `1.3.2-r1`, as that intent's Plan expected. A manual refresh at about 2026-11-09T21:00Z, its first run with `frontend` included, ended `success: true, phase: complete`. The host job at 2026-11-09T21:20:14Z reported `images: true`, all four services `clean`, then run 42701539583 succeeded. The issue had already been closed at 2026-11-09T20:44:44Z, at the #758 merge, before this verification.

Lessons, each measured in one of these alarms:

- **A Dependabot alert lags its fix by hours, so never dismiss one to clear it.** The six `next` alerts for #660 turned `fixed` on their own at 07:52Z, about 3 h after the deploy (compare `fc9e1704...84c1e765`). A dismissed alert never turns `fixed`.
- **The exception is a locally patched version that stays in the graph.** deepmerge has no npm fix. #699 (`e09ca677`, runs 40653616066 and 40654083076, deployed 2026-10-28T08:05:26Z) backported deepmerge PR #274 and checks both exploit shapes in the image build. Alerts #7 and #8 were then dismissed as `tolerable_risk`. Replace the patch once npm ships a fix.
- **A re-pull fixes nothing until upstream rebuilds.** `nginx:1.31.8-alpine` (`sha256:1ef7ca94…`) and `1.31-alpine` still shipped `brotli-libs 1.2.0-r1`, and no `1.31.9-alpine` existed. The slim variant has no `brotli-libs`, and `nginx.conf` loads no module.
- **A deploy picks up Alpine patches only when the `apk upgrade` layer misses the build cache.** It was `CACHED` on all five 2026-10-26 deploys. It ran fresh on #690's deploy (KST 2026-10-28 02:49), which already carried curl `8.23.0-r0`. The nightly image refresh closes this gap.
- **Drop a component the runtime does not use instead of waiting for its fix.**
  - Umami: nothing called curl at runtime. The healthcheck uses BusyBox `wget`, there is no `curl` in `/app/scripts` or `/app/server.js`, and `verify.sh` curls from the host.
  - backend: uv only launched the venv. Every uv from `0.12.24` to `0.13.6` locks rustls 0.23.45 (checked 2026-10-29T01:13Z).
- **`/api/health/` reports the new commit before `auto-deploy.sh` reaches the Umami rebuild.** Wait for the umami container before rerunning the host job.
- **"The fix needs a major" is a claim to test per consumer, not a reason to ignore.** #713 ignored minimatch and glob in the Umami builder on that ground. Checking each caller showed:
  - `npm-run-all` uses `Minimatch`, which works on 11;
  - svgr and sucrase work on glob 14;
  - only redocly's `require("minimatch")(…)` breaks, and it is fixed by a one-line patch.
- **A same-tag upstream rebuild never reaches production on its own.** `auto-deploy.sh` and the nightly refresh never pull the nginx image, and Dependabot opens no PR when a tag keeps its name. Once upstream rebuilds, run `docker compose pull frontend` and recreate the container by hand (#739).
- **An audit must judge only what its job changed.** The refresh's post-apply audit failed on `frontend`, which it never rebuilds, and rolled back three candidates that were fixed (#739, #740).
- **A cached deploy build can undo a verified refresh.** Every deploy rebuilt the analytics images from the layer cache. On 2026-11-09 that cache returned an umami image built 2026-11-01, which replaced the refreshed one 8 h 45 min after the refresh applied it (00:30 → 09:15 KST, #739).
- **A local scan can find what the host has not reported yet.** `qs` 6.16.0 (GHSA-6pq8-jhm2-2vcw, 2026-10-27T16:10Z, dev-only through `@lhci/cli`) failed a local run while the host still reported `dependencies` true. #690 (`32885898`) moved it to 6.16.1.
