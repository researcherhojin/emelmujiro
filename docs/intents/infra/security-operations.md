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

## First live alarm (2026-10-24)

The first scheduled watchdog run after deployment (run 40041667665) failed and
filed #660. The host report had `dependencies` and `images` false and
`backup` and `offsite` true. The running-image scan found 3 findings, all in
`umami`: the Next 16.3.8 advisories published 2026-10-22. The lockfile scans
also flagged `body-parser`, `zod`, `undici`, `fast-uri` and
`serialize-javascript`. The mechanism worked as designed: the alarm fired on
real upstream advisories, and no diagnostics reached GitHub.

- Fixes: #661 (Umami on Next 16.4.2 with raised builder override floors),
  #662 (root `body-parser` and `zod`) and #663 (inherited CI failures).
  Production reached `84c1e765`, and the Umami container was recreated on
  `3.4.0-security-2`.
- Recovery: the host job was rerun by hand at 05:09Z instead of waiting for
  02:00, and all four checks were true. A dispatched watchdog
  (run 40065154092) passed and closed #660 with its recovery comment.
- The six Dependabot alerts for the same `next` advisories stayed open after
  the fix, although the dependency-graph compare for `fc9e1704...84c1e765`
  showed 16.3.8 removed and 16.4.2 added with no vulnerabilities. The cause was
  a GitHub-side re-evaluation lag. The alerts were not dismissed, and all six
  turned `fixed` on their own at 07:52Z, about 3 hours after the deploy. A
  dismissed alert never turns `fixed`, so wait out the lag once the vulnerable
  version has left the dependency graph. A locally patched version that stays
  in the graph is the exception below.

## Second alarm (2026-10-26)

The 2026-10-25 scheduled run filed #673. The host report had only `images`
false: the running-image scan found 1 finding, in `frontend`, a HIGH in
`brotli-libs 1.2.0-r1` (fixed in Alpine `1.2.1-r0`, published 2026-10-22).

- A re-pull could not fix it. Layer inspection showed upstream's current
  `nginx:1.31.8-alpine` (`sha256:1ef7ca94…`) and `1.31-alpine` still shipping
  `1.2.0-r1`, and no `1.31.9-alpine` existed.
- `1.31.8-alpine-slim` (rebuilt 2026-10-24) carries the same nginx 1.31.8 and
  busybox `wget`, but no libcurl, image-filter font libraries or njs/acme
  modules, so no `brotli-libs`. `frontend/nginx.conf` loads no module.
- Fix: #686 (`ccc7c411`) moved the Compose pin. CI's `nginx -t` passed on the
  slim image, and production reported `ccc7c411` with the container `healthy`.
- Recovery: the host job was rerun by hand at 00:54Z, and all four checks were
  true with 0 findings on every service. A dispatched watchdog
  (run 40251602783) passed and closed #673.

## Third alarm (2026-10-27)

Watchdog run 40425595419 (2026-10-27T00:18Z) filed #689 from the host report
completed at 2026-10-26T17:00:23Z. The next report, 2026-10-27T17:00:19Z, was
the same. Both had only `images` false (`backend/logs/security-schedule.log`).
The per-service result of the second run, the only one still on disk when read,
was 48 findings, all in `umami`: 24 CVEs, each reported for both Alpine
`curl` and `libcurl` `8.22.0-r0` and fixed in `8.23.0-r0`. Of the 24, 1 is
HIGH (CVE-2026-92392), 1 MEDIUM and 22 LOW. The other three services had 0.

- Nothing found at runtime called curl. The Compose healthcheck uses BusyBox
  `wget`, a grep of the running container's `/app/scripts` and
  `/app/server.js` found no `curl`, and `verify.sh` runs its curl on the
  host. After #691 the container passed its healthcheck and
  `auto-deploy.sh`'s `/umami/api/send` check without curl.
