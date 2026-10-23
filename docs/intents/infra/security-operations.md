---
status: in-progress
module: infra
created: 2026-10-23
updated: 2026-10-23
---

# Verify and automate security operations

## Intent

The owner authorized login defense hardening, backup restoration verification,
and scheduled dependency and running-image audits with failure notifications.
Earlier manual-only scheduling preferences are superseded by this request.

## Spec

- Serialize the existing login throttle's cache read/write across workers and
  threads; preserve its configured rate and trusted client identity. Fail closed
  if the lock cannot be acquired. Edge controls remain unverified when browser
  access is unavailable; application throttles are not a DDoS boundary.
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
