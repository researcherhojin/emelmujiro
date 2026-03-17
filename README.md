# Emelmujiro

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**[Live Site](https://emelmujiro.com)** | **[Issues](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

A full-stack monorepo for an AI education & consulting platform, built with React 19, Django 5, and self-hosted on a Mac Mini via Docker + Cloudflare Tunnel.

## Tech Stack

**Frontend** — React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS 3.4 · Framer Motion 12 · i18next 25 · React Router 7

**Backend** — Django 5.2 · DRF 3.16 · SQLite · JWT (httpOnly cookies) · WebSocket (Channels)

**Testing** — Vitest 4 (880 tests) · Playwright E2E · MSW · Testing Library

**Infra** — GitHub Actions · Docker Compose · Nginx · Cloudflare Tunnel · Node 24 · Python 3.12

## Getting Started

```bash
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro && npm install
npm run dev              # Frontend (localhost:5173) + Backend (localhost:8000)
```

```bash
# Backend (separate setup, requires uv)
cd backend && uv sync && uv run python manage.py migrate
uv run python manage.py runserver
```

## Architecture

```mermaid
graph LR
    subgraph Client["Browser"]
        React["React 19 SPA"]
    end

    subgraph CF["Cloudflare"]
        Tunnel["Cloudflare Tunnel"]
    end

    subgraph MacMini["Mac Mini (Docker)"]
        Nginx["nginx:alpine<br/>emelmujiro.com"]
        DRF["Django 5 + DRF<br/>api.emelmujiro.com"]
        DB[(SQLite)]
    end

    React --> Tunnel
    Tunnel --> Nginx
    Tunnel --> DRF
    DRF --> DB

    style Tunnel fill:#F3E8FF,stroke:#7C3AED
    style MacMini fill:#ECFDF5,stroke:#059669
    style CF fill:#FEF3C7,stroke:#D97706
```

## Key Features

- **Bilingual (i18n)** — URL-based language routing (`/about` for Korean, `/en/about` for English)
- **SSG Prerendering** — 12 static HTML pages (6 routes × 2 languages) for SEO
- **Blog** — Django-backed blog with premium UI, Article structured data, image protection
- **Auth** — httpOnly cookie JWT with automatic token refresh
- **Monitoring** — Sentry error tracking + Google Analytics
- **SEO** — Search Console, sitemap, hreflang, JSON-LD structured data
- **Auto-deploy** — GitHub Actions → webhook → Mac Mini build

## Roadmap

- [ ] Publish first blog posts (LLM, AI agents, RAG)
- [ ] KakaoTalk channel integration

## License

[Apache License 2.0](LICENSE)
