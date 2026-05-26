# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

`VERSION`, root `package.json`, and `frontend/package.json` must stay in sync on every bump.

## [Unreleased]

Accumulating since `[1.0.0]` (2026-04-16). Production at `https://emelmujiro.com` is current main; this section records what has been merged but not yet cut as a release.

### Added

- Two-device sync helpers: `.private/` rsync via `scripts/sync_private.sh`, MBP/Mac mini divergence detector via `scripts/check_machine_sync.sh` — caught a silent 16-commit production drift incident retroactively (`0f84140`)
- `npm run check:css` script for detecting CSS classes shipped in build but never referenced in `src/` (`0560f32`)
- cSpell project dictionary (`cspell.json`, 60+ entries spanning Makefile, Docker, CLAUDE.md, gitignore, codecov, env files; later expanded with proper-nouns from locales + scripts) (`bcaf16a`, `61f21e0`, `eceb64c`, `ddc8191`)
- 4 new partner logos in `LogosSection` carousel: Starbucks Korea (AX 직무 아카데미), Day1 Company (AI 교육 콘텐츠), 한국지방재정공제회 (AX 업무혁신 교육), 암뮤니티 (cancer-survivor AI program) (`a014563`)
- New teaching history entry — 암뮤니티 cancer-survivor AI training at 국립암센터 암환자사회복귀지원센터 (2026-05-12, UOS SI CORE venue) (`6385fe2`)
- 2 more teaching entries backfilled — Starbucks Korea (AX 직무 아카데미 — 바이브 코딩, `visibleAfter: 2026-05-01`) + 한국지방재정공제회 (생성형 AI 기반 업무혁신 AX 역량 강화 교육) — these got carousel logos in `a014563` but were missing from `/profile` until now. Counts: 39 → 41 entries (`a14a56c`, `7769f71`)
- CLAUDE.md `Quick Orientation` block + one-line Gotchas index (#1–#16 navigation aid) (`5e53ee1`)

### Changed

- Performance: dropped `framer-motion` (~13 KB gzip) in favor of Tailwind keyframes (`fade-up`, `dot-bounce`, `scale-pulse`) — homepage JS bundle reduced (`ee6e075`)
- Performance: restored Pretendard preload state (renderBlockingResources 0.5 → 1.0) (`cd909eb`)
- Refactored `scripts/prerender.js` and sitemap generation after audit pass (`6110ff4`)
- Tightened Task 2–5 implementations after rigor pass (`c9882de`)
- Internal notes relocated to gitignored `.private/` (local-only) (`4b2b02b`)
- CLAUDE.md `엄밀하게` verification pass: drift counts fixed (`35` → `39` teaching entries, `public(7)` → `public(11)`, `i18n keys 0-37` → `0-38`); Gotcha #6 npm audit narrative updated (`8 vulns / 4 low / 1 mod / 3 high` → `9 vulns / 3 low / 6 moderate / 0 high` — lodash/path-to-regexp patched, @lhci/cli transitives now top moderates) (`5e53ee1`)
- CLAUDE.md size 43,023 → 39,863 chars (under Claude Code's 40k performance gate); incident detail in Gotchas #13/#14/#15 + Two-device sync helpers compressed to commit-hash references (`5e53ee1`)
- CLAUDE.md/CONTRIBUTING.md/CHANGELOG.md/README.md refactored to Karpathy/gstack style — Architecture stripped to non-grep-derivable invariants, UI Conventions to principles (no copy strings or CSS snapshots), Gotchas compressed to rule + fix-cmd + commit-ref. CLAUDE.md final size 31,195 chars (-22 % vs the 40k-gate-trim baseline). Landed as PR #309 (`cdecbca`)
- `LogosSection` carousel arrangement made deterministic: 24 partners split 12/12 by `Math.ceil(N/2)` — Row 1 now exactly 10 enterprise + 2 universities (SNU at index 4, UOS at 8), Row 2 strict public ↔ education alternation (6 + 6). UOS promoted from Row 2 area so the runtime split lands on the intended boundary (was: nipa landing in Row 1 next to chaebol logos because Row 1 area had 11 items vs 13 in Row 2 area). In-file header comment now documents the even-length invariant (equal-row-count rule from UI Conventions) (`d2214ed`)
- Day1 partner description `'AI 교육 콘텐츠 협력'` → `'AI 교육 콘텐츠'` — dropped the speculative `'협력'` (cooperation) claim; the new wording describes Day1's business class, consistent with how 엘리스 / 멋쟁이사자처럼 entries describe partner activity (`621a8b7`)

### Fixed

- SEO: hreflang alternates emitted at source instead of post-prerender dedup (`c963433`)
- `codecov.yml`: `require_ci_to_pass: yes` → `true` (YAML 1.1 alias failed strict schema validation) (`19edc2d`)
- README package badges: 5 stale versions synced after 13 dependabot merges that updated `package.json` without touching badges, plus added `react-i18next` badge to close the gate gap that allowed the drift (`6409c11`)
- `react-dom` split-bump (Gotcha #8): dependabot's `react` group co-locates PRs in the review queue but does not bundle the bumps — react 19.2.5 → 19.2.6 (#301) merged alone, leaving Vitest crashing with "Incompatible React versions" on every test load (`8ab71fe`)
- `@tiptap/*` peer-pin mismatch (Gotcha #14 reload): mixed `^3.23.1` / `^3.23.4` sibling ranges after #296/#298/#300/#307 produced `[MISSING_EXPORT] cancelPositionCheck` build error because `@tiptap/react@3.23.4` peer-pins `@tiptap/core: 3.23.4` EXACTLY but override `^3.23.4` resolved to 3.23.6. Aligned all 12 `@tiptap/*` direct deps + root + frontend overrides to `^3.23.6` and added `@tiptap/core` as direct frontend dep so `import from '@tiptap/core'` resolves from `src/` (`aca14b3`, `2c41535`)
- README badge sync: 4 stale versions drifted again after the 2026-05-18 dependabot wave — React (19.2.5 → 19.2.6), React_Router_DOM (7.15.0 → 7.15.1), Axios (1.15.0 → 1.16.1), TipTap (3.23.1 → 3.23.6) — followed by Playwright (1.59.1 → 1.60.0) pre-bump for PR #303 (`b0e68e1`, `729d323`, `8c9915f`)
- `LogosSection` img overflow: `h-12 w-auto object-contain` let `imunityLogo.svg` (290×22, 13:1 aspect) render at 48×632 — far beyond the `w-40` (160 px) slot — disrupting carousel layout. Added `max-w-40` to clamp at slot boundary (`0ac9f64`); follow-up: normalized the source SVGs themselves via `viewBox` padding (Starbucks 1:1 → 3:1 canvas, Imunity 13:1 → 3:1 canvas via vertical padding) so all 24 slots now share identical 48×144 dimensions with content centered (`621a8b7`)
- `vitest.config.ts`: import `defineConfig` from `'vitest/config'` instead of `'vite'` — VS Code TS server reported `test does not exist in type UserConfigExport` despite the triple-slash directive; `vitest/config` exposes the correctly-typed `defineConfig` (UserConfig with `test` built in) and removes the need for the triple-slash hack (`f03df2d`)

### Security

- Tightened CSP: removed `data:` from `script-src`, removed `cloudflareinsights.com` references, dropped dead `msw` + `terser` deps that generated dependabot churn (`700c941`)
- urllib3 2.6.3 → 2.7.0: patched CVE-2026-44431 (information disclosure via cross-origin redirects forwarding sensitive headers) and CVE-2026-44432 (DoS from excessive HTTP response decompression); Trivy HIGH-severity gate was blocking every PR Security Scan (`a7a2cc6`)

### Dependencies

| Group           | Bumps                                                                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build chain     | vite 8.0.8 → 8.0.10, typescript 6.0.2 → 6.0.3, prettier 3.8.2 → 3.8.3, postcss 8.5.10 → 8.5.15 (#280, #306), @vitejs/plugin-react 6.0.1 → 6.0.2 (#305)                                                                                                                    |
| React           | react 19.2.5 → 19.2.6 (#301), react-dom matched in `8ab71fe`, react-router-dom 7.14.0 → 7.15.1 (#297)                                                                                                                                                                     |
| i18n            | react-i18next 17.0.2 → 17.0.7, i18next 26.0.4 → 26.0.6                                                                                                                                                                                                                    |
| Editor (TipTap) | react, starter-kit, extension-typography, extension-link, extension-task-item, extension-task-list, extension-code-block-lowlight, extension-image, extension-placeholder, extension-underline, pm, core (override): aligned to `^3.23.6` (Gotcha #14 reload — see Fixed) |
| HTTP / network  | axios 1.15.0 → 1.16.1 (#304), urllib3 2.6.3 → 2.7.0 (CVE patch, backend)                                                                                                                                                                                                  |
| Telemetry       | @sentry/react 10.48.0 → 10.54.0 (#271, #299)                                                                                                                                                                                                                              |
| Lint            | eslint 10.3.0 → 10.4.0 (#302), @typescript-eslint/parser 8.58.2 → 8.59.2, eslint-plugin-react-hooks 7.0.1 → 7.1.1, lint-staged 15.5.2 → 17.0.4 (#292)                                                                                                                     |
| Test tooling    | @playwright/test 1.59.1 → 1.60.0 (#303), vitest 4.1.4 → 4.1.5, @vitest/coverage-v8 4.1.4 → 4.1.5 (#275, #279)                                                                                                                                                             |
| CSS             | autoprefixer 10.4.27 → 10.5.0                                                                                                                                                                                                                                             |
| Types           | @types/node 25.6.0 → 25.9.1 (#289, #308), DOMPurify (#274)                                                                                                                                                                                                                |
| CI actions      | aquasecurity/trivy-action 0.35.0 → 0.36.0                                                                                                                                                                                                                                 |

### CI

- `pr-checks.yml`: README badge drift gate expanded from 7 to 14 entries (added React_i18next; tightened detection of stale frontend badges before merge) (`6409c11`)

### Documentation

- README test counts auto-corrected (Vitest 1217 → 1218 after SEOHelmet unmount test) (`d9cff66`)
- README: top-nav link to `CHANGELOG.md` (`ee9caaf`)
- CLAUDE.md: two-device sync workflow + 2026-04-16 production drift incident postmortem (`6c53ae9`)
- CLAUDE.md: Gotcha #12 — `Auto-Merge Dependabot` job auto-merges only `semver-patch`; minor/major are intentionally held for manual review (caught when 5 minor PRs sat green-but-open after CI unblock) (`f4d8f76`)
- CLAUDE.md: Gotcha #16 — Node major bump is a 3-file lockstep, not a dependabot drive-by (`bd4b7fe`)
- Journal: 2026-04-16 session consolidation + framer-motion baseline note (`f803626`, `45797c2`)
- README / CLAUDE.md / CHANGELOG.md / CONTRIBUTING.md refactored to Karpathy/gstack style — separate principles from implementation snapshots, move incident lore to commit references, tighten invariants

## [1.0.0] - 2026-04-16

First documented release. Represents the current production state deployed at https://emelmujiro.com.

### Features

- Bilingual (i18n) with URL-based routing: Korean default, `/en` prefix for English
- Teaching History page: 35 entries across 5 years (2022–2026) with 4 org-type filters (enterprise, MOEL K-Digital, public, academic)
- Insights (blog) with TipTap rich text editor, slug URLs (`/insights/:slug`), image upload, IP-based likes, nested comments
- Testimonials dual-row carousel: enterprise training + 고용노동부 K-디지털 reviews, touch pause/resume, reduced-motion slow mode
- Privacy Policy: 13-section bilingual page compliant with Korean PIPA Article 30, including Google Form collection + Google LLC delegation
- Auth via httpOnly cookie JWT with shared-promise refresh queue
- Google Form contact integration

### SEO

- Sitemap including blog posts, `SITE_URL` read from `package.json`
- hreflang alternate links deduplicated in prerendered HTML
- JSON-LD structured data (Article, Breadcrumb, Organization)
- SSG prerendering for 10 routes (5 static × ko/en) via `scripts/prerender.js`
- Canonical URL auto-computed from `location.pathname`
- Proper 404 for unknown paths instead of SPA soft-200
- `noindex` on 404 pages

### Performance

- 7-chunk vendor splitting: `react-vendor`, `ui-vendor`, `i18n`, `sentry`, `http-vendor`, `dompurify`, `tiptap`
- Sentry lazy-loaded via re-export shim — 0 bytes on homepage
- Pretendard font: static → variable (3.8 MB → 2 MB)
- Google Analytics replaced with Umami collect API
- Carousel copies 3x/5x → 2x (homepage DOM 934 → 582 nodes)
- moduLogo pixel waste 90% → 8%, nanoLogo JPEG → WebP
- Partner logos resized (ablearn 932 → 400 px, uos 407 → 256 px)
- Lighthouse CLS 0.528 → 0.000 on blog pages
- < 10 MB build budget enforced in `pr-checks.yml`

### Infrastructure

- Docker Compose deployment on Mac mini with ports bound to `127.0.0.1`
- Cloudflare Tunnel for external access (no public port exposure)
- Umami self-hosted analytics (`localhost:3001`, nginx proxy at `/umami/api/send`)
- Django backend on PostgreSQL (production) + SQLite (local dev)
- React 19 + Vite 8 frontend
- Timezone `Asia/Seoul` on both backend and frontend containers
- Two-device dev bootstrap via `scripts/setup-dev-machine.sh`
- Docker health check script with 5-minute cron monitoring

### Security

- DOMPurify HTML sanitization for all TipTap content
- CSP headers in `nginx.conf` and meta tag (`unsafe-inline` for inline scripts, no `unsafe-eval`)
- `X-Forwarded-For` no longer trusted in `get_client_ip` — direct peer IP only
- Blocked URL patterns: dotfiles, `wp-*` probes, AI credential paths (`mcp.json`, `credentials.json`, `keys.json`)
- File uploads: `uuid4` filenames, extension whitelist, MIME check, 5 MB limit
- CI `${{ }}` injection prevention (bind to `env:` first)
- Trivy filesystem scan on every PR

### CI/CD

- GitHub Actions: lint, type-check, test, Trivy, bundle size, Lighthouse, Codecov
- Auto-deploy via webhook (`scripts/deploy-webhook.js`) with `timingSafeEqual` secret verification
- Pre-commit via Husky + lint-staged
- README drift gates: package badges validated, test counts auto-corrected via `[skip ci]` commits
- Conventional commits enforced via `commit-msg` hook
- Scripts exit non-zero on failures (no more silent `FOO=$(failing_cmd)` under `set -e`)

### Monitoring

- Sentry error tracking (lazy-loaded)
- Umami analytics (self-hosted, zero external scripts)
- Daily SiteVisit cleanup cron (`make setup-cron`)
- Docker health check cron (`make setup-health-cron`)

### Testing

- Vitest (1217 tests)
- Django unittest (358 tests)
- Playwright E2E across 5 browser profiles (chromium, firefox, webkit, mobile chrome, mobile safari)
- 100 % coverage target

[Unreleased]: https://github.com/researcherhojin/emelmujiro/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/researcherhojin/emelmujiro/releases/tag/v1.0.0
