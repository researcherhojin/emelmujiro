---
status: in-progress
module: frontend
created: 2026-10-24
updated: 2026-10-24
---

# The frontend build and route scripts are type-checked on every PR

## Intent

- **Problem**: the scripts that decide what gets prerendered, listed in the sitemap and served to E2E have no type checking. `frontend/tsconfig.json` includes only `src`, and `tsconfig.node.json` includes only `vite.config.ts` and `vitest.config.ts` (measured on `167d8c04`). The four scripts below carry the route lists, sitemap entries and the SPA-fallback mirror, and an error in any of them breaks the build or SEO without a compiler error:

  | File (`frontend/scripts/`)  | Lines | Module form                                                                                                                          | Run by                                                                                |
  | --------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
  | `prerender.js`              | 417   | CommonJS                                                                                                                             | `npm run build` (every deploy)                                                        |
  | `check-route-lists.js`      | 261   | CommonJS                                                                                                                             | `npm run check:routes`, `pr-checks.yml` `Repo Checks (informational)` before `npm ci` |
  | `generate-sitemap.js`       | 225   | CommonJS, exports `staticRoutes` and is `require`d by `prerender.js`, `check-route-lists.js`, `visual-diff/capture.mjs` and its test | `npm run build`, `generate:sitemap`                                                   |
  | `e2e-server.mjs`            | 165   | ESM                                                                                                                                  | `serve:build`, Playwright `webServer`                                                 |
  | `test-generate-sitemap.cjs` | 134   | CommonJS, `node:test`                                                                                                                | `pr-checks.yml`, `main-ci-cd.yml`, `CONTRIBUTING.md`                                  |

- **Precedent in this repo**: root `scripts/` already runs TypeScript with no build step. `scripts/package.json` sets `"type": "module"`, `scripts/tsconfig.json` sets `erasableSyntaxOnly`, `allowImportingTsExtensions` and `verbatimModuleSyntax`, and `pr-checks.yml` runs it through `npm run check:scripts` → `type-check:scripts`. `scripts/deploy-webhook.js` is a 2-line `import('./deploy-webhook.ts')` stub kept for the service manager (`434f85ed`). Node v24.22.1 (local) runs `.ts` natively.
- **Measured on 2026-10-24**: in a package with no `"type"`, which is `frontend/`'s case, `node main.ts` with ESM syntax runs but prints a `MODULE_TYPELESS_PACKAGE_JSON` warning and parses the file a second time. An `.mts` file or a `package.json` with `"type": "module"` beside it runs silently. A `.ts` ES module can load a CommonJS `.js` through `createRequire`, which `check-route-lists` needs for `lighthouserc.js`. Inside a `"type": "module"` folder, a `.cjs` file and an `.mjs` file using `createRequire` can both `require()` an ES module `.ts` and read its named exports, with no warning.
- **Deploy host**: its 02:00 cron already runs `scripts/scheduled-security.ts` with plain `node` (`Makefile`, `security:scheduled`), so the host's Node runs native TypeScript today.
- **Outcome wanted**: the five files are TypeScript, run by Node with no build step, and a type error in any of them fails a PR check. The build output (`build/`, every prerendered document, `sitemap.xml`, `robots.txt`) is byte-identical before and after.
- **Affected systems**:
  - The five files above, plus `visual-diff/capture.mjs` (its `require('../generate-sitemap')`).
  - Callers: `frontend/package.json` (`build`, `serve:build`, `generate:sitemap`, `check:routes`), `pr-checks.yml` (lines 348 and 363), `main-ci-cd.yml` (line 42), `playwright.config.ts`.
  - Name references outside `frontend/scripts/` and history: 39 lines in 19 files (measured on `167d8c04`, excluding `CHANGELOG.md` and `docs/intents/`). These include `CLAUDE.md`, `AGENTS.md`, `.claude/rules/frontend-build.md`, `CONTRIBUTING.md`, `Makefile`, `auto-deploy.sh`, `setup-dev-machine.sh`, `nginx.conf` and source comments.
  - `check-route-lists.js` reads `e2e-server.mjs` **as text** to compare its `SPA_FALLBACK` regex with `nginx.conf`, so that path is data, not only an import.
