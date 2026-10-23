---
status: shipped
module: ci
created: 2026-10-23
updated: 2026-10-23
---

# E2E never waits on the Ubuntu mirror, and PRs save no node_modules cache

## Intent

- **Problem 1**: `E2E Tests` › `Install Playwright system deps (cache hit)` usually takes 13 s, but it took 348 s in #653's run `39894065554` and 584 s in #651's run `39891673103`. The second ran into the job's 10-minute limit and cancelled the tests.
  - The log of `39894065554` shows where the time went: `Fetched 25.9 MB in 5min 27s (79.3 kB/s)` from `azure.archive.ubuntu.com`.
  - The browser is cached, but the `.deb` packages it needs are downloaded on every run.
- **Problem 2**: `.github/actions/setup-node` saves `node_modules` from any job that leaves `save-cache` at its default. Five PR jobs do so.
  - #653 changed the lockfile, so its run stored a PR-scoped 84,913,181-byte copy (`refs/pull/653/merge`). No other PR can restore it.
  - That save is the 4 s `Post Setup Node.js with cache` step in `Build for Analysis`.
  - This is the same leak #631 closed for the Playwright browser and the Trivy DB (`.claude/rules/ci.md` › Shared caches saved only on `main`).
- **Outcome wanted**:
  - The Playwright `.deb` files come from a cache saved on `main`, so a slow mirror only matters when the package set changes.
  - No PR job saves `node_modules`.
- **Affected systems**: `.github/actions/setup-node/action.yml`, `.github/workflows/cache-warm.yml`, `.github/workflows/pr-checks.yml` (`E2E Tests`), `.claude/rules/ci.md`, `CHANGELOG.md`.
- **Constraints**:
  - Cite steps by name (Gotcha #12).
  - Shared caches are saved only in `main`'s scope.
  - Keep the cache small: about 26 MB of `.deb` files, and no apt `partial/` directory.
- **Open questions**: none. The owner asked for the cache work on 2026-10-23.

## Spec

- **Approach**:
  - **apt archives**: the runner's apt writes its archives to `~/apt-archives` and keeps them. A drop-in file in `/etc/apt/apt.conf.d/` sets `Dir::Cache::Archives` and `Binary::apt::APT::Keep-Downloaded-Packages "true"`.
    - `cache-warm.yml`'s Playwright job runs `npx playwright install-deps chromium` with that config and saves `~/apt-archives/*.deb`.
    - The key is `Linux-playwright-apt-<playwright version>-<ImageVersion>`. A runner image update therefore saves a fresh set, and PRs fall back through `restore-keys` meanwhile.
    - `E2E Tests` restores the cache into the same directory with the same config. apt then downloads only packages missing from it.
  - **node_modules**: the composite action saves only when `save-cache` is true **and** `github.ref` is `refs/heads/main`. Everywhere else it restores read-only.
  - **Stale caches**: delete the superseded `node-modules` key, the 2026-10-22 Trivy DB and the PR-scoped copy by hand.
  - Rejected: running E2E in the Playwright container image. It changes the whole job, and it pulls an image of over 1 GB on every run.
- **Out of scope**: the uv cache (`Setup uv with cache` takes 4 s), Lighthouse's own runtime, and the 10-minute E2E job limit.
- **Done when**:
  - `actionlint` reports nothing new for the three changed workflow and action files.
  - After merge, `Warm Shared Caches` on `main` saves a `Linux-playwright-apt-…` cache of the expected size.
  - The next PR's `E2E Tests` restores it, and its `install-deps` log has no `Get:` lines for the cached packages.
  - That PR's run creates no `refs/pull/*` cache: `gh cache list` shows none.

## Plan

- **Changes**: the files listed above and this intent.
- **Risks**:
  - If apt cannot write to `~/apt-archives`, `install-deps` fails, and the E2E job goes red and visible rather than silently slow.
  - A wrong `restore-keys` only costs the old download time.
- **Verification**: the Done-when checks. Review is the advisor; the owner excluded review tools.

## Outcome

Shipped in #654 (`e4c1933a`). #655 followed, raising the warm job's limit to 30 minutes.

- **apt cache**: the first `Warm Shared Caches` run on `main` (`39896636044`) fetched `25.9 MB in 9min 3s (47.7 kB/s)` and saved `Linux-playwright-apt-1.64.1-20261012.334.1` (25,920,232 B). That run came close to the old 10-minute limit, hence #655.
  - #655's `E2E Tests` (run `39897640367`) restored it and logged `Need to get 0 B/25.9 MB of archives.` `Install Playwright system deps` took 11 s; earlier runs that day took 225, 348 and 584 s.
- **apt warning**: `_apt` cannot enter the runner's home, so apt printed a `W:` line saying it downloaded as root, outside its sandbox. `APT::Sandbox::User "root"` removed the warning.
- **node_modules**: no `refs/pull/*` cache appeared after #654 or #655. Before #654, three superseded caches (264,187,140 B) were deleted: the old lockfile's `node-modules`, the 2026-10-22 Trivy DB, and #653's PR copy.
- **actionlint** reports nothing new; the one finding is the existing SC2016 info in `pipeline-watchdog.yml`.
