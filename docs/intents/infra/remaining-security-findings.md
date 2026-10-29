---
status: shipped
module: infra
created: 2026-10-22
updated: 2026-10-28
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

- Backend: Python 3.12 Alpine 3.24, uv 0.12.24, frozen lock kept. Trivy
  findings 166 to 0. All 427 Django tests passed in the candidate image, plus
  isolated migrations, Gunicorn startup, health, CSRF bootstrap and native
  database/TLS/image imports.
- PostgreSQL: kept 15.19 and the official root startup/ownership logic; its
  bundled Go privilege-switch program was replaced with Alpine's equivalent.
  Findings 61 to 0. Initialization, process UID/GID 70, restart and
  persisted-row checks passed.
- Development dependencies: overrides for temporary files, UUIDs, FTP transport
  and CSS selector parsing cut npm audit from 25 to 14. Tailwind CSS
  byte-identical, Lighthouse collection through Chromium passed, all 1,284
  frontend tests and type checks passed.
- Runtime npm audit 0. The 14 remaining findings (11 high, 3 moderate) were
  development-only (braces, extract-zip, sprintf-js), latest releases still
  affected. A js-yaml major override breaks Lighthouse's safeLoad API (later
  found to affect only YAML rc files; see the js-yaml follow-up). No Lighthouse
  downgrade, no scan bypass.

Upstream advisories at that point:

