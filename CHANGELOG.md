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
- cSpell project dictionary (`cspell.json`, 60+ entries spanning Makefile, Docker, CLAUDE.md, gitignore, codecov, env files) (`bcaf16a`, `61f21e0`)

### Changed

- Performance: dropped `framer-motion` (~13 KB gzip) in favor of Tailwind keyframes (`fade-up`, `dot-bounce`, `scale-pulse`) — homepage JS bundle reduced (`ee6e075`)
- Performance: restored Pretendard preload state (renderBlockingResources 0.5 → 1.0) (`cd909eb`)
- Refactored `scripts/prerender.js` and sitemap generation after audit pass (`6110ff4`)
- Tightened Task 2–5 implementations after rigor pass (`c9882de`)
- Internal notes relocated to gitignored `.private/` (local-only) (`4b2b02b`)

### Fixed

- SEO: hreflang alternates emitted at source instead of post-prerender dedup (`c963433`)
- `codecov.yml`: `require_ci_to_pass: yes` → `true` (YAML 1.1 alias failed strict schema validation) (`19edc2d`)
- README package badges: 5 stale versions synced after 13 dependabot merges that updated `package.json` without touching badges, plus added `react-i18next` badge to close the gate gap that allowed the drift (`6409c11`)

### Security

- Tightened CSP: removed `data:` from `script-src`, removed `cloudflareinsights.com` references, dropped dead `msw` + `terser` deps that generated dependabot churn (`700c941`)

### Dependencies

| Group           | Bumps                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build chain     | vite 8.0.8 → 8.0.9, typescript 6.0.2 → 6.0.3, prettier 3.8.2 → 3.8.3                                                                                           |
| Routing/i18n    | react-router-dom 7.14.0 → 7.14.1, react-i18next 17.0.2 → 17.0.4, i18next 26.0.4 → 26.0.6                                                                       |
| Editor (TipTap) | react, starter-kit, extension-typography, extension-task-item, extension-placeholder, extension-code-block-lowlight: 3.22.3 → 3.22.4                           |
| Telemetry       | @sentry/react 10.48.0 → 10.50.0                                                                                                                                |
| Lint/CSS        | @typescript-eslint/parser 8.58.2 → 8.59.0, @typescript-eslint/eslint-plugin (matching), eslint-plugin-react-hooks 7.0.1 → 7.1.1, autoprefixer 10.4.27 → 10.5.0 |
| CI              | aquasecurity/trivy-action 0.35.0 → 0.36.0                                                                                                                      |

### CI

- `pr-checks.yml`: README badge drift gate expanded from 7 to 14 entries (added React_i18next; tightened detection of stale frontend badges before merge) (`6409c11`)

### Documentation

- README test counts auto-corrected (Vitest 1217 → 1218 after SEOHelmet unmount test) (`d9cff66`)
- README: top-nav link to `CHANGELOG.md` (`ee9caaf`)
- CLAUDE.md: two-device sync workflow + 2026-04-16 production drift incident postmortem (`6c53ae9`)
- CLAUDE.md: Gotcha #12 — `Auto-Merge Dependabot` job auto-merges only `semver-patch`; minor/major are intentionally held for manual review (caught when 5 minor PRs sat green-but-open after CI unblock) (`f4d8f76`)
- Journal: 2026-04-16 session consolidation + framer-motion baseline note (`f803626`, `45797c2`)

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
