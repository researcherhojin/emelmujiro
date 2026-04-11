# Emelmujiro

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![codecov](https://codecov.io/gh/researcherhojin/emelmujiro/graph/badge.svg)](https://codecov.io/gh/researcherhojin/emelmujiro)
[![License](https://img.shields.io/badge/license-AGPL%20v3-blue.svg)](LICENSE)

**[Live Site](https://emelmujiro.com)** | **[Contributing](CONTRIBUTING.md)** | **[Issues](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

AI education, consulting & development — React 19 + Django 6 monorepo, self-hosted on Mac Mini via Docker + Cloudflare Tunnel.

<p align="center">
  <img src=".github/assets/home-light.png" width="49%" alt="Homepage — Light mode" />
  <img src=".github/assets/home-dark.png" width="49%" alt="Homepage — Dark mode" />
</p>

## Tech Stack

**Frontend**<br/>
![React](https://img.shields.io/badge/React-19.2.5-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.8-646CFF?logo=vite&logoColor=white)
![React Router DOM](https://img.shields.io/badge/React_Router_DOM-7.14.0-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-06B6D4?logo=tailwindcss&logoColor=white)
![Tailwind Typography](https://img.shields.io/badge/Typography-0.5.19-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.38.0-E91E63?logo=framer&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26.0.4-26A69A?logo=i18next&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.15.0-5A29E4?logo=axios&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3.22.3-1a1a2e)
![DOMPurify](https://img.shields.io/badge/DOMPurify-3.3.3-4B32C3)

**Backend**<br/>
![Django](https://img.shields.io/badge/Django-6.0.4-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17.1-A30000)
![SimpleJWT](https://img.shields.io/badge/SimpleJWT-5.5.1-000000?logo=jsonwebtokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-25.3.0-499848?logo=gunicorn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

**Testing**<br/>
![Vitest](https://img.shields.io/badge/Vitest-4.1.2-6E9F18?logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16.3.2-E33332?logo=testinglibrary&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.59.1-2EAD33?logo=playwright&logoColor=white)
![Lighthouse](https://img.shields.io/badge/Lighthouse_CI-Desktop-F44B21?logo=lighthouse&logoColor=white)

**Infra**<br/>
![Node](https://img.shields.io/badge/Node-24-5FA04E?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare&logoColor=white)

## Getting Started

**Prerequisites**: Node >= 24, Python 3.12, [uv](https://docs.astral.sh/uv/)

```bash
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro

# Install all dependencies
make install

# Backend first-time setup
cd backend && uv run python manage.py migrate && cd ..

# Start both servers (Frontend :5173 + Backend :8000)
npm run dev
```

### Useful Commands

Run from the repo root unless noted otherwise.

```bash
make test                  # All tests (frontend + backend)
make lint                  # All linters
make lint-fix              # Auto-fix lint issues
make update-test-counts    # Refresh README test-count badges from real runner output

# From frontend/
cd frontend
npm run validate           # lint + type-check + test:coverage
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx
npm run test:e2e           # Playwright headless (5 profiles)
npm run test:e2e:ui        # Playwright interactive UI
npm run test:e2e:debug     # Playwright debug mode

# Docker dev (optional PostgreSQL profile)
docker compose -f docker-compose.dev.yml --profile postgres up
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

    subgraph MacMini["Mac Mini (Docker · 127.0.0.1 only)"]
        Nginx["nginx:alpine\nStatic + Rate Limit"]
        Gunicorn["Gunicorn 3w 2t\nSecurity MW"]
        DRF["Django 6 + DRF"]
        DB[(SQLite)]
    end

    subgraph Monitoring["Monitoring"]
        Sentry["Sentry"]
        GA["Google Analytics"]
    end

    React -->|emelmujiro.com| Tunnel
    Tunnel -->|:8080| Nginx
    Nginx -->|/api proxy| Gunicorn
    Gunicorn --> DRF
    DRF --> DB
    React -.->|errors| Sentry
    React -.->|events| GA

    style Tunnel fill:#F3E8FF,stroke:#7C3AED
    style MacMini fill:#ECFDF5,stroke:#059669
    style CF fill:#FEF3C7,stroke:#D97706
    style Monitoring fill:#FEF9C3,stroke:#CA8A04
```

## Key Features

- **Bilingual (i18n)** — URL-based routing: Korean default (`/contact`), English `/en/contact`
- **Teaching History** — 35 entries across 5 years (2022–2026), org type filter (4 categories)
- **Insights (Blog)** — TipTap rich text editor, slug URLs (`/insights/:slug`), image upload, IP-based likes, nested comments
- **Auth** — httpOnly cookie JWT with shared-promise refresh queue (prevents concurrent 401 cascade)
- **Testimonials** — Enterprise + 고용노동부 K-디지털 reviews, dual-row auto-scroll carousel
- **Monitoring** — Sentry error tracking + Google Analytics
- **SEO** — Search Console, sitemap, hreflang, JSON-LD structured data, SSG prerendering
- **Performance** — Vendor chunk splitting, Lighthouse CI assertions, < 10MB bundle budget
- **Security** — DOMPurify HTML sanitization, CI `${{ }}` injection prevention, uuid4 uploads, rate limiting, IP blocking
- **Privacy Policy** — 13-section bilingual page compliant with Korean PIPA Article 30
- **Tests** — Vitest (1216 tests) + Django unittest (358 tests) + Playwright E2E (5 profiles)
- **CI/CD** — GitHub Actions: lint, type-check, test, Trivy security scan, bundle size, Lighthouse, Codecov, auto-deploy via webhook

## Development

Detailed operational rules, architecture, and conventions live in [CLAUDE.md](CLAUDE.md) (auto-loaded by Claude Code). This section covers the essentials.

**Conventions**: [Conventional commits](https://www.conventionalcommits.org/) required (`feat|fix|docs|style|refactor|test|chore|deps|ci`). ESLint zero warnings. All UI strings via i18n. English comments only.

**Testing**: 100% coverage target — Vitest + Django unittest + Playwright E2E. Badge versions and test counts are CI-validated against `package.json` and actual test runner output on every PR/push.

**Security**: DOMPurify on all user HTML. CI `${{ }}` bound to `env:` only. `uuid4` upload filenames. httpOnly cookie JWT.

**Key gotchas**: `DATABASE_URL=""` for backend tests. Never `npm audit fix`. `VITE_` prefix for env vars. `minimatch>=10.2.1` override — don't remove.

## License

[GNU Affero General Public License v3.0](LICENSE)
