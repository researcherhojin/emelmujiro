---
status: shipped
module: infra
created: 2026-10-22
updated: 2026-10-22
---

# Remediate remaining dependency and container findings

<!-- cspell:ignore modelcontextprotocol emnapi tmpfs bidi Bidi -->

## Intent

Continue the dependency audit with compatible fixes for remaining production
container and development-tool findings. The baseline is recorded in
`docs/intents/backend/dependency-upload-audit.md` (deleted after it shipped; git history keeps it).

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
  fix them. A js-yaml major override breaks Lighthouse's safeLoad API (later found to affect only YAML rc files; see the js-yaml follow-up). Keep these
  findings visible until upstream fixes or a separately validated tool migration
  is available; do not downgrade Lighthouse or bypass security scans.

Remaining upstream advisories:

- [braces nested-pattern stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [extract-zip symlink path traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv)
  and [symlink archive writes](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3)
  (removed by the follow-up below)
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
unfixed development findings remained visible at this point; the follow-up below
reduced them to 10. See [CHANGELOG.md](../../../CHANGELOG.md).

### Follow-up: extract-zip path removed (2026-10-22)

Re-measured on `b1acc7d6`: `npm audit` reported 14 findings (11 high, 3
moderate) along three paths, and the latest release of each root package was
still inside its advisory range (`braces` 3.0.3, `extract-zip` 2.0.1,
`sprintf-js` 1.1.3). The audit's offered fixes were a Tailwind 4 major and an
`@lhci/cli` downgrade from 0.15.1 to 0.12.0, both excluded.

- `extract-zip` came only through `lighthouse@12.6.1` → `puppeteer-core@24.43.1`
  → `@puppeteer/browsers@2.13.2`. `@puppeteer/browsers` 3.x no longer depends
  on it: zip extraction uses system tools or an optional `yauzl` peer.
  `@puppeteer/browsers` was overridden to exactly 3.2.5, the release
  `puppeteer-core@25` uses. All 13 symbols that `puppeteer-core` 24 reads from
  it are still exported, and 3.x needs Node 22.12 or later, which Node 24
  satisfies.
- A plain `npm install` kept the locked 2.13.2 and `npm ls` printed `invalid`.
  Deleting its lock entry by hand produced a corrupt tree, so that attempt was
  reverted. `npm update @puppeteer/browsers` applied the override: 32 lock
  entries were removed (`extract-zip`, `yauzl`, the `tar-fs` stack and nested
  `yargs` 17) and `modern-tar@0.8.6` was added. npm also restored
  `"dev": true` on `@types/react`, `@types/react-dom`, `csstype` and
  `typescript`, the same marker drift recorded in CHANGELOG before. The
  `@rolldown/binding-*` entries were unchanged, including
  `binding-linux-x64-gnu`.
- Verification: `npm ci` reproduced the tree with `@puppeteer/browsers@3.2.5`
  marked `overridden` and no `invalid` entries. `react` and `react-dom` both stayed
  at 19.3.1, with one `@tiptap/core` at 3.32.0. `require('puppeteer-core')`,
  `import('lighthouse')` and LHCI's `puppeteer-manager` all loaded.
  `npx @lhci/cli autorun` (the `Lighthouse CI` job's command) completed 3 runs
  for each of 4 URLs and passed every error-level assertion. `npm run validate` passed, with all 1,284
  frontend tests across 69 files.
- Result: `npm audit` reports 10 findings (5 high, 5 moderate), all marked
  `"dev": true`. `npm audit --omit=dev` reports 0. `@lhci/cli`,
  `@lhci/utils`, `lighthouse`, `puppeteer-core`, `@puppeteer/browsers` and
  `extract-zip` dropped out or fell to moderate.

Deployed as `863c187b` ([#625](https://github.com/researcherhojin/emelmujiro/pull/625)).
All 12 PR jobs passed, including `Lighthouse CI` on `ubuntu-24.04` and
`Security Scan`, whose Trivy found 0 vulnerabilities in `package-lock.json` and
in both Umami `pnpm` locks. [Main run
39759739710](https://github.com/researcherhojin/emelmujiro/actions/runs/39759739710)
passed all five jobs. `/api/health/` reports `863c187b` and the homepage returns 200.

Still open, with blockers:

- `braces` (5 high: `braces`, `chokidar`, `micromatch`, `fast-glob`,
  `tailwindcss`). Tailwind 3 depends on chokidar 3 and micromatch 4, and no
  braces release is outside the advisory range. Fixing it needs the Tailwind 4
  migration, which is dependabot-ignored and out of scope.
- `sprintf-js` (5 moderate: `sprintf-js`, `argparse`, `js-yaml`, `@lhci/utils`,
  `@lhci/cli`). `@lhci/utils@0.15.1` needs `js-yaml@^3` for `safeLoad`, and
  `js-yaml@3` uses `argparse@1` only in its own CLI. Overriding `argparse` to 2
  would break that CLI rather than fix anything, so it was not done. This needs
  an upstream LHCI release on `js-yaml` 4 or a fixed `sprintf-js`.

### Verification gaps closed (2026-10-22)

- Trivy 0.76.1 (release binary, checksum verified) on `9abbdd2d`, default
  mode as in CI: 0 findings in `backend/uv.lock`, `package-lock.json` and both
  Umami locks. With `--include-dev-deps`: `backend/uv.lock` 0, Umami runner 0,
  `package-lock.json` 1 (`braces@3.0.3`, no fixed version; Trivy's database
  lacks the five `sprintf-js`-path entries `npm audit` reports), and **the Umami
  builder lock `docker/umami/pnpm-lock.yaml` 23** (6 high, 12 medium, 5 low in
  `undici@8.9.0`, `vite@8.0.16`, `brace-expansion@5.0.9`,
  `@modelcontextprotocol/client@2.0.0`, `@vitest/mocker@4.1.11`,
  `postcss-selector-parser@7.1.4`), every one with a fixed release. They are
  development dependencies of the upstream source, installed only in the
  `source`/`builder` stages; the runner installs from its own lock. Not yet
  fixed: the change needs a regenerated pnpm lock, an image rebuild and
  `docker/umami/verify.sh`, and this machine has no Docker.
- Bundle: `vite build` of `b1acc7d6` (fresh worktree, `npm ci`) and of
  `9abbdd2d` produced 55 byte-identical files (SHA-256); the only difference was
  the gitignored, generated `robots.txt` and `sitemap.xml` missing from the
  fresh worktree. The dependency change does not alter shipped frontend code.
- `@puppeteer/browsers@3.2.5` zip path exercised: `install()` of
  `chrome-headless-shell` 156.0.8078.47 extracted through the system
  `unzip -o` (`execFile`, no shell) and the binary ran. The optional `yauzl`
  fallback validates symlink targets before writing.
- Reachability of the 10 remaining `npm audit` findings: `sprintf-js` is
  reached only through `argparse`, which `js-yaml@3` requires only in its own
  CLI, and nothing in the repository runs that CLI. `braces` expands the
  developer-written Tailwind content globs (`frontend/tailwind.config.js`), not
  external input.
- Not done: Trivy scans of the running production images. Exporting them from
  the deploy host over SSH was refused by this session's permission policy, so
  the image-ID table above (scanned earlier on 2026-10-22) remains the latest
  image evidence; this change did not rebuild any image.

### Umami builder lock (2026-10-22)

The 23 development findings in `docker/umami/pnpm-lock.yaml` came from upstream
test and tooling paths: `undici` via `jsdom`, `vite` and `@vitest/mocker` via
`vitest`, `@modelcontextprotocol/client` from `packages/mcp`,
`postcss-selector-parser` from PostCSS plugins and `brace-expansion@5.0.9` from
`minimatch@9.0.7`. Override floors were added in `pnpm-workspace.yaml`:
`undici` 8.10.2, `vite` 8.1.6 (the lowest fixed release; `rolldown`, `@emnapi/*`
and `@oxc-project/types` moved with it), `vitest` 4.1.12, `@modelcontextprotocol/client` 2.3.0,
`postcss-selector-parser` 7.1.6 and `brace-expansion` 5.0.12. The lock was
regenerated by the README procedure with `pnpm@12.3.4`, from the
checksum-verified upstream archive.

- Trivy 0.76.1 reports 0 findings in that lock, in default mode and with
  `--include-dev-deps`. The runner lock is unchanged, and so are the runtime
  dependencies.
- With the new lock and the Dockerfile's dummy environment, a frozen install
  succeeded, `pnpm build:docker` succeeded, and upstream's tests passed (118
  files, 882 tests). Before the build, `src/app/mcp/route.test.ts` failed
  because the `@umami/api-client` workspace package had not been built yet. It
  passed after the build.
- The same build from the previous lock produced identical output, apart from
  per-build random values (the build ID and the server-action encryption key):
  99 client static files, 3,255 server files and the standalone package set.
  None of the six patched packages ship in `.next/standalone`.
- Candidate on the deploy host (commit `35093b05`): a Docker build, then
  `verify.sh` against `emelmujiro/postgres:15.19-security-1` on a disposable
  network with a tmpfs database (26 migrations, login, tracker, ingestion,
  analytics, non-root startup and restart persistence), and a Trivy 0.76.1
  image scan of 185 targets, 0 findings. Two builds of the same commit produced
  different image IDs (`731b425f…` and `1207baa7…`), so the build is not
  bit-reproducible. The deployed image is a rebuild from identical inputs, and
  it was therefore verified again after deployment.
- Deployed as `df86b6ff` ([#626](https://github.com/researcherhojin/emelmujiro/pull/626)).
  All PR checks and [main run 39764382370](https://github.com/researcherhojin/emelmujiro/actions/runs/39764382370)
  passed, and `/api/health/` reports `df86b6ff`. The running Umami container is
  healthy, on image
  `sha256:22b7ca85b621c789b141c05c1327c81819925509d50b612c1e0e5982a9385bfd`.
  That image passed `verify.sh` in isolation, Trivy reported 0 findings, and
  Prisma reports the production schema up to date.
- The docs-only deploy `7c70ffed` rebuilt the Umami tag as
  `sha256:8aa3e2478893…`. Its layer list and creation time (`10:31:20Z`) are
  identical to the verified candidate `1207baa7…`, so it is a cache rebuild of
  the same content under a different index digest. That tag image passed
  `verify.sh` and Trivy (0 findings) again. Compose did not recreate the
  container: `emelmujiro-umami` still runs `22b7ca85…`, the image verified above
  (started `10:38:23Z`, healthy). The deploy host uses the containerd image
  store, so once the tag moves, the container's previous image ID can no longer
  be inspected. Post-deploy checks must therefore compare the container's
  `.Image` with the tag's `.Id`, not scan the tag alone. `emelmujiro-umami-db`
  still runs `45e3666…`, the scanned image in the deployment table.

### Follow-up: sprintf-js path removed (2026-10-22)

The earlier note that a js-yaml major override breaks LHCI's `safeLoad` holds
only for YAML configuration. `@lhci/utils/src/lighthouserc.js` calls
`yaml.safeLoad` solely for `.yml`/`.yaml` rc files, and this repository uses
`frontend/lighthouserc.js`.

- The root `overrides` set `"@lhci/cli": { "js-yaml": "4.3.2" }`, the version the
  Umami recipe already uses. js-yaml 4.3.2 keeps a CommonJS `require` entry and
  depends on `argparse@2.0.1`, which has no `sprintf-js`. A plain install
  printed `invalid` again, and `npm update js-yaml` applied the override. The
  lockfile changed exactly three entries: `js-yaml` 3.15.2 → 4.3.2, `argparse`
  1.0.10 → 2.0.1 (license `MIT` → `Python-2.0`, development only), and
  `sprintf-js` 1.0.3 was removed. `esprima` stays for other consumers, and the
  rolldown bindings are unchanged.
- Verification: `npm ci` shows `js-yaml@4.3.2 overridden` and no `invalid`
  entries. React and react-dom are still at 19.3.1, and `@tiptap/core` at
  3.32.0. `loadRcFile` reads `lighthouserc.js` with all 4 URLs; a temporary YAML
  rc failed with `Function yaml.safeLoad is removed in js-yaml 4`.
  `npx @lhci/cli autorun` checked assertions over 4 URLs and 12 runs, with
  warnings only, and exited 0. `npm run validate` passed (69 files, 1,284
  tests). `.claude/rules/frontend-build.md` now requires the LHCI config to
  stay JavaScript.
- Result: `npm audit` reports 5 findings (5 high), all `braces` through
  Tailwind 3 (`braces`, `chokidar`, `micromatch`, `fast-glob`, `tailwindcss`),
  all marked `"dev": true`. `npm audit --omit=dev` reports 0.
- `braces` has no fixed release, and removing it requires the Tailwind 4
  migration. The owner chose to plan that separately:
  `docs/intents/frontend/tailwind-v4-migration.md`.

### Closure (2026-10-22)

The last `braces` path was removed by the Tailwind 4 migration (`f1040650`,
`docs/intents/frontend/tailwind-v4-migration.md`). `npm audit` on `main` now
reports `found 0 vulnerabilities`, and `npm audit --omit=dev` reports 0.

### Follow-up: zod and body-parser (2026-10-24)

The 2026-10-24 Security Operations Watchdog failure (#660) found `npm audit`
at 7 high findings again, all marked `"dev": true`. Two advisories had arrived
upstream: GHSA-mrhx-c7xc-m3w5 (`zod` < 4.6.6, no lower bound) and
GHSA-27r3-jxmh-p828 (`body-parser` < 1.20.9, published 2026-10-23). The other
five were `chromium-bidi`, `puppeteer-core`, `lighthouse`, `@lhci/utils` and
`@lhci/cli`, reached only through `zod`. The audit's offered fix was again the
`@lhci/cli` 0.13.0 downgrade, which is excluded (Gotcha #6).

- `body-parser` 1.20.8 came through `@lhci/cli` → `express@4.22.3`, already the
  newest 4.x, whose `~1.20.5` range admits 1.20.9. `npm update body-parser`
  moved it without an override.
- Root `zod` 4.6.5 (`eslint-plugin-react-hooks`, `knip`): `npm update zod` → 4.6.7.
- `chromium-bidi@14.0.0` (pinned exactly by `puppeteer-core@24.43.1`) declares
  `zod ^3.24.1`, and no 3.x release is fixed. The narrowest change is the
  scoped override `"chromium-bidi": { "zod": "4.6.7" }`. Swapping
  `chromium-bidi` to the 157.x line that `puppeteer-core@25` uses would cross
  143 major versions of the mapper itself. `chromium-bidi` reaches zod only
  through `protocol-parser`, at runtime with `lazy`, `object`, `literal`,
  `string`, `union`, `array`, `number`, `boolean`, `null`, `enum`, `tuple`,
  two-argument `record`, `any`, `default`, `optional`, `passthrough` and
  `safeParse`, all present in zod 4. A valid `parseNavigateParams` call parses.
- **Known divergence**: `parseObject` reads `parseResult.error.errors`, which
  zod 4 removed, so invalid BiDi input throws `TypeError: Cannot read
properties of undefined (reading 'map')` instead of
  `InvalidArgumentException`. That path runs only when Puppeteer speaks
  WebDriver BiDi through `BidiOverCdp`; Lighthouse drives Chrome over CDP.
- Verification: `npm ci` reproduced the tree with no `invalid` entries and no
  nested `chromium-bidi/node_modules/zod`. `zod`, `body-parser`,
  `chromium-bidi` and `@lhci/cli` keep `"dev": true`, and
  `@rolldown/binding-linux-x64-gnu` is still locked. `require('puppeteer-core')`,
  the `BidiMapper` module and `import('lighthouse')` load. `frontend` lint and
  `knip` pass. `npm audit` reports `found 0 vulnerabilities`.
