---
status: shipped
module: frontend
created: 2026-10-22
updated: 2026-10-23
---

# Tailwind CSS 4 replaces 3.4, removing the last development audit findings

<!-- cspell:ignore Rmoc -->

## Intent

- **Problem**: on 2026-10-22, after `docs/intents/infra/remaining-security-findings.md`,
  `npm audit` reports 5 high findings, all development-only:
  [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
  in `braces@3.0.3`, reached through `tailwindcss@3.4.19` via `chokidar@3.6.0`,
  `micromatch@4.0.8` and `fast-glob@3.3.3`. `braces` 3.0.3 is its latest
  release. Tailwind 3 needs these packages, so no override or parent update
  removes them. `npm audit` offers only `tailwindcss@4.3.3`.
- **Exposure today**: `braces` expands the glob patterns written in
  `frontend/tailwind.config.js` during the build. No external input reaches it,
  and the built CSS does not include it. The finding is therefore build-tool
  hygiene, not a runtime risk.
- **Why it is its own project**: dependabot's 3.4.19 → 4.3.3 bump (#461,
  closed 2026-08-25) failed build, E2E and tests across the board, and the major
  version is dependabot-ignored. `.claude/rules/frontend-build.md` (Tailwind
  3.x) allows lifting that ignore only when a migration is planned as a separate
  change.
- **Outcome wanted**: the frontend builds on Tailwind 4 and renders the same.
  `npm audit` reports 0, and Tailwind no longer needs the `braces` chain.

## Spec

Migration surface measured on `main` at 2026-10-22, over 74 non-test files
under `frontend/src`:

| Area              | Current (v3)                                                                                                                                                           | v4 change                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline          | `postcss.config.js` uses `tailwindcss: {}` and `autoprefixer`                                                                                                          | `@tailwindcss/postcss` or `@tailwindcss/vite`. Autoprefixer is built in.                                                                        |
| Config            | `tailwind.config.js`: `content` with test-file exclusions, `darkMode: 'class'`, `theme.extend` (colors `dark`/`primary`/status, 9 animations with keyframes)           | CSS-first `@theme`. Alternatively, `@config` keeps the JS file. Content detection is automatic, so the test-file exclusions need `@source not`. |
| Dark mode         | class strategy, 469 `dark:` usages                                                                                                                                     | `@custom-variant dark (&:where(.dark, .dark *))`                                                                                                |
| Directives        | `src/index.css`: 4 `@tailwind`, 4 `@layer`, 3 `@apply`                                                                                                                 | `@import "tailwindcss"`. `@layer components`/`utilities` become `@utility`.                                                                     |
| Plugin            | `@tailwindcss/typography` (0.5.19, `plugins: [require(...)]`), used by `prose` in `BlogDetail.tsx`, `BlogEditor.tsx` and `TipTapEditor.tsx`                            | `@plugin`, or kept through the JS config's `plugins` when `@config` is used                                                                     |
| Renamed utilities | `outline-none` 30 (14 files), `flex-shrink-*` 14 (8), bare `rounded` 21 (8), `shadow-sm` 5 (4), bare `shadow` 1, `flex-grow` 2 (2), `*-opacity-N` 3 (2), bare `blur` 1 | `outline-hidden`, `shrink-*`, `rounded-sm`, `shadow-xs`, `shadow-sm`, `grow`, opacity modifiers, `blur-sm`                                      |
| Changed defaults  | bare `border`/`border-{side}` 39 (18 files), bare `divide-x/y` 1                                                                                                       | Default border color becomes `currentColor`, unless a base layer restores gray-200                                                              |
| Browser floor     | the v3 range                                                                                                                                                           | Safari 16.4, Chrome 111, Firefox 128                                                                                                            |

Decisions (owner, 2026-10-22):

1. **Keep the JS config through `@config`.** `tailwind.config.js` keeps its
   theme, animations and typography plugin. CSS-first `@theme` is out of scope.
2. **Restore the v3 border default in a base layer.** Use the upgrade guide's
   compatibility rule for `border-color` (`var(--color-gray-200, currentColor)`),
   so no component changes for it.
3. **Accept v4's browser floor** (Safari 16.4, Chrome 111, Firefox 128). The
   build already targets `es2022` for current browsers (`vite.config.ts`).

Done when:

- `tailwindcss` is 4.x. `npm ls braces --all` is empty, or `braces` is no
  longer under `tailwindcss`. `npm audit` reports 0.
- Visual parity, measured as screenshot diffs before and after on every
  prerendered route in light and dark themes at mobile and desktop widths.
  Content is excluded, and the threshold is fixed before the comparison.
- `npm run validate`, E2E (`build:e2e`), `check:css`, Lighthouse CI and the
  bundle-size gate all pass. CSS size before and after is recorded.
- The dependabot ignore for the v4 major is lifted, and the Tailwind 3.x rule
  and AGENTS.md are updated.

Out of scope: redesigns or class cleanup beyond what v4 requires.

## Plan