- [braces nested-pattern stack exhaustion](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
- [extract-zip symlink path traversal](https://github.com/advisories/GHSA-jmr9-qjv8-65gv)
  and [symlink archive writes](https://github.com/advisories/GHSA-7pqw-9j4j-h8q3)
  (removed by the follow-up below)
- [sprintf-js unbounded precision](https://github.com/advisories/GHSA-hp3w-g68c-fv3c)

### Analytics and repository verification

- Umami 3.4.0 rebuilt from pinned upstream source with patched Next, image
  processing and transitive dependencies, and no global package managers.
  Isolated tests on the patched PostgreSQL: 26 migrations, login, tracker,
  ingestion, analytics, restart persistence.
- A build-context scan found 13 more upstream findings; overrides cleared them.
  Trivy's default scan reports 0 across all four lock targets (backend, root
  npm, both Umami locks); it excludes development dependencies, so it does not
  contradict the 14 from the full npm audit.
- Independent review found no blocker; spelling, shell syntax and guard tests
  pass.

### Deployment

Trivy 0.76.1 reported 0 findings for each deployed image:

| Service    | Deployed image ID                                                         | Findings |
| ---------- | ------------------------------------------------------------------------- | -------: |
| Backend    | `sha256:af4168789df31ed40d264cbb36374a078ffc2ca5697d5ad7782bceba6172b5e0` |        0 |
| nginx      | `sha256:e2d97c2b8c016f12c2f1a27d095685063b2f281c4edf2babfde6001cf4fb77a8` |        0 |
| PostgreSQL | `sha256:45e3666491a2879dc525fdd32aabdd8a7bc08ac89bd3df2cc60ef3bfb4b1e15a` |        0 |
| Umami      | `sha256:c495764f01cb6b098adfe34f32afd73e7ac06e7ea67ef8945a19cbae30a47741` |        0 |

Deployed `5dc8d822` and the Dependabot PostCSS patch
`2348e25e729426ad34126e1c417f135bca5828be`. [CI run
39754056072](https://github.com/researcherhojin/emelmujiro/actions/runs/39754056072)
passed all five jobs. Health reports the latest commit, services healthy, Umami
has no pending migrations. Homepage 200, anonymous image upload 401, tracking
endpoint routed, analytics dashboard 404; PostgreSQL 15 volume preserved.

This covers known vulnerabilities in the scanned inventory; the 14 development
findings were reduced to 10 by the follow-up below. See
[CHANGELOG.md](../../../CHANGELOG.md).

### Follow-up: extract-zip path removed (2026-10-22)

On `b1acc7d6`, `npm audit` had 14 findings (11 high, 3 moderate), each root
package's latest release in range (`braces` 3.0.3, `extract-zip` 2.0.1,
`sprintf-js` 1.1.3). Offered fixes, both excluded: Tailwind 4 major, `@lhci/cli`
downgrade from 0.15.1 to 0.12.0.

- `extract-zip` came only via `lighthouse@12.6.1` → `puppeteer-core@24.43.1` →
  `@puppeteer/browsers@2.13.2`. 3.x drops it, so `@puppeteer/browsers` was
  overridden to exactly 3.2.5 (the release `puppeteer-core@25` uses). All 13
  symbols `puppeteer-core` 24 reads are still exported; 3.x needs Node 22.12 or
  later.
- **Trap: a plain `npm install` kept 2.13.2 and `npm ls` printed `invalid`.**
  Hand-deleting the lock entry corrupted the tree (reverted).
  `npm update @puppeteer/browsers` applied the override: 32 lock entries removed
  (`extract-zip`, `yauzl`, `tar-fs` stack, nested `yargs` 17), `modern-tar@0.8.6`
  added, and `"dev": true` restored on `@types/react`, `@types/react-dom`,
  `csstype`, `typescript` (marker drift already in CHANGELOG).
  `@rolldown/binding-*` unchanged, including `binding-linux-x64-gnu`.
- Verification: `npm ci` reproduced the tree, `@puppeteer/browsers@3.2.5`
  `overridden`, no `invalid`; `react`/`react-dom` 19.3.1, one `@tiptap/core`
  3.32.0; `puppeteer-core`, `lighthouse`, LHCI's `puppeteer-manager` load.
  `npx @lhci/cli autorun` (the `Lighthouse CI` job's command): 3 runs for each
  of 4 URLs, every error-level assertion passed. `npm run validate` passed,
  1,284 tests across 69 files.
- Result: `npm audit` 10 findings (5 high, 5 moderate), all `"dev": true`;
  `--omit=dev` 0. `@lhci/cli`, `@lhci/utils`, `lighthouse`, `puppeteer-core`,
  `@puppeteer/browsers`, `extract-zip` dropped out or fell to moderate.

Deployed as `863c187b` ([#625](https://github.com/researcherhojin/emelmujiro/pull/625)).
All 12 PR jobs passed, including `Lighthouse CI` on `ubuntu-24.04` and
`Security Scan` (Trivy 0 in `package-lock.json` and both Umami `pnpm` locks).
[Main run 39759739710](https://github.com/researcherhojin/emelmujiro/actions/runs/39759739710)
passed all five jobs; `/api/health/` reports `863c187b`, homepage 200.

Still open, with blockers:

- `braces` (5 high: `braces`, `chokidar`, `micromatch`, `fast-glob`,
  `tailwindcss`): Tailwind 3 needs chokidar 3 and micromatch 4, no braces
  release is outside the range. Needs the Tailwind 4 migration
  (dependabot-ignored, out of scope).
- `sprintf-js` (5 moderate: `sprintf-js`, `argparse`, `js-yaml`, `@lhci/utils`,
  `@lhci/cli`): `@lhci/utils@0.15.1` needs `js-yaml@^3` for `safeLoad`;
  `js-yaml@3` uses `argparse@1` only in its own CLI, and overriding to 2 would
  break that CLI. Needs an upstream LHCI release on `js-yaml` 4 or a fixed
  `sprintf-js`.

### Verification gaps closed (2026-10-22)

- Trivy 0.76.1 (checksum-verified binary) on `9abbdd2d`, default mode as in CI:
  0 in `backend/uv.lock`, `package-lock.json`, both Umami locks. With
  `--include-dev-deps`: `backend/uv.lock` 0, Umami runner 0, `package-lock.json`
  1 (`braces@3.0.3`, no fix; Trivy's database lacks the five `sprintf-js`-path
  entries `npm audit` reports), and **the Umami builder lock
  `docker/umami/pnpm-lock.yaml` 23** (6 high, 12 medium, 5 low in
  `undici@8.9.0`, `vite@8.0.16`, `brace-expansion@5.0.9`,
  `@modelcontextprotocol/client@2.0.0`, `@vitest/mocker@4.1.11`,
  `postcss-selector-parser@7.1.4`), all with fixed releases, all upstream
  development dependencies in the `source`/`builder` stages only. Not yet
  fixed: needs a regenerated pnpm lock, image rebuild and
  `docker/umami/verify.sh`; this machine has no Docker.
- Bundle: `vite build` of `b1acc7d6` (fresh worktree, `npm ci`) and `9abbdd2d`:
  55 byte-identical files (SHA-256); only the gitignored, generated `robots.txt`
  and `sitemap.xml` were missing from the fresh worktree. Shipped frontend code
  is unchanged.
- `@puppeteer/browsers@3.2.5` zip path: `install()` of `chrome-headless-shell`
  156.0.8078.47 extracted via system `unzip -o` (`execFile`, no shell) and the
  binary ran. The optional `yauzl` fallback validates symlink targets.
- Reachability of the 10 remaining findings: `sprintf-js` only via `argparse`,
  which `js-yaml@3` requires only in its own CLI, never run here. `braces`
  expands developer-written Tailwind globs (`frontend/tailwind.config.js`, now `.mts`), not
  external input.
- Not done: Trivy scans of the running production images (SSH export from the
  deploy host was refused by the permission policy). The image-ID table above
  (scanned earlier on 2026-10-22) remains the latest image evidence; no image
  was rebuilt.

### Umami builder lock (2026-10-22)

The 23 findings in `docker/umami/pnpm-lock.yaml` came from upstream test and
tooling paths: `undici` via `jsdom`, `vite` and `@vitest/mocker` via `vitest`,
`@modelcontextprotocol/client` from `packages/mcp`, `postcss-selector-parser`
from PostCSS plugins, `brace-expansion@5.0.9` from `minimatch@9.0.7`. Override
floors in `pnpm-workspace.yaml`: `undici` 8.10.2, `vite` 8.1.6 (lowest fixed;
`rolldown`, `@emnapi/*`, `@oxc-project/types` moved with it), `vitest` 4.1.12,
`@modelcontextprotocol/client` 2.3.0, `postcss-selector-parser` 7.1.6,
`brace-expansion` 5.0.12. Lock regenerated by the README procedure with
`pnpm@12.3.4` from the checksum-verified upstream archive.

- Trivy 0.76.1: 0 in that lock, default and `--include-dev-deps`. Runner lock
  and runtime dependencies unchanged.
- Frozen install and `pnpm build:docker` succeeded with the Dockerfile's dummy
  environment; upstream tests passed (118 files, 882 tests).
  `src/app/mcp/route.test.ts` failed before the build (`@umami/api-client`
  workspace package not yet built) and passed after.
- Output matched the previous lock's build apart from per-build random values
  (build ID, server-action encryption key): 99 client static files, 3,255
  server files, same standalone package set. None of the six patched packages
  ship in `.next/standalone`.
- Candidate on the deploy host (`35093b05`): `verify.sh` against
  `emelmujiro/postgres:15.19-security-1` on a disposable network with a tmpfs
  database (26 migrations, login, tracker, ingestion, analytics, non-root
  startup, restart persistence); Trivy 0.76.1 image scan of 185 targets, 0
  findings. Two builds of one commit gave different image IDs (`731b425f…`,
  `1207baa7…`): not bit-reproducible, so the deployed image was verified again.
- Deployed as `df86b6ff` ([#626](https://github.com/researcherhojin/emelmujiro/pull/626)).
  PR checks and [main run 39764382370](https://github.com/researcherhojin/emelmujiro/actions/runs/39764382370)
  passed; `/api/health/` reports `df86b6ff`. Umami healthy on
  `sha256:22b7ca85b621c789b141c05c1327c81819925509d50b612c1e0e5982a9385bfd`
  (passed `verify.sh` in isolation and Trivy, 0 findings); Prisma schema up to
  date.
- Docs-only deploy `7c70ffed` rebuilt the Umami tag as `sha256:8aa3e2478893…`;
  layers and creation time (`10:31:20Z`) match candidate `1207baa7…` (cache
  rebuild, different index digest), and it passed `verify.sh` and Trivy (0
  findings) again. Compose did not recreate the container: `emelmujiro-umami`
  still runs `22b7ca85…` (started `10:38:23Z`, healthy). The deploy host uses
  the containerd image store, so after the tag moves the container's previous
  image ID cannot be inspected; post-deploy checks must compare the container's
  `.Image` with the tag's `.Id`, not scan the tag alone. `emelmujiro-umami-db`
  still runs `45e3666…`, the scanned image in the deployment table.

### Follow-up: sprintf-js path removed (2026-10-22)

The earlier note that a js-yaml major override breaks LHCI's `safeLoad` holds
only for YAML configuration: `@lhci/utils/src/lighthouserc.js` calls
`yaml.safeLoad` solely for `.yml`/`.yaml` rc files; this repository uses
`frontend/lighthouserc.js`.

- **Trap: the LHCI config must stay JavaScript**
  (`.claude/rules/frontend-build.md` requires it). A temporary YAML rc failed
  with `Function yaml.safeLoad is removed in js-yaml 4`.
- Root `overrides`: `"@lhci/cli": { "js-yaml": "4.3.2" }` (the Umami recipe's
  version). js-yaml 4.3.2 keeps a CommonJS `require` entry and depends on
  `argparse@2.0.1`, which has no `sprintf-js`.
- **Trap: a plain install printed `invalid` again; `npm update js-yaml` applied
  the override.** Lockfile changed exactly three entries: `js-yaml` 3.15.2 →
  4.3.2, `argparse` 1.0.10 → 2.0.1 (license `MIT` → `Python-2.0`, development
  only), `sprintf-js` 1.0.3 removed. `esprima` stays for other consumers;
  rolldown bindings unchanged.
- Verification: `npm ci` shows `js-yaml@4.3.2 overridden`, no `invalid`; React
  and react-dom 19.3.1, `@tiptap/core` 3.32.0. `loadRcFile` reads
  `lighthouserc.js` with all 4 URLs. `npx @lhci/cli autorun`: assertions over 4
  URLs and 12 runs, warnings only, exit 0. `npm run validate` passed (69 files,
  1,284 tests).
- Result: `npm audit` 5 findings (5 high), all `braces` through Tailwind 3
  (`braces`, `chokidar`, `micromatch`, `fast-glob`, `tailwindcss`), all
  `"dev": true`; `--omit=dev` 0. `braces` has no fixed release; the owner chose
  to plan the Tailwind 4 migration separately (its intent was deleted after it
  shipped; git history keeps it).

### Closure (2026-10-22)

The last `braces` path was removed by the Tailwind 4 migration (`f1040650`). `npm audit` on `main`
reports `found 0 vulnerabilities`; `npm audit --omit=dev` reports 0.

### Follow-up: zod and body-parser (2026-10-24)

The 2026-10-24 Security Operations Watchdog failure (#660) found `npm audit` at
7 high findings, all `"dev": true`: GHSA-mrhx-c7xc-m3w5 (`zod` < 4.6.6, no lower
bound) and GHSA-27r3-jxmh-p828 (`body-parser` < 1.20.9, published 2026-10-23),
plus five reaching only `zod` (`chromium-bidi`, `puppeteer-core`, `lighthouse`,
`@lhci/utils`, `@lhci/cli`). The offered fix was again the excluded `@lhci/cli`
0.13.0 downgrade (Gotcha #6).

- `body-parser` 1.20.8 came via `@lhci/cli` → `express@4.22.3` (newest 4.x),
  whose `~1.20.5` range admits 1.20.9: `npm update body-parser`, no override.
- Root `zod` 4.6.5 (`eslint-plugin-react-hooks`, `knip`): `npm update zod` →
  4.6.7.
- `chromium-bidi@14.0.0` (pinned exactly by `puppeteer-core@24.43.1`) declares
  `zod ^3.24.1`, and no 3.x release is fixed. Narrowest change: scoped override
  `"chromium-bidi": { "zod": "4.6.7" }` (the 157.x line `puppeteer-core@25` uses
  would cross 143 major versions). It reaches zod only through
  `protocol-parser`, at runtime with `lazy`, `object`, `literal`, `string`,
  `union`, `array`, `number`, `boolean`, `null`, `enum`, `tuple`, two-argument
  `record`, `any`, `default`, `optional`, `passthrough` and `safeParse`, all
  present in zod 4. A valid `parseNavigateParams` call parses.
- **Trap: the `chromium-bidi` → `zod` 4 override turns invalid BiDi input into a
  `TypeError`.** `parseObject` reads `parseResult.error.errors`, which zod 4
  removed, so it throws `TypeError: Cannot read properties of undefined
(reading 'map')` instead of `InvalidArgumentException`. Only reached when
  Puppeteer speaks WebDriver BiDi through `BidiOverCdp`; Lighthouse uses CDP.
- Verification: `npm ci` reproduced the tree, no `invalid`, no nested
  `chromium-bidi/node_modules/zod`. `zod`, `body-parser`, `chromium-bidi`,
  `@lhci/cli` keep `"dev": true`; `@rolldown/binding-linux-x64-gnu` still
  locked. `puppeteer-core`, the `BidiMapper` module and `lighthouse` load;
  `frontend` lint and `knip` pass; `npm audit` reports
  `found 0 vulnerabilities`.