- Correction, measured after the fix: a deploy picks up Alpine patches only
  when the host's build cache misses the `apk` layer. In the deploy log,
  `[umami base 2/2] RUN apk upgrade` was `CACHED` on all five 2026-10-26
  deploys (KST 09:28, 09:43, 09:52, 10:46, 18:10). It ran fresh on the #690
  deploy (KST 2026-10-28 02:49), and that rebuild of the unchanged
  `3.4.0-security-2` recipe already carried curl `8.23.0-r0`. The next
  deploy (KST 03:19) was `CACHED` again. When Alpine published `8.23.0-r0`
  was not measured. Follow-up: the nightly image refresh
  (`.claude/rules/ci.md` › Nightly image refresh).
- Fix: #691 (`bb5648d2`) removed curl from the base stage and moved the tag to
  `3.4.0-security-3`; `verify.sh` now fails if the image ships curl.
- Found on the way: `qs` 6.16.0 (GHSA-6pq8-jhm2-2vcw, published
  2026-10-27T16:10Z, dev-only through `@lhci/cli`) failed a local
  `security:dependencies` run. The host's 2026-10-27T17:00:19Z run still reported
  `dependencies` true, so it was not this alarm's cause. #690 (`32885898`)
  moved it to 6.16.1.
- Production reported `bb5648d2` before the umami step had finished:
  `/api/health/` reflects the backend, which `auto-deploy.sh` rebuilds first.
  Wait for the umami container on the new tag before rerunning the host job.
- Recovery: the host job was rerun by hand and completed at
  2026-10-27T17:59:37Z; all four checks were true with 0 findings on every
  service. A dispatched watchdog (run 40555781773) passed and closed #689.

## Umami build-time dependency advisory (2026-10-28)

Dependabot alerts #7 (`docker/umami/pnpm-lock.yaml`) and #8
(`docker/umami/package.json`) reported low-severity CVE-2026-93753 in
development-scope `deepmerge@4.3.1`; npm had no patched release.

- [PR #699](https://github.com/researcherhojin/emelmujiro/pull/699) backported
  the `__proto__` rejection from the unmerged
  [deepmerge PR #274](https://github.com/TehShrike/deepmerge/pull/274) and
  checks both exploit shapes during the image build. The production runner
  lock contains no `deepmerge`.
- PR checks and main CI/CD passed (runs 40653616066 and 40654083076);
  `/api/health/` reported `e09ca677` at 2026-10-28T08:05:26Z.
- Both alerts were then dismissed as `tolerable_risk`, citing the backport and
  runtime exclusion. Replace the patch once npm publishes a fixed release.

## Fourth alarm (2026-10-29)

<!-- cspell:ignore rustls -->

Watchdog run 40795848396 filed #705 from the host report completed at
2026-10-28T17:00:16Z: `dependencies`, `images` and `refresh` false, `backup`
and `offsite` true.

- `dependencies`: 1 finding, CVE-2026-93753 in `deepmerge@4.3.1` in
  `docker/umami/pnpm-lock.yaml`, the advisory #699 had already backported.
  The 2026-10-27T17:59:37Z run was clean, so Trivy's DB began matching it in
  between. Fix: a scoped, expiring accepted risk in
  `docker/umami/trivyignore.yaml`, passed only for that lock file. A local run
  went from 1 finding to 0 with the same 1163 packages, and the runner lock
  stayed at 157 packages and 0 findings.
- `images`: 8 findings, all in `backend`: 4 rustls advisories
  (GHSA-c8m5-c952-6cm4 MEDIUM; GHSA-h2v8-394m-p7vv, GHSA-vp88-798v-h67f,
  GHSA-w44r-93j7-qv28 LOW; published 2026-10-27), each in both `bin/uv` and
  `bin/uvx`. The fix is rustls 0.23.46. uv `0.12.24` (pinned) and the newest
  release `0.13.6` both lock 0.23.45; only uv `main` has 0.23.46.
- `refresh`: the 00:30 KST refresh stopped in `verify` with "Candidate scan
  has findings". The backend candidate had the same 8 findings, and the umami
  and umami-db candidates had 0.
- Open: once a uv release ships rustls 0.23.46, bump `backend/Dockerfile`
  (both stages) and `.github/actions/setup-uv/action.yml` together. #705 stays
  open until then. The owner chose this over an image-scan ignore or dropping
  uv from the runtime stage.