- **Constraints**:
  - Build and deploy path, so the full 7 phases apply (`CLAUDE.md` › Skip rules).
  - `check:routes` must keep needing Node builtins only, with no `node_modules` (its own header comment and `frontend-build.md`). Native type stripping keeps that; a `tsx` or `ts-node` runner would break it.
  - In `pr-checks.yml` the `Check route lists agree` step sits **above** `Setup Node.js`, so it runs on the runner image's preinstalled Node, not the pinned `24`. That version is not pinned by this repo and may not strip types, so the step has to move below `Setup Node.js`. It then runs after the `npm ci` inside that action, and loses only its fail-before-setup speed.
  - `test-generate-sitemap.cjs` has 12 tests (measured 2026-10-24). They mock `globalThis.fetch` through `node:test`, not the module cache, so ESM does not affect the mocks. Its CLI test copies `generate-sitemap.js` into a temp dir with `package.json` `{}` and spawns it with `--require` of an `offline.cjs` preload. That copy needs the `.ts` name and a `"type": "module"` `package.json` beside it.
  - Erasable syntax only (no `enum`, `namespace` or parameter properties), and imports name the `.ts` extension.
  - `frontend/lighthouserc.js` stays `.js` (`gotchas` skill › #6), so `check-route-lists` keeps loading it as CommonJS.
  - `docker/umami/verify.mjs` runs on Umami's `node:22-alpine` base and is not part of this work.
  - Prerender relays API calls and waits on app signals (`frontend-build.md` › SSG prerender), so a behavior change there shows up only in the built documents, not in unit tests.
- **Open questions**:
  1. ~~Module form~~: ESM `.ts` under a `frontend/scripts/package.json` with `"type": "module"` (owner, 2026-10-24).
  2. ~~Where the type check runs~~: a third `tsc` in frontend `type-check`, so `Frontend Lint` gates it (owner, 2026-10-24).
  3. ~~PR split~~: two PRs, below (owner, 2026-10-24).

## Spec

- **Approach**: rename each file to `.ts`, convert it to ES module syntax with type annotations, and keep running it with plain `node` (native type stripping), as root `scripts/` already does. Two PRs share this intent. PR 1 is `generate-sitemap`, its test and `check-route-lists`. It is on the deploy path too, because `generate-sitemap` writes `sitemap.xml` and `robots.txt` on every build. PR 2 is `prerender` and `e2e-server`.
  - The new `"type": "module"` makes every `.js` left in `frontend/scripts/` parse as ESM, so each CommonJS file still there is renamed `.cjs` in PR 1, with its require paths updated and nothing else changed. That covers `check-css.js` (permanently) and `prerender.js` (until PR 2 converts it).
  - Rejected: a `tsx` or `ts-node` runner, because it adds a dependency and breaks `check:routes` before `npm ci`.
  - Rejected: per-file `.mts`, because it departs from the root `scripts/` precedent.
  - Rejected: JSDoc plus `checkJs`, because it types the code without making it TypeScript, and the repo already has the native-TS pattern.
  - Rejected: `.js` stubs for the old names (the `deploy-webhook.js` pattern). Every caller is in this repo and moves in the same PR. The deploy host builds through `npm run build` from the commit it checks out, so no outside caller names the files.
- **Files and interfaces**:
  - New `frontend/scripts/package.json` (`{"private": true, "type": "module"}`).
  - New `frontend/scripts/tsconfig.json`, mirroring `scripts/tsconfig.json`: `erasableSyntaxOnly`, `allowImportingTsExtensions`, `verbatimModuleSyntax`, `strict`, `noEmit`, `types: ["node"]`. It includes the converted `.ts` files only.
  - `frontend/package.json`:
    - `type-check` gains `&& tsc -p scripts/tsconfig.json`.
    - `build`, `generate:sitemap`, `check:routes` and `serve:build` point at the `.ts` names.
    - `check:css` points at `check-css.cjs`.
  - `generate-sitemap.ts` keeps its exports: `generateSitemap`, `generateRobotsTxt`, `staticRoutes`, `LANGUAGES` and `DEFAULT_LANG`. The `require.main === module` guard becomes the `isMain(import.meta.url)` comparison used in `scripts/shared/runtime.ts`, inlined. `__dirname` becomes `import.meta.dirname`. `require('../package.json')` becomes a `fs` read.
  - `check-route-lists.ts` loads `lighthouserc.js` through `createRequire`, imports `staticRoutes` from `./generate-sitemap.ts`, and reads `scripts/e2e-server.ts` as text in PR 2. In PR 1 it still reads `e2e-server.mjs`.
  - `visual-diff/capture.mjs` imports from `../generate-sitemap.ts`.
  - `check-css.js` → `check-css.cjs`, with only the name changed.
  - PR 1: `prerender.js` → `prerender.cjs`, with only `require('./generate-sitemap')` changed to `require('./generate-sitemap.ts')`. PR 2: `prerender.cjs` → `prerender.ts`.
  - `knip.config.ts`: the frontend `entry` changes from `scripts/*.{js,ts}` to `scripts/*.{ts,cjs}`.
  - Workflows: `pr-checks.yml` (`check-route-lists`, moved below `Setup Node.js` with its comment rewritten, and `test-generate-sitemap`) and `main-ci-cd.yml` (`test-generate-sitemap`). `frontend-build.md` line 35 ("before `Setup Node.js`") changes with it. Also `playwright.config.ts` comments, and its `webServer` if it names the file.
  - Name references: all 39 lines in 19 files measured above. `CHANGELOG.md` and `docs/intents/` stay as history.
- **Out of scope**:
  - `lighthouserc.js` (Gotcha #6), `docker/umami/verify.mjs` (Node 22 base), and the tool-read configs (`postcss.config.js`, `tailwind.config.js`, `eslint.config.mjs`, `.lintstagedrc.js`).
  - Converting `check-css` and `visual-diff/*.mjs`. Each gets only the rename or import line it needs.
  - ESLint on `frontend/scripts/`, which `eslint.config.mjs` ignores today.
  - Behavior changes of any kind. A bug found while typing goes to a separate issue unless the conversion cannot compile without the fix; if so, it is recorded in `Plan` as a departure.
- **Done when**:
  1. `cd frontend && npm run type-check` exits `0`. A deliberate type error put into the newest converted file (for example `const x: number = 'a'`) makes it exit non-zero, and then the error is removed.
  2. `node --test --test-reporter=tap frontend/scripts/test-generate-sitemap.ts` prints `# tests 12` and `# pass 12`, matching the `.cjs` on `167d8c04`.
  3. `node frontend/scripts/check-route-lists.ts` passes, and its stderr has no `MODULE_TYPELESS_PACKAGE_JSON` warning. The same goes for each converted script that is run.
  4. `git grep -nE "generate-sitemap\.js|prerender\.js|check-route-lists\.js|e2e-server\.mjs|test-generate-sitemap\.cjs|check-css\.js" -- ':!CHANGELOG.md' ':!docs/intents/*'` prints nothing after PR 2. After PR 1 it prints only the `e2e-server.mjs` references, and `prerender.cjs` appears where `prerender.js` did.
  5. `npm run knip` from root reports nothing new.
  6. Build output is unchanged. `main` and the branch build back-to-back, each with its own `BUILD_OUT_DIR`, and `diff -r` of the two trees is empty. Neither `generate-sitemap.js` nor `prerender.js` reads the clock (`git grep -nE "new Date|Date\.now|toISOString"` finds nothing in either on `167d8c04`), so the only legitimate difference is API data that changed between the two runs, which is then listed.
  7. PR 2 only: `npm run test:e2e -- --project=chromium --project="Mobile Chrome"` passes. Local Playwright has Chromium only, so CI's `E2E Tests` must also pass.
  8. End to end, after each merge: production `/api/health/` reports the merge commit (Gotcha #17). `curl -s https://emelmujiro.com/sitemap.xml`, `/robots.txt`, `/profile` and `/en/profile` are byte-identical to the snapshot taken before the deploy (`src` is untouched, so asset hashes do not move), unless a post was published in between, which is then named.

## Plan

<!-- Filled before the first edit. Plan mode output goes here. -->

- **Changes**, PR 1 (`feature/build-scripts-typed`), in order:
  1. Snapshot first. On `main`, `BUILD_OUT_DIR=/tmp/<scratch>/before npm run build` from `frontend/`, and save `node --test --test-reporter=tap scripts/test-generate-sitemap.cjs` (12/12).
  2. Add `frontend/scripts/package.json` and `frontend/scripts/tsconfig.json`. Append `&& tsc -p scripts/tsconfig.json` to `type-check`.
  3. `git mv check-css.js check-css.cjs` and `git mv prerender.js prerender.cjs`. In `prerender.cjs`, change only `require('./generate-sitemap')` to `require('./generate-sitemap.ts')`.
  4. `git mv generate-sitemap.js generate-sitemap.ts`, then convert it:
     - `import` replaces `require`, and `export` replaces `module.exports`.
     - `pkg.homepage` comes from a `fs` read of `../package.json`.
     - `import.meta.dirname` replaces `__dirname`.
     - The `isMain` comparison replaces `require.main === module`.
     - Add types for the route entries, the API page (`count`, `next`, `results`) and the post fields it reads.
     - Keep the load-time `SITE_URL` exit (line 18) where it is, because moving it would change behavior.
  5. `git mv test-generate-sitemap.cjs test-generate-sitemap.ts` and convert it to ESM. The CLI test copies `generate-sitemap.ts` and writes `scripts/package.json` with `"type": "module"` into the temp root. Its `offline.cjs` preload stays `--require`.
  6. `git mv check-route-lists.js check-route-lists.ts` and convert it. `createRequire` loads `lighthouserc.js`, `generate-sitemap.ts` is imported statically, and the `e2e-server.mjs` text read is unchanged.
  7. In `visual-diff/capture.mjs`, change `require('../generate-sitemap')` to `require('../generate-sitemap.ts')`.
  8. Callers:
     - `frontend/package.json`: `build` (`prerender.cjs`), `generate:sitemap`, `check:routes`, `check:css`.
     - `knip.config.ts` entry `scripts/*.{ts,cjs}`.
     - `pr-checks.yml`: move `Check route lists agree` below `Setup Node.js`, rewrite its comment, and update the `test-generate-sitemap` path.
     - `main-ci-cd.yml` line 42.
  9. Name references: every line from the 39-line census that names a PR 1 file. That includes `CLAUDE.md`, `AGENTS.md`, `frontend-build.md` (line 35's "before `Setup Node.js`" too), `CONTRIBUTING.md`, `Makefile`, `auto-deploy.sh`, `setup-dev-machine.sh` and source comments. Then the `CHANGELOG.md` entry.
- **Departures from the Plan**, PR 1:
  - `generate-sitemap.ts` compares `import.meta.url` with `pathToFileURL` of `process.argv[1]` after resolving symlinks through `fs`, not the bare `pathToFileURL(process.argv[1])` of `scripts/shared/runtime.ts`. Reason: `import.meta.url` is the resolved path and `argv[1]` is not, so under a symlinked directory (macOS `os.tmpdir()` is `/var` → `/private/var`) the plain comparison is false, `main()` never runs and the CLI exits `0`. The CLI test in `test-generate-sitemap.ts` failed with `0 !== 1` until this was added.
  - `test-generate-sitemap.ts` loads `generate-sitemap.ts` with a top-level `await import()` after setting `SITE_URL` and `API_URL`, not a static `import`. Reason: the module reads both at load, and a static import is hoisted above the assignments.
  - `frontend/scripts/tsconfig.json` includes `*.ts` (the folder's files only) rather than `**/*.ts`, because no subfolder holds a `.ts` file.
  - The three files that `prettier --check` flags (`check-css.cjs`, `prerender.cjs`, and `vite.config.ts`) were flagged on `167d8c04` too and are left unformatted, since reformatting would put unrelated hunks in a rename.
- **Changes**, PR 2 (after PR 1 is deployed and verified):
  1. `prerender.cjs` → `prerender.ts`, typed against `playwright`'s `Browser` and `Page`. `BUILD_OUT_DIR` handling and the API relay stay as they are.
  2. `e2e-server.mjs` → `e2e-server.ts`. `SPA_FALLBACK` stays a single-line `const SPA_FALLBACK = /…/;` so `check-route-lists`' text match keeps working, and that script now reads the `.ts` path.
  3. Callers: `build`, `serve:build`, the `playwright.config.ts` comments, and the remaining name references. Then the `CHANGELOG.md` entry.
- **Risks**:
  - `generate-sitemap` exiting on load when `SITE_URL` and `homepage` are both empty now happens during `import`. This is unchanged for `prerender` and `check-route-lists`, which `require` it today, but a reordered import could run it earlier. It would show as `check:routes` exiting `1` with the sitemap message. Done when #3 covers it.
  - CI's Node and the deploy host's Node must both strip types. `Setup Node.js` pins `24`, and the host already runs `scheduled-security.ts`. If the route check step were left above setup, it would fail with a syntax error on the runner's own Node.
  - A typing "fix" that silently changes output, for example `parseInt` versus `Number` on API counts. It would show in Done when #6 as a non-empty `diff -r`.
  - `require()` of an ES module `.ts` from `prerender.cjs` and `capture.mjs`. It was probed on Node v24.22.1 and works, but the build is the real check.
  - The `MODULE_TYPELESS_PACKAGE_JSON` warning comes back if the temp-dir CLI test forgets its `package.json`. Done when #3 checks stderr.
- **Verification**: the `Done when` list, run per PR. #7 applies to PR 2 only, and #8 runs after each deploy.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->

- **PR 1** (#667, `ff698f51`, 2026-10-24): production `/api/health/` reported `ff698f51` about 120 s after the merge.
  - Done when #8: `sitemap.xml` and `robots.txt` are byte-identical to the pre-deploy snapshot taken on `167d8c04`.
  - `/profile` and `/en/profile` differ in one token each, the `data-cfemail` of Cloudflare's email obfuscation. Cloudflare re-keys that token per response, and all four tokens decode to `contact@emelmujiro.com`, so a page comparison has to decode it or mask it first.
  - PR 2 is next.
