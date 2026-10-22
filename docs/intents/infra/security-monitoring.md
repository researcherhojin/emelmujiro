---
status: in-progress
module: infra
created: 2026-10-22
updated: 2026-10-22
---

# Run reproducible local security audits with typed operational modules

## Intent

Existing PR scans cover HIGH/CRITICAL repository findings. The owner wants to
check development dependencies and actual running images manually, minimize
external services, and verify that JavaScript-to-TypeScript conversion preserves
behavior. No new scheduler, hosted monitoring or notification service is wanted.

## Spec

- Provide manual npm and Trivy audits covering all severities and development
  dependencies in the npm, Python and both analytics lock files.
- Scan exact running image IDs. Missing containers, inaccessible images, scanner
  failures and container replacement during a scan fail explicitly.
- Keep reports locally. Never automatically update dependencies, restart a
  container, install cron entries or publish findings.
- Use native Node 24 TypeScript with strict checking, including unused code.
  Separate security, deployment and shared modules from command entry points.
- Preserve the existing webhook JavaScript entry path and deployment behavior:
  authenticate before reading the body, bound requests, validate full SHAs,
  forward DEPLOY_SHA through the environment and retain duplicate-deploy locks.
- Resolve repository resources from module locations, not the caller's working
  directory. Test execution from another directory and paths containing spaces.
- Done when local commands run, failure-path tests and type checks pass, the
  previous JavaScript deployment contract is compared with the new code, and
  documentation describes actual capabilities and remaining limits.

## Plan

1. Add shared path resolution, validated scan reports and manual command entries.
2. Separate deployment process control from HTTP handling; preserve the loader.
3. Test malformed inventory, scanner failure, path handling and deploy behavior.
4. Run real dependency/image scans where available; review documentation and
   record remaining environment limitations without marking them successful.

## Outcome

Implementation is on draft PR #629; it is not merged or deployed.

- Full npm audit and Trivy 0.76.1 scans of all four lock files report 0 findings,
  including development dependencies. Image scanning covers installed packages;
  the `--include-dev-deps` option belongs to the `fs` command only.
- Independent review identified empty-inventory and scan-time replacement gaps;
  both were fixed and covered by regression tests.
- A read-only host scan found 0 findings in backend and frontend images. The
  analytics application and database image IDs could not be inspected by Docker,
  so those scans failed. No running service was changed. Replacement candidates
  passed isolated application and database verification, but were not deployed.
- The deployment request limit now counts UTF-8 bytes, correcting the previous
  character-count implementation of the documented 4096-byte bound.
- Existing `docker/umami/verify.mjs` remains necessary: `verify.sh` feeds it to
  the isolated container. Knip now records that external entry explicitly.
- Strict TypeScript checks and 27 regression tests pass. A differential check
  against the original webhook at `f3820ff4` matches 13 deployment behaviors;
  the UTF-8 request-size correction is the intentional difference.
- The actual dependency audit also passes in a copied checkout whose path
  contains spaces, invoked from another working directory. The legacy webhook
  entry has an automated test for the same path conditions.
- Local image scanning exits 1 because this development machine has no Docker
  executable. It writes error results, not a false clean report. Host image
  results are recorded separately above; installing Docker was not requested.
- Documentation review corrected the stale current-tense dependency count in
  `backend/dependency-upload-audit.md`. The separate `ci/automerge-gate.md`
  remains in progress because its requested production timing evidence is not
  recorded; this audit does not declare that unrelated work complete.

## Manual operation

Requirements: Node 24, the repository's npm dependencies and network access to
npm/advisory databases. Image scanning additionally requires a running Docker
Engine and access to each exact image ID. No external account is added.

```bash
npm run security:setup          # Checksum-pinned Trivy 0.76.1, no scheduler
npm run security:dependencies   # npm audit and all four lock files
npm run security:images         # Read-only scan of this host's containers
npm run security:report         # Validate the latest image summary
npm run check:scripts           # Strict types and operational regression tests
```

The tool installer writes to `backend/.cache/security-tools/`, already ignored by
Git. Detailed reports go to `backend/logs/security/`, also ignored. Dependency
reports are in its `dependencies/` directory; `summary.json` is the image report.
Exit 0 means the requested scan completed with no findings; exit 1 means findings
or an incomplete/failed check. A stored image report older than 36 hours is
rejected by `security:report`; rerun the manual image scan to refresh it.

From another directory, invoke an entry by its absolute path, such as
`node /path/to/repository/scripts/scan-dependencies.ts`, or use
`npm --prefix /path/to/repository run security:dependencies`. Paths containing
spaces must be shell-quoted. An optional `TRIVY_BIN` selects an existing scanner;
otherwise the local pinned installation is preferred, then `trivy` on PATH.

The manual audits require no webhook restart. The TypeScript webhook refactor
only takes effect when the existing service is deliberately restarted after a
future deployment; its `scripts/deploy-webhook.js` entry path is unchanged.
Host-specific service-manager instructions remain in `.private/operations.md`.

## Module boundaries

- `scripts/security/`: dependency/image scanning and runtime report validation.
- `scripts/deploy/`: deployment process/lock control and authenticated HTTP routes.
- `scripts/shared/`: process execution, error handling and repository paths.
- `scripts/tests/`: isolated regression tests; no production deployment runs.
- Top-level scripts: command entries and the compatible webhook loader.
