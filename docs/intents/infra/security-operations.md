---
status: shipped
module: infra
created: 2026-10-23
updated: 2026-10-24
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
  separately from live enforcement tests; application throttles are not a DDoS boundary.
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
  02:00, and all four checks were true. A dispatched watchdog (run 40065154092) passed and closed #660 with its recovery comment.
- The six Dependabot alerts for the same `next` advisories stayed open after
  the fix, although the dependency-graph compare for `fc9e1704...84c1e765`
  showed 16.3.8 removed and 16.4.2 added with no vulnerabilities. The cause was
  a GitHub-side re-evaluation lag. The alerts were not dismissed, and all six
  turned `fixed` on their own at 07:52Z, about 3 hours after the deploy. A
  dismissed alert never turns `fixed`, so wait out the lag instead.
