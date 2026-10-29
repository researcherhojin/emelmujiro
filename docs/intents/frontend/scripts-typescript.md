---
status: in-progress
module: frontend
created: 2026-10-29
updated: 2026-10-29
---

# Every tracked JavaScript file that a tool can load as TypeScript is TypeScript

## Intent

- **Problem**: As of `a2192526` (2026-10-29), the repo tracks 11 JavaScript files (1,066 lines) beside 187 TypeScript files.
  - Three are scripts in `frontend/scripts/`: `check-css.cjs` (132 lines), `visual-diff/capture.mjs` (187) and `visual-diff/compare.mjs` (192). No type-check covers them. `scripts/tsconfig.json` includes only top-level `*.ts`, and ESLint ignores `scripts/**`.
  - Five are tool configs: `.lintstagedrc.js`, `frontend/eslint.config.mjs`, `frontend/tailwind.config.js`, `frontend/postcss.config.js`, `frontend/lighthouserc.js`.
  - Two run in the Umami images: `docker/umami/verify.mjs` and `docker/umami/scripts/verify-deepmerge-patch.cjs`.
  - One is the deploy webhook's 2-line loader, `scripts/deploy-webhook.js`. The host's launchd agent points at it (`.private/operations.md` › Deploy webhook service).
- **Outcome wanted**: every file that can be TypeScript is TypeScript and covered by a type-check. A config whose tool cannot load TypeScript becomes plain data or folds into an existing TypeScript config.
- **Affected systems**: the 11 files; `frontend/scripts/tsconfig.json`; `frontend/tsconfig.node.json`; `frontend/package.json`; `frontend/src/index.css` (`@config`); `frontend/vite.config.ts`; `docker/umami/Dockerfile`, `.dockerignore` and `verify.sh`; the host launchd plist; the docs that name these paths.
- **Constraints**:
  - Node 24 (repo) and Node 22.23.4 (`node:22-alpine` digest in `docker/umami/Dockerfile`, resolved 2026-10-29) both strip types natively. Erasable syntax only.
  - `@lhci/cli` 0.15.1 loads `.js`/`.cjs` with `require` and `.yml`/`.yaml` with `yaml.safeLoad`. Anything else goes through `JSON.parse` (`@lhci/utils/src/lighthouserc.js`). The root `overrides` pin `js-yaml` 4.3.2, which removed `safeLoad`, so YAML fails (#627, `frontend-build.md` › Lighthouse).
  - ESLint 10.12.0 loads `eslint.config.ts` through `jiti` unless a flag is passed. `jiti` 2.7.0 is installed only transitively.
  - lint-staged 17.6.0 loads `.lintstagedrc.ts` by dynamic import.
  - Tailwind 4.x parity (`frontend-build.md` › Tailwind).
  - The webhook must keep serving deploys.
- **Open questions**: none. On 2026-10-29 the owner chose all 11 and the webhook plist switch. YAML for `lighthouserc` was chosen first, then withdrawn once the js-yaml constraint above surfaced. It stays JavaScript, the only exception. JSON was rejected because it would move the config's 20 rationale comments away from their settings.

## Spec

- **Approach**: `git mv` every rename, so history follows.

  | File                         | Becomes                                                      |
  | ---------------------------- | ------------------------------------------------------------ |
  | `check-css.cjs`              | `check-css.ts` (ESM)                                         |
  | `capture.mjs`                | `capture.ts`                                                 |
  | `compare.mjs`                | `compare.ts`                                                 |
  | `.lintstagedrc.js`           | `.lintstagedrc.mts`                                          |
  | `eslint.config.mjs`          | `eslint.config.ts`, with `jiti` declared as a dev dependency |
  | `tailwind.config.js`         | `tailwind.config.ts`                                         |
  | `postcss.config.js`          | `postcss.config.ts`                                          |
  | `lighthouserc.js`            | stays JavaScript (constraint above)                          |
  | `verify.mjs`                 | `verify.ts`, piped with `--input-type=module-typescript`     |
  | `verify-deepmerge-patch.cjs` | `verify-deepmerge-patch.cts`                                 |
  - `deploy-webhook.js` is deleted after the plist runs `deploy-webhook.ts` directly and the restarted webhook passes its checks.
  - Type-check coverage:
    - `scripts/tsconfig.json` covers `visual-diff/*.ts`.
    - `tsconfig.node.json` covers `eslint.config.ts` and `tailwind.config.ts`.
    - The root `scripts/tsconfig.json` (`check:scripts`) covers `.lintstagedrc.mts`.
    - The two Umami files are checked by the image build, which runs them.

- **Files and interfaces**: the 11 files and their replacements; `frontend/package.json` (`check:css`, `visual:*`, the `jiti` devDependency); `frontend/tsconfig.node.json`; `frontend/scripts/tsconfig.json`; `scripts/tsconfig.json`; `frontend/src/index.css`; `frontend/vite.config.ts`; `docker/umami/{Dockerfile,.dockerignore,verify.sh}`; docs (`frontend-build.md`, `ci.md`, `.private/operations.md`, CHANGELOG).
- **Out of scope**:
  - Logic changes.
  - ESLint coverage of `scripts/**`.
  - Moving the Umami build base off Node 22 (Gotcha #16).
- **Done when**:
  1. `git ls-files '*.js' '*.mjs' '*.cjs' '*.jsx'` prints only `frontend/lighthouserc.js`.
  2. `npm run type-check` (frontend) and `npm run check:scripts` (root) pass.
  3. `npm run lint` reports the same result as before. Staging a file runs lint-staged's tasks.
  4. `npm run build` produces the same CSS asset bytes as the pre-change build, and `check:css` gives the same output.
  5. `visual:compare` exits 0 and 1 as expected, and 2 on a missing argument.
  6. CI is green, including `Lighthouse CI` and `Docker Images`, which builds Umami and runs `verify.sh`.
  7. Host: after the plist switch and restart, `/health` returns 200, an unauthenticated `POST /deploy` returns 401, and the log shows `Deploy webhook listening`.
  8. End-to-end: the merge deploys through the switched webhook, and `/api/health/` reports the merge commit.

## Plan

- **Changes**:
  1. Frontend scripts.
  2. Configs: lint-staged, eslint + `jiti`, tailwind, postcss into vite.
  3. Umami files and Dockerfile.
  4. Switch the host plist and restart. Verify, then delete the shim.
  5. Docs and CHANGELOG. One PR with at most 3 commits.
- **Risks**:
  - Tailwind `@config` not loading `.ts` would show as changed CSS bytes (check 4).
  - ESLint falling back to the default config would show as changed lint output (check 3).
  - Node 22 `--input-type=module-typescript` unsupported would show as a failed `verify.sh` in CI.
  - A webhook restart failure would show as a failed health check; roll back by restoring the plist.
- **Verification**: Done-when 1–8 in order.

## Departures from the Plan

- `postcss.config.ts` replaces the planned fold into `vite.config.ts`. `vitest.config.ts` sets `css: true` and reads the PostCSS config on its own, so a fold would have changed test CSS processing.
- `.lintstagedrc.mts` replaces `.lintstagedrc.ts`. The root `package.json` has no `"type"`, so a `.ts` file is CommonJS to `tsc`, and the config uses `import.meta.dirname`.
- `@types/eslint-plugin-jsx-a11y` was tried and reverted, because it depends on a second ESLint 9 tree. `frontend/types/eslint-plugin-jsx-a11y.d.ts` declares the module instead.
- The Node 22.23.4 checks for `--input-type=module-typescript` and `.cts` run in CI `Docker Images`. Downloading a Node 22 binary locally was denied.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
