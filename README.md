# 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

**[Live Site](https://researcherhojin.github.io/emelmujiro)** | **[Report Bug](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

## 프로젝트 개요

**에멜무지로**는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 기업 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 플랫폼입니다.

### 핵심 서비스

- **AI 교육 & 강의** - 기업 맞춤 AI 교육 프로그램 설계 및 운영
- **AI 컨설팅** - AI 도입 전략 수립부터 기술 자문까지
- **LLM/생성형 AI** - LLM 기반 서비스 설계 및 개발
- **Computer Vision** - 영상 처리 및 비전 AI 솔루션

## 현재 상태 (v0.9.7)

| 항목       | 상태    | 세부사항                                   |
| ---------- | ------- | ------------------------------------------ |
| **빌드**   | ✅ 정상 | Vite + esbuild 빌드                        |
| **CI/CD**  | ✅ 정상 | GitHub Actions (Node 22, Python 3.12) ~2분 |
| **테스트** | ✅ 통과 | 1383 통과, 0 스킵 (83 파일)                |
| **타입**   | ✅ 100% | TypeScript Strict Mode                     |
| **보안**   | ✅ 안전 | 취약점 0건                                 |
| **배포**   | ✅ 정상 | GitHub Pages                               |
| **백엔드** | ⚠️ Mock | 프로덕션 Mock API 사용 중                  |

## 빠른 시작

```bash
# 설치
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro
npm install

# 실행
npm run dev              # 전체 실행 (Frontend + Backend)
npm run dev:clean        # 포트 정리 후 실행

# 접속
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

### 백엔드 (별도 설치 필요)

```bash
cd backend
uv sync                  # 의존성 설치 (uv 필요)
uv run python manage.py migrate
uv run python manage.py runserver
```

## 기술 스택

**Frontend**<br/>
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-433e38?logo=react&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-E91E63)
![i18next](https://img.shields.io/badge/i18next-25-26A69A?logo=i18next&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)

**Testing**<br/>
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?logo=playwright&logoColor=white)
![MSW](https://img.shields.io/badge/MSW-2-FF6A33?logo=mockserviceworker&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing_Library-16-E33332?logo=testinglibrary&logoColor=white)

**Backend**<br/>
![Django](https://img.shields.io/badge/Django-5-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

**Infra**<br/>
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deploy-222?logo=github&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Node](https://img.shields.io/badge/Node-22-5FA04E?logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![uv](https://img.shields.io/badge/uv-Package_Manager-DE5FE9)

## 프로젝트 구조

```
emelmujiro/
├── frontend/               # React 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── store/          # Zustand 상태 관리
│   │   ├── services/       # API 서비스 (Mock + Real)
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   ├── i18n/           # 다국어 (ko/en)
│   │   ├── config/         # 환경변수 설정
│   │   └── test-utils/     # 테스트 유틸리티
│   ├── e2e/                # Playwright E2E 테스트
│   └── vitest.config.ts
├── backend/                # Django API
│   ├── api/                # REST API (단일 앱)
│   ├── config/             # Django 설정
│   └── pyproject.toml      # uv 의존성 관리
├── .github/workflows/      # CI/CD 파이프라인
├── Makefile                # 개발 편의 명령어
├── docker-compose.yml      # 프로덕션 Docker
└── docker-compose.dev.yml  # 개발 Docker
```

## 주요 기능

| 기능                | 상태            | 설명                                          |
| ------------------- | --------------- | --------------------------------------------- |
| **홈페이지**        | ✅ 완료         | Hero, 서비스 소개, 통계, CTA                  |
| **프로필**          | ✅ 완료         | CEO 경력/학력/프로젝트 포트폴리오             |
| **다크 모드**       | ✅ 완료         | 시스템 설정 연동                              |
| **다국어 (i18n)**   | ✅ 완료         | 전체 컴포넌트 i18n 전환 완료 (ko/en)          |
| **반응형**          | ✅ 완료         | 모바일/태블릿/데스크톱 최적화                 |
| **SEO**             | ✅ 완료         | React Helmet, 사이트맵, 구조화 데이터         |
| **블로그**          | 🚧 공사 중      | 백엔드 연동 전까지 공사 중 페이지 표시        |
| **문의하기**        | 🚧 공사 중      | 백엔드 연동 전까지 공사 중 (이메일 직접 문의) |
| **실시간 채팅**     | ⏸️ 1.0 이후     | WebSocket/Redis 필요, 1.0 범위에서 제외       |
| **관리자 대시보드** | 🚧 플레이스홀더 | UI + ProtectedRoute 인증 가드, API 연동 필요  |

## 주요 명령어

| 명령어                   | 설명                                 |
| ------------------------ | ------------------------------------ |
| `npm run dev`            | 개발 서버 시작                       |
| `npm run build`          | 프로덕션 빌드 (sitemap → tsc → vite) |
| `npm test`               | 테스트 실행 (watch)                  |
| `npm run test:run`       | 테스트 단일 실행                     |
| `npm run test:ci`        | CI 테스트 실행                       |
| `npm run deploy`         | GitHub Pages 배포                    |
| `npm run type-check`     | TypeScript 체크                      |
| `npm run lint:fix`       | ESLint 자동 수정                     |
| `npm run validate`       | lint + type-check + test             |
| `npm run test:coverage`  | 테스트 커버리지 리포트               |
| `npm run analyze:bundle` | 번들 크기 분석                       |

### 백엔드 명령어

| 명령어                              | 설명                        |
| ----------------------------------- | --------------------------- |
| `uv sync`                           | 의존성 설치                 |
| `uv run python manage.py runserver` | 개발 서버                   |
| `uv run python manage.py test`      | 테스트 실행                 |
| `uv run black .`                    | 코드 포맷 (line-length 120) |
| `uv run flake8 .`                   | 린트                        |
| `uv run isort .`                    | import 정렬                 |
| `uv run ruff check .`               | 빠른 린트                   |

### Makefile 단축 명령어

| 명령어            | 설명                  |
| ----------------- | --------------------- |
| `make install`    | 전체 의존성 설치      |
| `make dev-local`  | 로컬 개발 서버        |
| `make dev-docker` | Docker 개발 환경      |
| `make test`       | 프론트/백 전체 테스트 |
| `make lint`       | 프론트/백 전체 린트   |

## Roadmap → 1.0

백엔드 프로덕션 배포 + Mock API 전환이 완료되면 1.0으로 전환합니다.

- **DB**: SQLite (트래픽 규모상 충분, 별도 DB 서비스 불필요)
- **1.0 범위**: Blog + Contact + Auth + Admin Dashboard
- **1.0 이후**: 실시간 채팅 (WebSocket/Redis/Channels)

### 남은 작업

| 순서 | 작업                         | 의존성 | 상태   | 구체적 할 일                                                                                                                                                                  |
| ---- | ---------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **배포 플랫폼 선택 & 배포**  | —      | 미결정 | Django + SQLite 배포. 플랫폼 후보: Railway / Render / Fly.io (아래 비교표 참고). `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `VITE_API_URL` 설정                                 |
| 2    | **프론트엔드 Mock API 해제** | #1     | 대기   | `VITE_API_URL`을 배포된 백엔드 URL로 설정 → Mock 자동 비활성화. `api.ts` 실제 연동 검증                                                                                       |
| 3    | **공사 중 페이지 해제**      | #2     | 대기   | `App.tsx` 라우트를 원래 컴포넌트로 복원 (`BlogListPage`, `ContactPage` 등). `AppLayout`에 `ChatWidget` 제외 유지. `generate-sitemap.js`, `manifest.json`, E2E 테스트 업데이트 |
| 4    | **이메일 발송 연동**         | #1     | 대기   | Contact 폼 제출 시 알림 이메일 발송. SMTP 또는 SendGrid 연동. 현재는 DB 저장만 됨                                                                                             |
| 5    | **인증 토큰 보안 강화**      | #1     | 대기   | `api.ts`의 JWT 토큰 저장을 `localStorage` → `httpOnly` 쿠키로 이전. Django `SESSION_COOKIE_HTTPONLY=True` 설정                                                                |
| 6    | **관리자 대시보드 연동**     | #2     | 대기   | `AdminDashboard`에 실제 통계 API 연결 (방문자 수, 문의 건수, 블로그 글 수 등). 현재는 플레이스홀더 UI만 존재                                                                  |

#### 배포 플랫폼 비교 (Django + SQLite)

| 플랫폼  | 무료 티어    | SQLite 지원            | 장점                       | 단점                     |
| ------- | ------------ | ---------------------- | -------------------------- | ------------------------ |
| Railway | $5 크레딧/월 | Persistent Volume      | 가장 간편한 배포           | 무료 크레딧 소진 가능    |
| Render  | 750시간/월   | Persistent Disk (유료) | GitHub 자동 배포           | 무료 인스턴스 15분 sleep |
| Fly.io  | 256MB VM     | Persistent Volume      | 글로벌 엣지, 커스텀 도메인 | 설정 다소 복잡           |

> **참고**: SQLite는 파일 기반 DB이므로 배포 시 Persistent Volume/Disk가 필요합니다. 컨테이너 재시작 시 데이터 유실을 방지하기 위해 반드시 영구 스토리지에 `db.sqlite3`를 마운트해야 합니다.

### 완료된 항목

- [x] Django 보안 설정 — SECRET_KEY 프로덕션 강제, ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS
- [x] 파일 업로드 보안 — 확장자/MIME/크기 검증 (`api/validators.py`)
- [x] Mock API 전환 로직 — `VITE_API_URL` 기반 자동 전환
- [x] Android/갤럭시 호환성 — viewport, CSS 접두사, 카카오톡 인앱 리다이렉트
- [x] 에러 리포팅 — Sentry 연동 (기본 비활성)
- [x] Lighthouse 90점+ — Performance 0.9 달성
- [x] PWA 제거 — 서비스 워커 캐시 이슈로 전체 제거, 데드 코드 정리
- [x] 환경변수 정리 — dead code 삭제, `global.d.ts` 정리
- [x] CI/CD 안정화 — `upload-artifact@v7`, Docker Redis 옵셔널화

## 변경 이력

### 0.9.7 (2026.03.04)

- **Android(갤럭시) 호환성 개선**
  - Viewport: `viewport-fit=cover`, `100dvh` 동적 뷰포트 단위 적용
  - CSS: `-webkit-text-size-adjust`, `-webkit-backface-visibility` 접두사 추가
  - `prefers-reduced-motion` 미디어 쿼리 추가 (저사양 기기 성능 개선)
  - CSP `connect-src`에 `cdn.jsdelivr.net` 추가, 무효 `frame-ancestors` 제거
  - 카카오톡 인앱 브라우저 → 외부 브라우저 리다이렉트
- **PWA 제거**: 서비스 워커 캐시 이슈로 PWA 전체 제거 (vite-plugin-pwa, SW, 오프라인 지원)
- **README 리팩토링**: 기술 스택 테이블 형식 전환, CONTRIBUTING.md 최신화
- **버전 동기화**: root/frontend package.json 버전 통일 (0.9.7)

### 0.9.6 (2026.03.04)

- ProfilePage UX 리팩토링, Hero CTA mailto 전환, break-keep 적용

### 0.9.5 (2026.03.03)

- Django 보안 강화, 파일 업로드 검증, Mock API 자동 전환, Docker Redis 옵셔널화

### 0.9.0 ~ 0.9.4 (2026.02.28 ~ 03.02)

- i18n 전체 전환, P0 보안 수정, 접근성 개선, dead code 정리, 테스트 확장 (1718 → 1531)
- Blog/Contact/Chat 공사 중 전환, Admin ProtectedRoute, Pre-commit 훅

### 0.8.0 이전 (2025.09 ~ 2026.02)

- Jest → Vitest, Tailwind 3.x 전환, CI/CD 구축, 번들 52% 감소, Node 22 + Python 3.12

## 라이선스

Apache License 2.0 — 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro](https://researcherhojin.github.io/emelmujiro)
