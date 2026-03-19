# Emelmujiro

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**[Live Site](https://emelmujiro.com)** | **[Issues](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

A full-stack monorepo for an AI education & consulting platform, built with React 19, Django 5, and self-hosted on a Mac Mini via Docker + Cloudflare Tunnel.

## Tech Stack

**Frontend**<br/>
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-E91E63)
![i18next](https://img.shields.io/badge/i18next-25-26A69A?logo=i18next&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-2-1a1a2e)

**Backend**<br/>
![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

**Testing**<br/>
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?logo=playwright&logoColor=white)
![MSW](https://img.shields.io/badge/MSW-2-FF6A33?logo=mockserviceworker&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16-E33332?logo=testinglibrary&logoColor=white)

**Infra**<br/>
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)
![Node](https://img.shields.io/badge/Node-24-5FA04E?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)

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
- **Blog** — Full CRUD API with TipTap rich text editor (Notion-like), image upload, likes (IP-based), nested comments
- **Auth** — httpOnly cookie JWT with automatic token refresh
- **Real-time Notifications** — WebSocket notifications with type-specific icons, per-user preferences, email delivery
- **Admin** — Django Admin for data management (blog, users, notifications, contacts)
- **Monitoring** — Sentry error tracking (user context on login/logout) + Google Analytics (blog views, dark mode, language switch events)
- **SEO** — Search Console, sitemap, hreflang, JSON-LD structured data
- **Performance** — Optimized chunk splitting (react-vendor, ui-vendor, i18n, sentry, http-vendor, tiptap), Lighthouse CI assertions
- **Auto-deploy** — GitHub Actions → webhook → Mac Mini build, parallelized PR checks with shared build artifacts
- **Testing** — 63 unit test files (~863 tests), 10 E2E spec files (Playwright), ~181 backend tests

## Roadmap

- [ ] **Publish first blog posts** — LLM, AI agents, RAG topics
- [ ] **KakaoTalk channel integration** — Kakao API SDK, channel add button, notification messaging
- [ ] **Blog admin UI** — Wire up `deleteBlogPost`, `toggleBlogPublish`, `getBlogCategories`, `deleteComment` from `api.ts` (backend endpoints ready, frontend methods defined)

## License

[Apache License 2.0](LICENSE)
