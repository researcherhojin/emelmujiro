---
status: shipped
module: backend
created: 2026-10-22
updated: 2026-10-22
---

# Audit deployed dependencies and image uploads

<!-- cspell:ignore certifi -->

## Intent

Continue the remaining security review after cookie authentication hardening.
Initial audits found affected follow-redirects and certifi versions. Image upload
validation checks filename and declared MIME type but does not decode content.

## Spec

- Audit locked runtime dependencies and actual deployed container images.
- Apply compatible fixes for actionable vulnerabilities; distinguish build tools
  from browser/runtime dependencies and record scan failures explicitly.
- Restrict the image endpoint to supported raster images and validate decoding
  with resource limits. Preserve authorization, CSRF and upload size controls.
- Verify valid images and reject forged, truncated and oversized image content.
- Do not claim that a passing scanner proves complete security.

## Plan

1. Capture baseline dependency/image reports and reproduce upload validation gaps.
2. Patch dependencies and image handling with focused regression tests.
3. Run full tests, audit again, obtain independent review and record deployment
   status and any remaining findings.

## Outcome

### Implementation and verification (2026-10-22)

- Updated follow-redirects to 1.16.1 and certifi to 2026.10.19; added Pillow
  13.0.0 for actual JPEG, PNG and GIF decoding. Animation limits and early
  decompression checks reject tested malformed and truncated image inputs and
  enforce resource limits.
- Moved compilers and headers into a Docker build stage and removed runtime pip.
  Updated nginx to 1.31.8-alpine; refreshed the existing PostgreSQL 15.19 image
  without changing its database major version.
- Backend: 427 tests passed locally and inside the candidate runtime image,
  including 16 upload security tests. Validator coverage: 100% of 61 statements
  and 16 branches. Independent review identified truncated GIF exceptions and
  decoder allocation ordering; both have regression tests and are fixed.
- Frontend: 1,284 tests in 69 files passed, type checking passed, and a production
  asset build succeeded. None of the 25 flagged development packages appeared
  in the 29 generated browser source maps.
- Runtime npm audit: 0 findings. Python audit: 0 findings across 31 dependencies.
  These results describe known advisories at scan time, not a security guarantee.

### Initial deployment snapshot

These first candidate scans and the deployment below document the upload and
runtime changes as they first shipped. Their unpatched Debian, PostgreSQL and
Umami findings were subsequently addressed in
[`remaining-security-findings.md`](../infra/remaining-security-findings.md).
That follow-up contains the current image scans, latest deployed commit and the
14 development-only npm findings that remain.

| Image            | Initial scan | Follow-up scan |
| ---------------- | -----------: | -------------: |
| Backend          |        1,666 |              0 |
| nginx            |           10 |              0 |
| PostgreSQL 15.19 |           64 |              0 |
| Umami 3.4.0      |           39 |              0 |

The counts are Trivy package/advisory instances, not distinct exploitable
vulnerabilities. Image validation stores original bytes; it does not scan for
malware or remove metadata.

### Deployment

Deployed commit `6fa1673ddd54182310b499337be8b7492fe44ee3` on 2026-10-22.
[CI run 39750512648](https://github.com/researcherhojin/emelmujiro/actions/runs/39750512648)
passed Backend Tests, Frontend Tests, Frontend Build, Sync README Badges and
Deploy to Mac Mini. The public health endpoint returned that exact baked commit;
all four containers were healthy. The running nginx and PostgreSQL image IDs
matched the scanned images. A fresh scan of the deployed backend reproduced
the candidate result: 166 findings with the same severity counts. See the
security follow-up entry in
[CHANGELOG.md](../../../CHANGELOG.md).