1. Baseline: on the current `main`, capture screenshots of each prerendered
   route (light and dark, 390 px and 1440 px), the CSS bundle size and the
   Lighthouse scores.
2. Migrate by hand on `feature/tailwind-v4`. `npx @tailwindcss/upgrade` was not
   used, because it moves the JS config into CSS, which contradicts decision 1.
3. Decide the three open questions, then apply them, including `@source not`
   for test files, which is what the v3 `content` exclusions did.
4. Compare screenshots and fix each regression. Run the full gate set
   (validate, E2E, `check:css`, Lighthouse, bundle size).
5. Unignore the dependabot major, update the rules, ship with a CHANGELOG
   entry, then verify the deployed CSS hash and the audit count.

## Outcome

### Deployment verification (2026-10-22)

- PR #628 merged as `f1040650122c02ec5dd6fef1552ce9f9560dab4c`.
  Main CI/CD Pipeline run `39778421428` passed all five jobs.
- At `2026-10-22T12:29:46Z`, production `/api/health/` reported `healthy`
  and that exact merge commit.
- Production HTML references `/assets/index-DRRmocQB.css`. Its SHA-256 is
  `b48456aeb5052cb0a9ad207d69b569b9d28254d97dd944ebe18116a5059edee8`,
  identical to the local build's 83,276-byte CSS file.
- A fresh `npm audit --json` reports 0 vulnerabilities; `npm ls tailwindcss
braces --all` resolves Tailwind 4.3.3 and contains no `braces` package.
- The shipped change is recorded in `CHANGELOG.md` under
  `Merged since [1.0.0]`, in the `deps-dev(tailwind)` entry.
- Follow-up: the stored Dependabot 4.x ignore from #461 needed lifting. The
  `@dependabot unignore` comment and Dependabot's two replies are under
  `Deployment (2026-10-22)` below.

### Facts added after shipping (2026-10-23, read-only shim inventory)

- **Dark mode** keeps the JS config's `darkMode: 'class'` through `@config`.
  The built CSS uses `:is(.dark *)` (for example
  `.dark\:bg-dark-800:is(.dark *)`). It does not use the
  `@custom-variant dark (&:where(.dark, .dark *))` that the Spec table lists.
- **The screenshot harness now lives in `frontend/scripts/visual-diff/`.** The
  scripts used below were never tracked. `capture.mjs` and `compare.mjs`
  reimplement them (`docs/intents/frontend/visual-diff-harness.md`, deleted after it shipped;
  git history keeps it), so a later
  change to the palette or to the parity shims can be re-measured with
  `npm run visual:capture` and `npm run visual:compare`.
- **The hover pin was dropped on 2026-10-23.** `hover:` and `group-hover:`
  now follow v4's `@media (hover: hover)`, so a tap on a touch screen keeps no
  hover style. The other parity shims stay
  (`docs/intents/frontend/touch-hover-default.md`).

### Verification before merge (2026-10-22)

Method: `build:e2e` builds of `origin/main` (separate worktree, port 4181) and
this branch (port 4180), both against the same local backend. Full-page Chromium
screenshots were taken at device scale 1 with reduced motion and animations
disabled, then compared per channel with no tolerance. Two captures of the same
v3 build differ in at most 4 of 48 screenshots, by at most 0.00076% of pixels;
that is the noise floor. Computed styles and element boxes were compared
element by element to explain each difference.

- Coverage: the 10 prerendered routes, `/login` and one blog post, in light and
  dark at 390 px and 1440 px (48 screenshots). Also captured: 404, the service
  modal, the mobile menu, and the post editor (new and edit) while signed in as
  a temporary local staff user (18 screenshots).
- Result: every screenshot matches within the noise floor except these:
  - `/login`, 4 screenshots, 122 pixels or fewer each. These are anti-aliasing
    at the focused input's corners and the label. v4 composes the focus ring
    from more zero-size transparent shadow layers; the visible ring
    (`2px rgb(17,24,39)`) is identical.
  - The service modal at 1440 light: the arrow button's translucent fill
    differs by at most 1/255 over 1,185 pixels, and its position is unchanged.
  - The editor: the content below the title moves up 1.188 px. The title is an
    inline `<input>` in a `space-y-6` parent. v3 put the gap on the next block,
    which kept the line box's descender space. v4 puts it on the input itself,
    which absorbs that space. No class can reproduce the v3 layout, so this was
    accepted (admin-only page).
