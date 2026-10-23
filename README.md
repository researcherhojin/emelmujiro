# Emelmujiro

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![codecov](https://codecov.io/gh/researcherhojin/emelmujiro/graph/badge.svg)](https://codecov.io/gh/researcherhojin/emelmujiro)
[![License](https://img.shields.io/badge/license-AGPL%20v3-blue.svg)](LICENSE)

**[Live Site](https://emelmujiro.com)** | **[Contributing](CONTRIBUTING.md)** | **[Changelog](CHANGELOG.md)** | **[Issues](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

AI education, consulting & development — React 19 + Django 6 monorepo, self-hosted via Docker behind a Cloudflare Tunnel.

<p align="center">
  <img src=".github/assets/home-light.png" width="49%" alt="Homepage — Light mode" />
  <img src=".github/assets/home-dark.png" width="49%" alt="Homepage — Dark mode" />
</p>

## Tech Stack

**Frontend**<br/>
![React](https://img.shields.io/badge/React-19.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-8.4.0-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?logo=tailwindcss&logoColor=white)
![Tailwind Typography](https://img.shields.io/badge/Typography-0.5.20-06B6D4?logo=tailwindcss&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26.4.6-26A69A?logo=i18next&logoColor=white)
![react-i18next](https://img.shields.io/badge/React_i18next-17.0.18-26A69A?logo=i18next&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.20.0-5A29E4?logo=axios&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3.32.0-1a1a2e)
![DOMPurify](https://img.shields.io/badge/DOMPurify-3.4.17-4B32C3)

**Backend**<br/>
![Django](https://img.shields.io/badge/Django-6.1.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.18.3-A30000)
![SimpleJWT](https://img.shields.io/badge/SimpleJWT-5.5.1-000000?logo=jsonwebtokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-26.2.0-499848?logo=gunicorn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

**Testing**<br/>
![Vitest](https://img.shields.io/badge/Vitest-5.0.5-6E9F18?logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16.3.3-E33332?logo=testinglibrary&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.64.1-2EAD33?logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse_CI-Desktop-F44B21?logo=lighthouse&logoColor=white)

**Infra**<br/>
![Node](https://img.shields.io/badge/Node-24-5FA04E?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare&logoColor=white)
![Umami](https://img.shields.io/badge/Umami-Self--hosted-000000?logo=umami&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Dependabot](https://img.shields.io/badge/Dependabot-Enabled-025E8C?logo=dependabot&logoColor=white)
![Trivy](https://img.shields.io/badge/Trivy-Security_Scan-1904DA?logo=aqua&logoColor=white)

## Getting Started

**Prerequisites**: Node >= 24, Python 3.12, [uv](https://docs.astral.sh/uv/)

```bash
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro

make install                                              # npm install + uv sync --extra dev
cd backend && uv run python manage.py migrate && cd ..    # First-time DB setup
npm run dev                                               # Frontend :5173 + Backend :8000
```

**Fresh macOS machine?** `make setup-dev-machine` handles the full bootstrap (brew deps, `make install`, local `.env`, Django migrations). Re-runnable health check: `make verify-setup`.

Operational rules, architecture details, and conventions: [CLAUDE.md](CLAUDE.md).

### Useful Commands

Run from the repo root unless noted otherwise.

```bash
make test                  # All tests (frontend + backend)
make lint                  # All linters
make lint-fix              # Auto-fix lint issues
make update-test-counts    # Regenerate README test counts locally (CI auto-syncs on main)
make health                # Docker health diagnostic (containers, resources, endpoints)

# From frontend/: npm run validate (lint + type-check + coverage) and npm run test:e2e (Playwright, 5 profiles).
# Single-test, serve:build, bundle-analysis, route-check and visual-diff commands are listed once, in CLAUDE.md → Commands.
```

## Architecture

```mermaid
graph LR
    subgraph Client["Browser"]
        React["React 19 SPA\nVite + Tailwind"]
    end

    subgraph CF["Cloudflare"]
        Tunnel["Cloudflare Tunnel"]
    end

    subgraph Host["Self-hosted (Docker · 127.0.0.1 only)"]
        Nginx["nginx (alpine)\nStatic + prerendered pages"]
        Gunicorn["Gunicorn 3w 2t\nSecurity MW + file cache"]
        DRF["Django 6 + DRF"]
        DB[(SQLite\nsqlite_data volume)]
        Umami["Umami Analytics"]
        UmamiDB[(PostgreSQL 15)]
    end

    Sentry["Sentry (SaaS)\nwired, DSN unset"]
    GHA["GitHub Actions\nCI + deploy trigger"]

    React -->|emelmujiro.com| Tunnel
    React -->|api.emelmujiro.com| Tunnel
    Tunnel -->|:8080| Nginx
    Tunnel -->|:8000 API| Gunicorn
    Nginx -.->|/api - not used by the SPA| Gunicorn
    Nginx -->|/umami/api/send| Umami
    Gunicorn --> DRF
    DRF --> DB
    Umami --> UmamiDB
    React -.->|errors, when a DSN is set| Sentry
    GHA -.->|deploy webhook| Tunnel
    Tunnel -.->|auto-deploy.sh on the host: build/ + backend image, migrations applied on container start| Host

    style Tunnel fill:#F3E8FF,stroke:#7C3AED
    style Host fill:#ECFDF5,stroke:#059669
    style CF fill:#FEF3C7,stroke:#D97706
    style Sentry fill:#FEF9C3,stroke:#CA8A04
```

## Key Features

- **Bilingual (i18n)** — URL-based routing: Korean default (`/contact`), English `/en/contact`
- **Teaching History** — 46 entries across 5 years (2022–2026), org type filter (4 categories)
- **Insights (Blog)** — TipTap rich text editor, slug URLs (`/insights/:slug`), image upload, IP-based likes, nested comments, optional per-post English translation served at `/en/insights/:slug`
- **Auth** — httpOnly cookie JWT with shared-promise refresh queue, CSRF-protected cookie writes and login/refresh, and password-change token revocation
- **Testimonials** — Enterprise + 고용노동부 K-디지털 reviews, dual-row auto-scroll carousel
- **Monitoring** — Umami analytics (self-hosted, zero external scripts) + Docker health check (`make health`; a 5-minute cron appends only failures, timestamped, to `backend/logs/health-check.log`). Sentry is wired behind a lazy-loaded shim but inactive: `VITE_SENTRY_DSN` is unset in production, so `initSentry()` returns early and no DSN ships in the bundle
- **SEO** — Search Console, sitemap, hreflang (blog posts only when translated; untranslated `/en` posts canonicalize to Korean), JSON-LD structured data, SSG prerendering of 10 routes. The Insights list uses the live API at build time; failed API calls or incomplete sitemap inventories abort the build. Article detail pages render client-side.
- **Performance** — Vendor chunk splitting, Lighthouse CI assertions, < 10MB bundle budget
- **Security** — DOMPurify HTML sanitization, CI `${{ }}` injection prevention, uuid4 uploads with bounded image decoding, trusted-client-IP throttling, draft comment access controls, production CORS restrictions, HSTS on both hosts, and Docker log rotation (10 MB × 3 files per container)
- **Privacy Policy** — 13-section bilingual page compliant with Korean PIPA Article 30
- **Tests** — Vitest (1284 tests) + Django unittest (446 tests) + Node sitemap regression tests (12 tests) + Playwright E2E (5 profiles)
- **CI/CD** — GitHub Actions: lint, type-check, test, Trivy security scan, bundle size, Lighthouse, Docker builds of the images a PR changes, Codecov, auto-deploy via webhook, plus self-healing guards that redeploy on production drift, open an issue when that redeploy does not land, and alarm when a commit reaches `main` untested

## License

[GNU Affero General Public License v3.0](LICENSE)
