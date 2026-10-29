---
status: shipped
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# A PR that changes an image is built and smoke-tested before it can merge

## Intent

- **Problem**: no workflow builds or starts a Docker image. The images are built only on the deploy host, by `auto-deploy.sh`. So a broken base-image bump surfaces first as a failed deploy, which stays green (Gotcha #17).
  - Dependabot proposes these bumps through two ecosystems: `docker` for `/backend`, `/docker/postgres` and `/docker/umami`, and `docker-compose` for `/`, which covers the nginx pin.
  - Patch bumps auto-merge once tests and lint pass. The nginx 1.31.7 bump (#618) merged that way with zero tests (the 2026-10-22 audit, `docs/intents/ci/silent-check-failures.md`, deleted after it shipped; git history keeps it).
  - On 2026-10-23 the owner chose to build images in CI.
- **Outcome wanted**: a PR that touches an image's inputs builds and checks that image, and Dependabot auto-merge requires the result.
- **Affected systems**:
  - `.github/workflows/pr-checks.yml`: a new job, plus the auto-merge and summary jobs.
  - `.claude/rules/ci.md`.
  - CLAUDE.md Gotcha #12 (the auto-merge gate).
- **Constraints**:
  - Runners stay on `ubuntu-24.04`.
  - `${{ }}` goes only through `env:`.
  - No layer cache. Caches saved from a PR live in that PR's scope and refill the 10 GB limit (`docs/intents/ci/actions-cache-scope.md`).
  - Nothing is pushed. No secrets.

## Spec

- **Approach**: a new `docker-images` job, `Docker Images`, with no `needs` and no job-level `if:`. It always runs and reports success or failure, so the auto-merge gate can require `success` without a `skipped` escape hatch.
  - **One step diffs the PR** (`base.sha..github.sha`) and sets a flag per image:
    - `backend`: `backend/Dockerfile`, `.dockerignore`, `pyproject.toml`, `uv.lock`
    - `postgres`: `docker/postgres/`
    - `umami`: `docker/umami/`
    - `nginx`: `docker-compose.yml`, `frontend/nginx.conf`
  - **Each flagged image gets its own check**:
    - backend: `docker build`
    - PostgreSQL: build, then the existing `docker/postgres/verify.sh`
    - Umami: build, then the existing `docker/umami/verify.sh`. This build is slow, so it runs only on its own paths.
    - nginx: pull the compose-pinned image and run `nginx -t` on the repo config, mounted where Compose mounts it. `--add-host` resolves the `backend` and `umami` upstreams.
  - **The gate and the summary**:
    - `Auto-Merge Dependabot` needs `docker-images` and requires `success`.
    - The PR Summary gains a row.
- **Files and interfaces**: `pr-checks.yml`, the `ci.md` CI job gating bullet, Gotcha #12.
- **Out of scope**:
  - Image vulnerability scanning in CI (`scripts/security/scan-running-images.ts` covers running images).
  - Caching layers.
  - Building images on `main`.
- **Done when**:
  - `actionlint` reports nothing new.
  - A test commit that touches all four groups makes the PR run build backend, PostgreSQL and Umami, pass both verify scripts, and pass `nginx -t`.
  - After that commit is reverted, the run skips every image step, and the job still reports success.
  - The PR Summary shows the row.

## Plan

- **Changes**: the job, the gate and the summary, `ci.md`, Gotcha #12, and the CHANGELOG entry.
- **Risks**:
  - The Umami build makes its PRs slower. That build is limited to `docker/umami/` changes.
  - An upstream registry outage now reddens the job for image PRs. That is the correct signal for a bump PR.
- **Verification**: the Done-when items.

## Outcome

Shipped in #637 (`af5ef922`, merged 2026-10-22T16:56:44Z). Production
reports `af5ef922`.

- `actionlint` reported nothing new.
- In the parsed graph, `Auto-Merge Dependabot` needs `affected-tests`,
  `frontend-lint`, `backend-lint` and `docker-images`, and `docker-images`
  needs nothing.
- **With the temporary test commit**, run `39816191510` touched all four
  inputs. The job ran from 16:42:34 to 16:45:43 (3 min 9 s):

  | Step                                        | Result                                                                                                                                                                                            |
  | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Build backend image                         | built in 35 s                                                                                                                                                                                     |
  | Build and verify PostgreSQL image           | 8 s; `verify.sh`: `PASS: initialization, postgres UID/GID 70, clean restart and persisted row`                                                                                                    |
  | Build and verify Umami image                | 138 s; `verify.sh` printed both `PASS:` lines (Next, Prisma, geo, login, tracker, OpenAPI, website creation, ingestion and analytics; non-root startup, migration, event persistence and restart) |
  | Check nginx config against the pinned image | `nginx:1.31.8-alpine`: `syntax is ok`, `test is successful`                                                                                                                                       |

- **After the revert**, run `39817630022` had no image input changed:
  - All four image steps were `skipped` and the job concluded `success`.
  - The PR Summary showed `| Docker Images | ✅ |`.
- The squash merge contains only the five feature files. The four image
  inputs match the state before the PR.
