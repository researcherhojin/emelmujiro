# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

`VERSION`, root `package.json`, and `frontend/package.json` must stay in sync on every bump.

## [Unreleased]

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