- Regressions found and fixed (each measured, then re-captured):
  - The default palette moved to OKLCH in v4. `v3Colors` pins the 7 families in
    use, and `v3ProseColors` pins typography's 36 `--tw-prose-*` variables,
    because the plugin imports `tailwindcss/colors` directly.
  - A base `leading-*` now beats a responsive `text-*`. Responsive `leading`
    classes were added at 5 sites (Hero ×2, BlogCard, BlogDetail, BlogListPage).
  - `space-y-6` plus a child `mt-8` collapsed to 32 px. In v3 the `mt-8` never
    applied, so it was removed (`ContactInfo`).
  - Preflight zeroes table-cell padding, the placeholder color, the button
    cursor and the border color. All four are restored in `index.css` base.
  - Cascade layers let `focus:ring-*` beat the input focus rules. Those rules
    moved to `@layer utilities`, so specificity decides again.
  - `bg-opacity-*` emits nothing. The modal backdrop and loading overlay use
    `/75`, `/80` and `/90`, with computed colors equal to v3's.
  - Renames: `outline-none` became `outline-hidden` (32) and `shadow-sm` became
    `shadow-xs` (5). Gradients became `bg-linear-to-*/srgb` (7) to keep sRGB
    interpolation. `hover:` was restored to plain `:hover` with
    `@custom-variant`.
  - Unchanged because the output was identical: bare `rounded`, `shadow` and
    `blur`, `flex-shrink-0`, `flex-grow`, `aspect-[..]`, `min-h-[..]`.
- Gates: `npm audit` reports `found 0 vulnerabilities` (was 5 high). `npm run
validate` passed (69 files, 1,284 tests, 0 lint warnings), and so did E2E on
  chromium and Mobile Chrome (140 passed, 2 skipped). `check:css` reports 699
  classes and 0 unused, the same as v3, so the test-file exclusion works.
  `check:routes`, `knip` (no new finding) and `spell` passed. Lighthouse
  assertions passed on both builds. Median scores were equal except the home
  page's performance, 0.89 on v3 and 0.88 on v4.
- Size: main CSS went from 73,450 to 83,303 bytes (gzip 11,601 to 13,783). Of
  the growth, 4,476 bytes are 71 `@property` rules, 1,925 bytes are 63 theme
  variables, and the rest is 13 `@supports` fallbacks. The build total went
  from 3,044 KB to 3,104 KB, under the 10 MB gate.
- Canonical class names (follow-up commit): Tailwind's own
  `canonicalizeCandidates` (the IntelliSense hint source) found 14 suggestions
  across 679 class tokens in `src`. Seven produce identical declarations and
  were applied at 22 sites: `flex-shrink-0` became `shrink-0`, `flex-grow`
  became `grow`, plus `aspect-16/10`, `aspect-2/1`, `after:h-px`, `z-60` and
  `hover:opacity-100!`. Main CSS went from 83,303 to 83,276 bytes. A
  same-property check on every changed class string found no ordering conflict.
  The other seven (`min-h-[280px]`, `min-h-[400px]`, `min-h-[136px]`,
  `min-w-[200px]`, `h-[2px]`, `min-w-[18px]`, `h-[18px]`) are only suggested
  with `rem: 16` and would turn fixed px into `calc(var(--spacing) * N)` rem
  values. Those scale with the reader's browser font size, so the px values
  were kept.
- `dependabot.yml` is unchanged on purpose. Any edit to it triggers every
  ecosystem (Gotcha #12). Its `tailwindcss` `semver-major` entry now holds back
  v5.

### Deployment (2026-10-22)

- Squash-merged as `f1040650` ([#628](https://github.com/researcherhojin/emelmujiro/pull/628)).
  The first PR run cancelled `Frontend Lint` (every step green, but the job
  took 6 min 24 s against its 5-minute limit) and `E2E Tests` (10-minute limit)
  on slow runners. A rerun passed in 17 s and 1 min 33 s, and the main
  pipeline for `f1040650` succeeded.
- `/api/health/` reports `f1040650`. The live `index-DRRmocQB.css` matches the
  locally verified build byte for byte (SHA-256 `b48456aeb5052cb0…`, 83,276
  bytes). `/`, `/en`, `/contact`, `/insights` and `/login` return 200, and an
  unknown path returns 404.
- `npm audit` reports `found 0 vulnerabilities` on `main`.
- Dependabot answered the `@dependabot unignore tailwindcss` comment posted
  on #461 (comment `6340762805`, 12:29:31Z) twice, though that PR is closed:
  - 12:29:34Z, `6340763765`: "OK, I will stop ignoring the tailwindcss
    dependency."
  - 12:29:35Z, `6340764056`: "Looks like this PR is closed. If the branch
    still exists, you can re-open the PR and then use `@dependabot rebase` or
    `@dependabot recreate`. …"
- Corrected 2026-10-23: this entry first said the comment was ignored and the
  4.x ignore still applied, because the poll printed only the last bot reply.
  Whether the stored ignore is gone stays unconfirmed until
  `@dependabot show tailwindcss ignore conditions` answers. No tailwindcss PR
  can settle it, since the installed 4.3.3 is also the latest stable release.
  Post `show`, not `unignore`, on the next Dependabot PR: GitHub's command
  reference says `unignore` "Closes the current pull request".
- Confirmed 2026-10-23: `@dependabot show tailwindcss ignore conditions` on #461
  (comment `6356115401`, 02:43:08Z) got the table `| tailwindcss | [] |`
  three seconds later (`6356115926`). No stored ignore is left; only
  `dependabot.yml`'s `semver-major` entry holds back v5.
