---
status: draft
module: frontend
created: 2026-10-22
updated: 2026-10-22
---

# Tailwind CSS 4 replaces 3.4, removing the last development audit findings

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

## Spec (proposed, decisions open)

Migration surface measured on `main` at 2026-10-22, over 74 non-test files
under `frontend/src`:

| Area              | Current (v3)                                                                                                                                                           | v4 change                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline          | `postcss.config.js` uses `tailwindcss: {}` and `autoprefixer`                                                                                                          | `@tailwindcss/postcss` or `@tailwindcss/vite`. Autoprefixer is built in.                                                                        |
| Config            | `tailwind.config.js`: `content` with test-file exclusions, `darkMode: 'class'`, `theme.extend` (colors `dark`/`primary`/status, 9 animations with keyframes)           | CSS-first `@theme`. Alternatively, `@config` keeps the JS file. Content detection is automatic, so the test-file exclusions need `@source not`. |
| Dark mode         | class strategy, 469 `dark:` usages                                                                                                                                     | `@custom-variant dark (&:where(.dark, .dark *))`                                                                                                |
| Directives        | `src/index.css`: 4 `@tailwind`, 4 `@layer`, 3 `@apply`                                                                                                                 | `@import "tailwindcss"`. `@layer components`/`utilities` become `@utility`.                                                                     |
| Plugin            | `@tailwindcss/typography` (0.5.19, `plugins: [require(...)]`), 0 `prose` usages in `.tsx`                                                                              | `@plugin`. First confirm the plugin is still needed (blog HTML may use `prose`).                                                                |
| Renamed utilities | `outline-none` 30 (14 files), `flex-shrink-*` 14 (8), bare `rounded` 21 (8), `shadow-sm` 5 (4), bare `shadow` 1, `flex-grow` 2 (2), `*-opacity-N` 3 (2), bare `blur` 1 | `outline-hidden`, `shrink-*`, `rounded-sm`, `shadow-xs`, `shadow-sm`, `grow`, opacity modifiers, `blur-sm`                                      |
| Changed defaults  | bare `border`/`border-{side}` 39 (18 files), bare `divide-x/y` 1                                                                                                       | Default border color becomes `currentColor`, unless a base layer restores gray-200                                                              |
| Browser floor     | the v3 range                                                                                                                                                           | Safari 16.4, Chrome 111, Firefox 128                                                                                                            |

Decisions for the owner:

1. Keep the JS config through `@config`, the smaller diff, or move to CSS-first
   `@theme`, the long-term shape.
2. Restore the v3 border default in a base layer, or convert the 39 bare
   `border` usages to explicit colors.
3. Accept v4's browser floor. The KakaoTalk WebView rule in
   `frontend-build.md` and real traffic data may decide this.

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

## Plan (proposed)

1. Baseline: on the current `main`, capture screenshots of each prerendered
   route (light and dark, 390 px and 1440 px), the CSS bundle size and the
   Lighthouse scores.
2. Run `npx @tailwindcss/upgrade` on a `feature/tailwind-v4` branch, then review
   its diff by hand against the table above. Do not accept it wholesale.
3. Decide the three open questions, then apply them, including `@source not`
   for test files, which is what the v3 `content` exclusions did.
4. Compare screenshots and fix each regression. Run the full gate set
   (validate, E2E, `check:css`, Lighthouse, bundle size).
5. Unignore the dependabot major, update the rules, ship with a CHANGELOG
   entry, then verify the deployed CSS hash and the audit count.
