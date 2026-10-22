---
status: in-progress
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# A Markdown-only change under `docker/` builds no image

## Intent

- **Problem**: `Docker Images` (`docs/intents/ci/docker-image-checks.md`) flags PostgreSQL on `^docker/postgres/` and Umami on `^docker/umami/`, so a change to `docker/umami/README.md` alone builds and verifies the Umami image.
  - #642 changed only docs, including that README, and its `Docker Images` job took 2m38s. When nothing matches, the job takes 5 s (#641's run `39822722496`).
  - The README is not a build input. `docker/umami/.dockerignore` keeps only `Dockerfile`, the pnpm manifests and `runner/`, and `docker/postgres/Dockerfile` copies nothing.
- **Outcome wanted**: a PR whose changes under `docker/` are all Markdown builds no image. Any other file there, including `verify.sh`, `verify.mjs` and `.dockerignore`, still triggers its image.
- **Affected systems**: `.github/workflows/pr-checks.yml` (`Detect image changes`), `.claude/rules/ci.md` › CI job gating, `CONTRIBUTING.md`, `docker/umami/README.md`, `CHANGELOG.md`.
- **Constraints**:
  - The step runs under the default `bash -e {0}`. A command substitution whose `grep -v` matches nothing exits `1` (Gotcha #11), so the filter must sit inside the `if` condition.
  - Cite steps by name, not line number (Gotcha #12).
- **Open questions**: none. The owner approved this follow-up on 2026-10-23.

## Spec

- **Approach**: drop `.md` paths inside `flag()`'s `if` pipeline, before the pattern match. One filter covers all four flags. The backend and nginx patterns name exact files, so the filter changes nothing for them.
  - Rejected: editing each directory pattern to exclude `.md`. Four regexes would each carry the same exception.
  - Rejected: a precomputed `FILES` without Markdown. On an all-Markdown PR, its `grep -v` exits `1` outside any `if`.
- **Files and interfaces**: the `flag()` function in `Detect image changes`; the CI job gating bullet; the Docker sentence in `CONTRIBUTING.md`; the PR-job paragraph in the Umami README.
- **Out of scope**: what each image check does once triggered; the backend and nginx patterns.
- **Done when**:
  - `actionlint` with shellcheck reports nothing for `pr-checks.yml`.
  - The step's script, extracted verbatim and run under `bash -e` with a stubbed `git diff`, gives the expected four flags and exit `0` in each case:
    - all files Markdown
    - only `docker/umami/README.md`
    - `docker/umami/verify.sh`, `verify.mjs` or `.dockerignore`
    - the Umami `Dockerfile` with its README
    - `docker/postgres/verify.sh`
    - an empty diff
    - `backend/Dockerfile` and `frontend/nginx.conf`
  - This PR changes the Umami README, and its own `Docker Images` job runs no build step.

## Plan

- **Changes**: this intent; `pr-checks.yml`; `ci.md`, `CONTRIBUTING.md` and the Umami README; the `CHANGELOG.md` entry.
- **Risks**: a future Dockerfile that copies a `.md` file would no longer trigger its build. The `ci.md` bullet states the assumption, so whoever adds such a copy sees it.
- **Verification**: the Done-when checks. Review is the synthetic cases plus the advisor; the owner excluded review tools this session.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
