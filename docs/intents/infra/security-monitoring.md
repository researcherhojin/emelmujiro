---
status: in-progress
module: infra
created: 2026-10-22
updated: 2026-10-22
---

# Detect new dependency and running-image vulnerabilities automatically

## Intent

The completed security cleanup has no remaining recorded findings, but PR
scans cover only HIGH/CRITICAL repository findings. Development dependencies
and running container images need recurring checks even when code is unchanged.
The owner authorized this follow-up on 2026-10-22.

## Spec

- Run daily and manually dispatched repository audits: full npm audit and
  Trivy vulnerability scans of the npm, Python and both analytics lock files,
  including development dependencies and every severity.
- Scan the images identified by running containers, never substitute a mutable
  tag. Missing containers, inaccessible images, changed containers during a
  scan and scanner failures are failures, not zero findings.
- Keep detailed production reports on the host. Expose only a bounded summary
  through the existing authenticated webhook, without adding deployment powers.
- A scheduled workflow rejects missing or stale production results and reports
  failures through a deduplicated GitHub issue, with recovery closure.
- No automatic package updates, container restarts or vulnerability suppression.
- Operational logic uses native Node 24 TypeScript with strict type checking;
  the existing JavaScript webhook entry point remains a compatibility loader.
  Shared report validation and authentication must have one implementation.
- Done when regression tests cover failure and recovery paths, repository
  checks pass, and real repository and running-image scans have been exercised.
  Operational activation and its evidence must be recorded separately.

## Plan

1. Add report validation, a host image scanner and its cron installer.
2. Add an authenticated read-only report route and a daily GitHub workflow.
3. Test malformed reports, stale results, scan failures and image identity
   changes; independently review the monitoring and authentication boundaries.
4. Run real scans, document operation, then activate the reviewed automation.

## Outcome

- Strict TypeScript checking and 26 regression tests pass, including actual
  HTTP authentication through the compatibility loader, stale/malformed reports,
  incomplete inventories, container replacement and notification recovery.
- Fresh npm audit and Trivy 0.76.1 scans of all four lock files, including
  development dependencies, report 0 findings. Actual CLI verification caught
  that `--include-dev-deps` is supported by `fs`, not `image`; image scans inspect
  installed packages directly and do not pass that flag.
- Actionlint 1.7.12, spelling, shell syntax, CHANGELOG guard tests and Bash guard
  tests pass. Knip reports only the existing `docker/umami/verify.mjs` finding;
  the webhook is now an explicit scripts entry instead of being ignored.
- A real host scan reports 0 findings for backend and frontend images. Analytics
  application and database scans fail because Docker cannot inspect their running
  image IDs. This is an inventory failure, not a vulnerability count of zero.
  Recreating those services requires a separate maintainer decision.
- Independent review's empty-inventory and scan-time replacement findings were
  fixed and regression-tested. Final review found no remaining code blocker.
- Merge, webhook restart and cron activation are pending.

## Operation

- Run `npm run check:scripts` for strict TypeScript checks and monitoring tests.
- Run `bash scripts/scan-dependencies.sh` with Node 24, npm and Trivy 0.76.1.
  Reports default to a temporary directory; CI retains them for 14 days.
- On the deployment host, `make setup-security-cron` installs a checksum-pinned
  Trivy 0.76.1 and schedules the running-image scanner at 04:23 local time.
  Existing cron entries are preserved. Logs and detailed reports remain under
  `backend/logs/`; repeat runs replace each service report and summary.
- Restart the existing webhook service once after deploying the TypeScript
  implementation. Its JavaScript entry path is unchanged. Host-specific
  instructions remain in `.private/operations.md`.
- Security Monitoring runs daily at 07:17 KST or by manual dispatch. It rejects
  production summaries older than 36 hours, tolerating scheduled-run delays.
  Scanner errors and findings open one issue; both checks succeeding closes it.
  The authenticated summary exposes service names, counts and time only.
- If an image ID can no longer be inspected, the scan fails. Validate the intended
  replacement image before a maintainer recreates that service; the scanner
  never substitutes the current tag or restarts containers itself.
