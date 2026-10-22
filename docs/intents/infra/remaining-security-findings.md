---
status: shipped
module: infra
created: 2026-10-22
updated: 2026-10-22
---

# Remediate remaining dependency and container findings

## Intent

Continue the dependency audit with compatible fixes for remaining production
container and development-tool findings. The baseline is recorded in
`docs/intents/backend/dependency-upload-audit.md`.

## Spec

- Preserve application behavior, authentication and existing analytics data.
- Keep PostgreSQL on major version 15 and preserve startup ownership handling.
- Evaluate a maintained backend base and updated uv using the frozen lockfile.
- Patch analytics dependencies through reproducible image recipes where the
  official release has no fix; retain its application version and migrations.
- Resolve development dependency findings with compatible updates. Do not use
  audit fix, downgrade Lighthouse or migrate Tailwind as an incidental change.
- Never suppress scanner findings or remove package metadata to hide them.
- Verify isolated candidates with functional tests and fresh image scans before
  deployment. Record any remaining findings and concrete compatibility blockers.

## Plan

1. Inspect advisory paths and current upstream releases.
2. Build isolated candidates and test runtime, upload and analytics behavior.
3. Review changes independently, update documentation and deploy verified fixes.
4. Verify CI, live commit, container health and actual deployed image scans.

## Outcome

### Verified changes (2026-10-22)

- Backend: Python 3.12 Alpine 3.24 runtime and uv 0.12.24, keeping the frozen
  dependency lock. Trivy findings fell from 166 to 0. All 427 Django tests
  passed in the candidate image; isolated migrations, Gunicorn startup, health,
  CSRF bootstrap and native database/TLS/image imports passed.
- PostgreSQL: kept version 15.19 and the official root startup/ownership logic,
  replacing its bundled Go privilege-switch program with Alpine's maintained
  equivalent. Findings fell from 61 to 0. Disposable database initialization,
  process UID/GID 70, restart and persisted-row checks passed.
- Development dependencies: tested overrides for temporary files, UUIDs, FTP
  transport and CSS selector parsing reduced npm audit from 25 to 14 findings.
  The generated Tailwind CSS was byte-identical; actual Lighthouse collection
  through Chromium passed. All 1,284 frontend tests and type checks passed.
- Runtime npm audit remains 0. The remaining 14 findings (11 high, 3 moderate)
  are development-only dependency paths rooted in braces, extract-zip and
  sprintf-js. Their latest releases are still affected; ordinary updates cannot
  fix them. A js-yaml major override breaks Lighthouse's safeLoad API. Keep these
  findings visible until upstream fixes or a separately validated tool migration
  is available; do not downgrade Lighthouse or bypass security scans.

Remaining upstream advisories:

- [braces nested-pattern stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [extract-zip symlink path traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv)
  and [symlink archive writes](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3)
- [sprintf-js unbounded precision](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)

### Analytics and repository verification

- Umami: rebuilt application version 3.4.0 from its pinned upstream source with
  patched Next, image processing and transitive dependencies. The runtime no
  longer contains unnecessary global package managers. Isolated tests against
  the patched PostgreSQL candidate covered 26 completed migrations, login,
  tracker delivery, ingestion, analytics and restart persistence.
- A separate build-context scan identified 13 additional upstream dependency
  findings; compatible overrides cleared them. Trivy's default dependency scan
  now reports 0 findings across all four repository lock targets (backend, root
  npm and both Umami locks). This default excludes development dependencies;
  it does not contradict the full npm audit's 14 remaining findings.
- Independent review found no blocker in the image recipes, startup paths or
  deployment integration. Spelling, shell syntax and repository guard tests pass.

### Deployment

Final candidates passed verification. Trivy 0.76.1 reported 0 findings for
each deployed image. Image IDs after the final recreation and scan:

| Service    | Deployed image ID                                                         | Findings |
| ---------- | ------------------------------------------------------------------------- | -------: |
| Backend    | `sha256:af4168789df31ed40d264cbb36374a078ffc2ca5697d5ad7782bceba6172b5e0` |        0 |
| nginx      | `sha256:e2d97c2b8c016f12c2f1a27d095685063b2f281c4edf2babfde6001cf4fb77a8` |        0 |
| PostgreSQL | `sha256:45e3666491a2879dc525fdd32aabdd8a7bc08ac89bd3df2cc60ef3bfb4b1e15a` |        0 |
| Umami      | `sha256:c495764f01cb6b098adfe34f32afd73e7ac06e7ea67ef8945a19cbae30a47741` |        0 |

Code commit `5dc8d822` and the subsequent Dependabot PostCSS patch
`2348e25e729426ad34126e1c417f135bca5828be` are deployed. [CI run
39754056072](https://github.com/researcherhojin/emelmujiro/actions/runs/39754056072)
passed all five jobs. The public health endpoint reports the latest commit;
all services are healthy, and Umami's database check reports no pending
migrations. The homepage returns 200, anonymous image upload returns 401, the
tracking endpoint is routed, and the analytics dashboard returns 404. The
existing PostgreSQL 15 data volume was preserved.

These results cover known vulnerabilities in the scanned inventory. The 14
unfixed development findings remain visible and require upstream releases or
separate tool migrations. See [CHANGELOG.md](../../../CHANGELOG.md).
