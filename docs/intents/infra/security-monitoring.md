---
status: shipped
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
- Keep reports locally. Audit commands never update dependencies, restart a
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

PR #629 was merged and deployed as `de04f5bb`. Post-deployment validation
identified that the backend build context included the local scanner cache;
`.cache/` is now excluded from the Docker context. Follow-up fixes were deployed
and verified at `a922e19f`. Docker Desktop also retained analytics containers whose image IDs
became inaccessible after a rebuild; deployment now detects that condition,
recreates the analytics pair without deleting its volume, and verifies the
replacement image IDs. It reloads nginx to refresh the upstream address and
waits for the analytics heartbeat before reporting completion. The deployment
exercised this recovery path and passed all service checks.

- Full npm audit and Trivy 0.76.1 scans of all four lock files report 0 findings,
  including development dependencies. Image scanning covers installed packages;
  the `--include-dev-deps` option belongs to the `fs` command only.
- Independent review identified empty-inventory and scan-time replacement gaps;
  both were fixed and covered by regression tests.
- The final read-only host scan found 0 findings in each of the four running
  images: backend, frontend, analytics application and analytics database.
  The fresh-report validator also passed. The scanner binary is absent from
  the backend image. All four containers are healthy.
- Analytics replacement images passed isolated login, tracker, ingestion,
  migration, persistence and restart checks before deployment. A database
  backup was retained; website, event and completed-migration counts were
  unchanged after production replacement.
- The TypeScript webhook was restarted and handled the actual deployments.
  Its health endpoint passed, and unauthenticated deployment requests returned 401. Full main CI passed; production health reported the deployed commit.
  The ten static routes and login returned 200; an unknown route returned 404.
- The deployment request limit now counts UTF-8 bytes, correcting the previous
  character-count implementation of the documented 4096-byte bound.
- Existing `docker/umami/verify.mjs` (`verify.ts` since #708) remains necessary:
  `verify.sh` feeds it to the isolated container. Knip now records that external entry explicitly.
- Strict TypeScript checks and 27 regression tests pass on both development
  and deployment machines. A differential check
  against the original webhook at `f3820ff4` matches 13 deployment behaviors;
  the UTF-8 request-size correction is the intentional difference.
- The actual dependency audit also passes in a copied checkout whose path
  contains spaces, invoked from another working directory. The legacy webhook
  entry has an automated test for the same path conditions.
- Local image scanning exits 1 because this development machine has no Docker
  executable. It writes error results, not a false clean report. Host image
  results are recorded separately above; installing Docker was not requested.
- Documentation review corrected the stale current-tense dependency count in
  `backend/dependency-upload-audit.md`. (`ci/automerge-gate.md` was later closed
  with its timing evidence. Both intents were deleted after they shipped; git
  history keeps them.)

### Follow-up: stable analytics image IDs (2026-10-22)

Re-measured after the session above ended:

- The scan claim above ("0 findings in each of the four running images") was
  made at `a922e19f`. The next deploy, `72f5b644`, rebuilt the images again.
  For umami and umami-db the platform manifests were unchanged
  (`fa3e2f44…`, `d6133fa1…`); backend was rebuilt because `GIT_COMMIT` changed.
- The recovery branch added in `ae800eaf` fired on all three deploys after it
  (`ae800eaf`, `a922e19f`, `72f5b644`). Each time it recreated PostgreSQL and
  Umami and reloaded nginx, docs-only deploys included. The cause: every
  rebuild with provenance attestations produced a new OCI index digest around
  an unchanged platform manifest. Compose kept the containers, and
  `docker image inspect` could no longer read their `.Image`. A host probe
  showed that two builds without attestations keep one ID (`90f566ae…`, an OCI
  manifest that can be inspected by full ID, including through a container's
  `.Image`), while default builds changed ID every time.
- `ab121c7e` (#630) builds both analytics images with `provenance: false` and
  `sbom: false`. It reloads nginx whenever the umami container changes; before,
  the reload ran only in the fallback, so a real image change could leave nginx
  on a stale upstream. The health gate now also requires a 4xx from
  `/umami/api/send` through nginx. A stubbed harness covered six branch cases.
- Rollout: `ab121c7e` deployed with the previous script (`auto-deploy.sh` edits
  apply one deploy late). Its fallback recreated the pair once and reloaded
  nginx. During umami startup nginx logged two refused connections, at
  22:55:11 and 22:55:20 KST. The route then answered 405 at 13:55:34Z. The image
  IDs now equal the platform manifest digests (`fa3e2f44…`, `d6133fa1…`, media
  type `oci.image.manifest.v1`). Database counts before and after:
  website 1, `website_event` 3,236, session 315, completed migrations 26.
- No `/umami/api/send` request reached nginx between 08:50Z and 13:38Z, so
  neither a 502 nor a stored event occurred. The four page requests that looked
  human in that window were HTML-only scanner-like fetches. `website_event` has
  no rows dated 2026-10-22. Whether real visits before 08:50Z were lost cannot
  be determined, because the frontend container log starts at 08:50Z.

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
Git and excluded from the backend Docker context. Detailed reports go to
`backend/logs/security/`, also ignored. Dependency
reports are in its `dependencies/` directory; `summary.json` is the image report.
Exit 0 means the requested scan completed with no findings; exit 1 means findings
or an incomplete/failed check. A stored image report older than 36 hours is
rejected by `security:report`; rerun the manual image scan to refresh it.

From another directory, invoke an entry by its absolute path, such as
`node /path/to/repository/scripts/security/scan-dependencies.ts`, or use
`npm --prefix /path/to/repository run security:dependencies`. Paths containing
spaces must be shell-quoted. An optional `TRIVY_BIN` selects an existing scanner;
otherwise the local pinned installation is preferred, then `trivy` on PATH.

The manual audits require no webhook restart. Future changes to the running
webhook require a deliberate service restart. Since #708 the launchd agent runs
`scripts/deploy/deploy-webhook.ts` directly; the `.js` entry was removed.
Host-specific service-manager instructions remain in `.private/operations.md`.

## Module boundaries

- `scripts/security/`: dependency/image scanning and runtime report validation.
- `scripts/deploy/`: deployment process/lock control and authenticated HTTP routes.
- `scripts/shared/`: process execution, error handling and repository paths.
- `scripts/tests/`: isolated regression tests; no production deployment runs.
- Top-level scripts: command entries and the compatible webhook loader.
