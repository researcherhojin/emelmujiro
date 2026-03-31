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
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.3-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7.13.2-CA4245?logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-06B6D4?logo=tailwindcss&logoColor=white)
![Tailwind Typography](https://img.shields.io/badge/Typography-0.5.19-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.38.0-E91E63?logo=framer&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-26.0.1-26A69A?logo=i18next&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.13.6-5A29E4?logo=axios&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3.21.0-1a1a2e)
![DOMPurify](https://img.shields.io/badge/DOMPurify-3.3.3-4B32C3)

**Backend**<br/>
![Django](https://img.shields.io/badge/Django-6.0.3-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17.1-A30000)
![SimpleJWT](https://img.shields.io/badge/SimpleJWT-5.5.1-000000?logo=jsonwebtokens&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-25.3.0-499848?logo=gunicorn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

**Testing**<br/>
![Vitest](https://img.shields.io/badge/Vitest-4.1.2-6E9F18?logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16.3.2-E33332?logo=testinglibrary&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.58.2-2EAD33?logo=playwright&logoColor=white)
![MSW](https://img.shields.io/badge/MSW-2.12.14-FF6A33?logo=mockserviceworker&logoColor=white)
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

# Start both servers
npm run dev                # Frontend (localhost:5173) + Backend (localhost:8000)
```

### Useful Commands

```bash
make test                  # Run all tests (frontend + backend)
make lint                  # Run all linters
make lint-fix              # Auto-fix lint issues
npm run validate           # lint + type-check + test:coverage (frontend)

# Single test (from frontend/)
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx

# E2E tests (from frontend/)
npm run test:e2e           # Headless
npm run test:e2e:ui        # Interactive UI
npm run test:e2e:debug     # Debug mode

# Docker dev with optional services
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

    subgraph MacMini["Mac Mini (Docker)"]
        Nginx["nginx:alpine\nStatic files + SPA"]
        DRF["Django 6 + DRF\nREST API"]
        DB[(SQLite)]
    end

    React -->|emelmujiro.com| Tunnel
    Tunnel -->|:8080| Nginx
    Nginx -->|/api proxy| DRF
    DRF --> DB

    style Tunnel fill:#F3E8FF,stroke:#7C3AED
    style MacMini fill:#ECFDF5,stroke:#059669
    style CF fill:#FEF3C7,stroke:#D97706
```

## Key Features

- **Bilingual (i18n)** — URL-based language routing (`/contact` for Korean, `/en/contact` for English)
- **SSG Prerendering** — Static HTML pages for SEO, parallel rendering
- **Teaching History** — 38 entries across 5 years, year-grouped with alternating backgrounds, bilingual
- **Insights (Blog)** — TipTap rich text editor, slug URLs (`/insights/:slug`), image upload, IP-based likes, nested comments. `/blog` → `/insights` nginx 301 redirect
- **Service Modals** — Clickable service cards open detail modals with full service descriptions
- **Auth** — httpOnly cookie JWT with automatic token refresh
- **Testimonials** — Enterprise + government training reviews, 5x copy infinite scroll carousel
- **Monitoring** — Sentry error tracking + Google Analytics
- **SEO** — Search Console, sitemap, hreflang, JSON-LD structured data
- **Performance** — Optimized chunk splitting (7 vendor chunks), Lighthouse CI assertions, < 10MB bundle budget
- **CI/CD** — GitHub Actions with parallel jobs: lint, tests, security scan (Trivy), bundle size, Lighthouse CI, E2E (Playwright), auto-deploy via webhook
- **Security** — DOMPurify HTML sanitization, CI script injection prevention, uuid4 file uploads, rate limiting, IP blocking
- **Testing** — Vitest (1188 unit tests) + Playwright E2E + Django unittest, 100% coverage target

## License

[GNU Affero General Public License v3.0](LICENSE)
