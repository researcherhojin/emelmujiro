---
status: approved
module: infra
created: 2026-11-16
updated: 2026-11-16
---

# A deploy whose image-recipe changes are only Markdown rebuilds no image

## Intent

- **Problem**: `scripts/deploy/auto-deploy.sh` decides whether to rebuild the analytics and frontend images with `git diff --quiet "$PREV_HEAD" HEAD -- docker/umami docker/postgres docker-compose.yml` and `-- docker/nginx docker-compose.yml`. Those pathspecs count Markdown, which is never a build input: `docker/umami/.dockerignore` keeps only the build files, and the `docker/postgres` and `docker/nginx` Dockerfiles copy nothing. PR CI's `Docker Images` job already filters Markdown out (`pr-checks.yml` › `Detect image changes`).
  - On 2026-11-16 the deploy of `444d9d48`, whose only image-recipe change was `docker/umami/README.md`, logged `Building analytics images (pull, no cache)` and rebuilt `umami-db` and `umami` from scratch (host deploy log, 00:58–01:00Z; `.private/journal.md`, 2026-11-16 entry).
  - Replayed on the real ranges: `git diff --quiet 3505e952 444d9d48 -- docker/umami docker/postgres docker-compose.yml` exits `1` today and `0` with `':(exclude)*.md'` added; `bbb52245..055caa8e` (#796's Dockerfile change) exits `1` both ways.
- **Outcome wanted**: a deploy range whose only changes under those paths are `.md` files rebuilds neither image group; any other change under them still rebuilds, as today.
- **Affected systems**: `scripts/deploy/auto-deploy.sh` (the two `*_INPUTS_CHANGED` tests); `.claude/rules/ci.md` › Runtime image recipes (the lead sentence that names the paths); `docker/umami/README.md` (the sentence about README-only edits).
- **Constraints**:
  - An edit to `auto-deploy.sh` takes effect one deploy late (`ci.md`), so the live check needs a second deploy.
  - A missing image must still trigger a build (`docs/intents/infra/frontend-nginx-recipe.md`); that branch does not read these flags' pathspecs.
  - `frontend/nginx.conf`'s separate force-recreate test is not an image input and stays as it is.
- **Open questions**: none. The owner approved "skip Markdown, as PR CI does" on 2026-11-16.

## Spec

- **Approach**: append the git pathspec `':(exclude)*.md'` to both `git diff --quiet` calls. Without the `glob` magic, `*` in a pathspec also matches `/`, so it excludes Markdown at any depth (`docker/umami/README.md` measured above). Rejected: listing the build files explicitly (it would drift from `.dockerignore` and every Dockerfile), and switching to the `--name-only | grep -v '\.md$'` shape of `pr-checks.yml` (it needs the `grep -v` exit-status care that comment describes; the pathspec keeps the existing `--quiet` exit-code test).
- **Files and interfaces**:
  - `scripts/deploy/auto-deploy.sh`: the two `git diff --quiet` lines and the comment above the analytics one.
  - `.claude/rules/ci.md` › Runtime image recipes: the sentence naming the paths says Markdown is not counted, as `Docker Images` already does.
  - `docker/umami/README.md`: the sentence that says a README-only edit builds nothing in PR CI says the deploy builds nothing either. That edit ships in the close-out commit, after the new script is live, so it is the end-to-end check.
  - `CHANGELOG.md`: one entry.
- **Out of scope**: the backend image, which builds on every deploy by design (#776); the missing-image fallback; refresh-images.ts, which rebuilds nightly from the deployed SHA regardless of the diff.
- **Done when**:
  1. `bash -n scripts/deploy/auto-deploy.sh` exits 0, and `shellcheck scripts/deploy/auto-deploy.sh` reports nothing new against `main`.
  2. Replay of the analytics pathspec as written in the script: `3505e952..444d9d48` exits `0` (skip); `bbb52245..055caa8e` exits `1` (rebuild); `055caa8e..3505e952` exits `0`.
  3. Replay of the frontend pathspec on a range that touched `docker/nginx/Dockerfile` (found with `git log --format=%h -n1 -- docker/nginx/Dockerfile`, against its parent) exits `1`.
  4. End to end: after this PR's deploy (which still runs the old script), the close-out commit edits only `docker/umami/README.md` and this intent. Its deploy's log shows neither `Analytics build inputs changed` nor `Building analytics images`, and `/api/health/` reports that commit.

## Plan

- **Changes**:
  1. `scripts/deploy/auto-deploy.sh`: add `':(exclude)*.md'` to the analytics and frontend `git diff --quiet` calls; extend the analytics comment by one sentence saying Markdown is excluded because no recipe copies it, as in `pr-checks.yml`.
  2. `.claude/rules/ci.md` › Runtime image recipes: in "rebuilds the analytics images only when `docker/umami`, `docker/postgres` or `docker-compose.yml` changed in the deployed range, and the frontend image only when `docker/nginx` or `docker-compose.yml` did", add that `.md` files there do not count.
  3. `CHANGELOG.md`: one entry.
  4. Close-out commit (after the PR deploy): `docker/umami/README.md` sentence; this file's `Outcome` and `status`.
- **Risks**:
  - The pathspec could exclude too much: only names ending in `.md` match, and no build input under these paths ends in `.md` (`git ls-files docker docker-compose.yml | grep '\.md$'` lists only `docker/umami/README.md`). It would show as a recipe change that does not rebuild; Done when 2 covers it.
  - Quoting: the pathspec must stay single-quoted so the shell does not glob `*.md` in the repo root.
- **Verification**: Done when 1–3 locally and in the PR; 4 on the host after the close-out deploy.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
