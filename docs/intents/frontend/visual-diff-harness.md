---
status: in-progress
module: frontend
created: 2026-10-23
updated: 2026-10-23
---

# Two frontend builds can be compared pixel by pixel from tracked scripts

## Intent

- **Problem**: the Tailwind 4 migration ([#628](https://github.com/researcherhojin/emelmujiro/pull/628)) was verified with full-page screenshot diffs at no tolerance (`docs/intents/frontend/tailwind-v4-migration.md`, "Verification before merge"), but the capture and diff scripts lived in a session scratchpad and were never committed.
  - `git grep` on `5ff20006` finds no copy of them, and no `getImageData` or `fullPage: true` anywhere.
  - `.claude/rules/frontend-build.md` says the parity shims must stay unless a redesign is intended, yet nobody can re-measure that a later change kept them intact.
- **Outcome wanted**: anyone can capture two `build:e2e` builds and compare them pixel by pixel at threshold 0 with tracked commands, and the noise floor is documented next to those commands.
- **Affected systems**:
  - `frontend/scripts/visual-diff/` (new)
  - `frontend/package.json` `scripts`
  - `.claude/rules/frontend-build.md`, Tailwind section
  - `CHANGELOG.md`
- **Constraints**:
  - No new npm dependency: an `npm install` on macOS can leave only the host platform's `@rolldown/binding-*` entry in the lockfile, which fails CI on Linux (Gotcha #13).
  - Routes come from `staticRoutes` in `generate-sitemap.js`; `npm run check:routes` cross-checks the four route lists that exist, so a fifth must not appear.
  - Credentials arrive through env vars only, never through a file.
  - Builds are `build:e2e` served by `serve:build` (`frontend-build.md`, E2E target; Gotcha #18).
- **Open questions**: none.

## Spec

- **Approach**: two Node scripts on the Playwright that prerender already uses.
  - `capture.mjs` screenshots a served build at device scale 1 with reduced motion, animations disabled and a hidden caret. Each shot waits for `networkidle`, `__appLoaded` and `document.fonts.ready`, then 800 ms, the settle time of the 2026-10-22 measurement.
  - `compare.mjs` decodes both PNGs in Chromium with no color-space conversion and compares `ImageData` per channel.
  - Rejected:
    - `pngjs` and `pixelmatch`: new dependencies, and installing them on macOS breaks the lockfile.
    - Porting the migration's Pillow script: it would tie a frontend check to the backend's `uv` environment.
    - Playwright's `toHaveScreenshot`: it needs committed baselines per platform and runs only inside the test runner.
    - Committed baseline images: rendering differs across machines, so both sides are always captured on one machine in one session.
    - Masking the Google Form iframe on `/contact`, the only measured noise source: it would silently drop a 1,200 px tall region, including the iframe's own `rounded-xl` and the loading overlay, which are this repo's CSS. The noise is documented instead.
- **Files and interfaces**:
  - `frontend/scripts/visual-diff/capture.mjs <outDir> <baseUrl>`
    - Routes: `staticRoutes` × `LANGUAGES` (with `DEFAULT_LANG` unprefixed), plus `/login`.
    - Themes: light and dark, through localStorage `theme` and `colorScheme`, which is how `index.html` and `UIContext` choose. Widths: 390 and 1440 px. Files: `<route>-<theme>-<width>.png`.
    - Opt-in env vars: `VISUAL_DIFF_BLOG_SLUG`; `VISUAL_DIFF_STATES=1` for the 404 page, the service modal and the mobile menu; `VISUAL_DIFF_USERNAME` with `VISUAL_DIFF_PASSWORD` for the editor, plus `VISUAL_DIFF_EDIT_ID` for the edit page.
    - Exits `1` when a shot fails (unexpected status, redirect or timeout), `2` on bad arguments or an output directory that already holds PNGs.
  - `frontend/scripts/visual-diff/compare.mjs <dirA> <dirB> [--out <diffDir>] [--max-ratio <r>]`
    - Prints one line per image, sorted by ratio: changed pixels, ratio, max channel delta and bounding box. `--out` writes a mask per changed image.
    - Exits `1` on an image above `--max-ratio`, resized, undecodable or present on one side only, `2` on bad arguments or when neither directory holds a PNG.
  - `visual:capture` and `visual:compare` in `frontend/package.json`, which also make both files knip entries.
- **Out of scope**:
  - CI integration: there is no stable baseline per runner, and the iframe noise would need a tolerance there.
  - Masking third-party iframes, a possible opt-in later.
  - Comparing Lighthouse scores or bundle sizes.
- **Done when**:
  - These pass: `node --check`; ESLint from `frontend/` with `--no-ignore` and the browser and Node runtime globals passed through `--global` (the repo config ignores `scripts/**` and declares no globals for `.mjs` files); `prettier --check`; `cspell`; `npm run knip` with no new finding; `npm run check:routes`.
  - Two captures of one `build:e2e` build compare within the documented noise floor.
  - A one-line CSS change, rebuilt and captured, is reported on the affected screenshots with exit `1`; after a revert and rebuild, the comparison is back at the noise floor.

## Plan

- **Changes**: `capture.mjs` and `compare.mjs`, then the two `package.json` scripts; then the Tailwind bullet in `frontend-build.md`, this intent, the harness bullet in `tailwind-v4-migration.md`, and the `CHANGELOG.md` entry.
- **Risks**:
  - Third-party content renders slightly differently between captures and reads as a regression at threshold 0. The rule states the measured floor and the two ways to handle it.
  - A stale PNG in a reused output directory would be compared as if it were new, so `capture.mjs` refuses such a directory.
- **Verification**:
  - Build with `npm run build:e2e` and serve it with `E2E_PORT=4180 npm run serve:build` against a local backend. Capture twice and compare.
  - Change the `index.css` placeholder color from `gray-400` to `gray-500`, rebuild, capture and compare: expect the four `login-*` screenshots and exit `1`.
  - Revert, rebuild, capture and compare against the first capture: expect only the iframe noise.

## Outcome

<!-- Filled when status becomes shipped or dropped. -->
