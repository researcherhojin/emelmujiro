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

## 현재 상태 (v0.9.8)

| 항목       | 상태    | 세부사항                                      |
| ---------- | ------- | --------------------------------------------- |
| **빌드**   | ✅ 정상 | Vite + esbuild 빌드                           |
| **CI/CD**  | ✅ 정상 | GitHub Actions (Node 22, Python 3.12) ~2분    |
| **테스트** | ✅ 통과 | Frontend 1107 통과 (69 파일), Backend 67 통과 |
| **타입**   | ✅ 100% | TypeScript Strict Mode                        |
| **보안**   | ✅ 안전 | 취약점 0건                                    |
| **배포**   | ✅ 정상 | GitHub Pages                                  |
| **백엔드** | ⚠️ Mock | 프로덕션 Mock API 사용 중                     |

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
│   │   │   ├── common/     #   공통 (Button, Footer, Navbar, UnifiedLoading, ProtectedRoute 등)
│   │   │   ├── home/       #   홈 (Hero, Services, Stats, LogosSection, CTA 등)
│   │   │   ├── blog/       #   블로그 (BlogListPage, BlogDetail, BlogEditor, BlogComments 등)
│   │   │   ├── chat/       #   채팅 (ChatWidget, ChatWindow, MessageList, AdminPanel 등)
│   │   │   └── profile/    #   프로필 (ProfilePage + 5개 서브컴포넌트)
│   │   ├── pages/          # 페이지 컴포넌트 (About, Contact, Share, Admin, NotFound)
│   │   ├── services/       # API 서비스 (Mock + Real, Axios 기반)
│   │   ├── contexts/       # React Context 5개 (UI, Auth, Blog, Form, Chat)
│   │   ├── hooks/          # Custom Hooks (useScrollAnimation, useDebounce 등)
│   │   ├── i18n/           # 다국어 (ko/en JSON)
│   │   ├── config/         # 환경변수 설정 (env.ts)
│   │   ├── constants/      # 상수 (partners, navigation)
│   │   ├── data/           # 정적 데이터 (blogPosts, services, footerData)
│   │   ├── types/          # TypeScript 타입 정의
│   │   ├── utils/          # 유틸리티 (logger, sentry, webVitals)
│   │   └── test-utils/     # 테스트 유틸리티 (renderWithProviders, MSW, 팩토리)
│   ├── e2e/                # Playwright E2E 테스트
│   └── vitest.config.ts
├── backend/                # Django API
│   ├── api/                # REST API (단일 앱: models, views, serializers, urls)
│   ├── config/             # Django 설정 (settings.py, urls.py, asgi.py)
│   └── pyproject.toml      # uv 의존성 관리
├── .github/workflows/      # CI/CD 파이프라인 (main-ci-cd.yml, pr-checks.yml)
├── Makefile                # 개발 편의 명령어
├── docker-compose.yml      # 프로덕션 Docker
└── docker-compose.dev.yml  # 개발 Docker
```

### 아키텍처 개요

- **라우팅**: `createHashRouter` (HashRouter) — GitHub Pages 호환. 모든 페이지 `React.lazy` + `Suspense`로 코드 스플리팅
- **상태 관리**: React Context 5개 (`UIContext`, `AuthContext`, `BlogContext`, `FormContext`, `ChatContext`). 모든 Provider는 `useMemo`/`useCallback`으로 불필요한 리렌더 방지
- **API**: Axios 기반 클라이언트 (`services/api.ts`). Mock/Real 자동 전환 (`VITE_API_URL` 설정 여부). JWT 401 자동 갱신. 30초 타임아웃 + 타임아웃 재시도
- **i18n**: `react-i18next` + 브라우저 언어 감지. 폴백 언어: 한국어(`ko`). 모든 UI 문자열 i18n 키 사용
- **테스트**: Vitest (단위/통합) + Playwright (E2E). `setupTests.ts`에서 브라우저 API/라이브러리 전역 모킹. `renderWithProviders`로 Provider 래핑 자동화
- **빌드**: `sitemap 생성 → TypeScript 컴파일 → Vite 빌드`. esbuild minifier 사용. 프로덕션 시 `console`/`debugger` 자동 제거
- **배포**: GitHub Actions → GitHub Pages. `base: '/emelmujiro/'` (서브패스)

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

- **도메인**: `emelmujiro.com` 확보 완료 — 백엔드 API(`api.emelmujiro.com`) 및 프론트엔드 커스텀 도메인으로 활용 예정
- **DB**: SQLite (트래픽 규모상 충분, 별도 DB 서비스 불필요)
- **1.0 범위**: Blog + Contact + Auth + Admin Dashboard
- **1.0 이후**: 실시간 채팅 (WebSocket/Redis/Channels)

### 남은 작업

> 의존성 표기: `→ #N` = N번 작업 완료 후 진행 가능

#### 1. 배포 플랫폼 선택 & 배포 `미결정`

Django + SQLite 배포. 플랫폼 후보: Railway / Render / Fly.io (아래 비교표 참고).
설정 필요: `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `VITE_API_URL`

#### 2. 프론트엔드 Mock API 해제 `대기` → #1

`VITE_API_URL`을 배포된 백엔드 URL로 설정 → Mock 자동 비활성화. `api.ts` 실제 연동 검증

#### 3. 공사 중 페이지 해제 `대기` → #2

`App.tsx` 라우트를 원래 컴포넌트로 복원 (`BlogListPage`, `ContactPage` 등).
`AppLayout`에 `ChatWidget` 제외 유지. `generate-sitemap.js`, `manifest.json`, E2E 테스트 업데이트

#### 4. 이메일 발송 연동 `대기` → #1

Contact 폼 제출 시 알림 이메일 발송. SMTP 또는 SendGrid 연동. 현재는 DB 저장만 됨

#### 5. 인증 토큰 보안 강화 `대기` → #1

`api.ts`의 JWT 토큰 저장을 `localStorage` → `httpOnly` 쿠키로 이전.
Django `SESSION_COOKIE_HTTPONLY=True` 설정

#### 6. 관리자 대시보드 연동 `대기` → #2

`AdminDashboard`에 실제 통계 API 연결 (방문자 수, 문의 건수, 블로그 글 수 등).
현재는 플레이스홀더 UI만 존재

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
- [x] 코드베이스 딥 오딧 — 고립 컴포넌트 21개 삭제, dead CSS 20개 클래스 제거, stale 환경변수 수정
- [x] 환경변수 정리 — dead code 삭제, `global.d.ts` 정리
- [x] CI/CD 안정화 — `upload-artifact@v7`, Docker Redis 옵셔널화
- [x] Zustand 전체 제거 — store(227줄) + 테스트 42개 삭제, immer/zustand 의존성 제거
- [x] 소스 코드 영어 주석 통일 — 15+ 파일 한국어 주석 → 영어 전환
- [x] i18n 완전 전환 — api.ts 에러맵, BlogEditor, 인라인 스타일/hex 색상 → Tailwind
- [x] setTimeout 메모리 누수 수정 — ChatContext reconnect 타이머 `useRef` 추적 + cleanup
- [x] 리팩토링 백로그 전량 해소 — C5~C7, H7, M5/M7~M9, BE1~BE7 (총 16건 완료, 이슈 아님 2건)

## 리팩토링 백로그

### 4차 감사 (2026.03.07)

전체 코드베이스 4차 감사 (프론트엔드 + 백엔드 심층 탐색). ~~취소선~~은 완료된 항목입니다.

#### High

| #      | 설명                                                                                                    | 파일                                         |
| ------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| ~~H1~~ | ~~비밀번호 최소 길이 불일치 — `auth.py` 8자 vs `settings.py` 12자 → 12자로 통일~~ ✅                    | ~~`auth.py`~~                                |
| ~~H2~~ | ~~`UserRateThrottle` 미사용 임포트 제거~~ ✅                                                            | ~~`views.py`~~                               |
| ~~H3~~ | ~~`get_client_ip()` 중복 — middleware에서 views.get_client_ip 위임으로 통일~~ ✅                        | ~~`views.py`, `middleware.py`~~              |
| ~~H4~~ | ~~`process.env.NODE_ENV` 직접 사용 → `env.IS_DEVELOPMENT` 전환~~ ✅                                     | ~~`WebVitalsDashboard.tsx`, `webVitals.ts`~~ |
| ~~H5~~ | ~~백엔드 테스트 14→67개 확장 — auth, blog, contact, newsletter, category, model, utility 전수 커버~~ ✅ | ~~`api/tests.py`~~                           |

#### Medium

| #      | 설명                                                                                                    | 파일                                 |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| ~~M1~~ | ~~`SharePage.tsx:87` 빈 catch 블록 — localStorage JSON.parse 폴백이므로 실질 이슈 아님~~ ✅ (이슈 아님) | ~~`SharePage.tsx`~~                  |
| ~~M2~~ | ~~`middleware.py:112` `UnicodeDecodeError` 무시 → 로깅 추가~~ ✅                                        | ~~`middleware.py`~~                  |
| M3     | `key={index}` anti-pattern 14곳 — 정적 리스트이므로 실질 이슈 아님 (이슈 아님)                          | 다수 컴포넌트                        |
| ~~M4~~ | ~~WebSocket 메시지 큐 — maxQueueSize 100 + FIFO eviction 추가~~ ✅                                      | ~~`websocket.ts`~~                   |
| ~~M5~~ | ~~`Math.random()` ID 생성 → `crypto.randomUUID()` 통일~~ ✅                                             | ~~`chatHelpers.ts`, `websocket.ts`~~ |
| ~~M6~~ | ~~Navbar/Footer 스크롤 로직 중복 → `useScrollToSection` 훅 추출~~ ✅                                    | ~~`Navbar.tsx`, `Footer.tsx`~~       |

#### Low

| #      | 설명                                                                                       | 파일                            |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------- |
| ~~L1~~ | ~~매직넘버 → `ONE_HOUR`, `ONE_DAY`, `RATE_LIMIT_PER_HOUR` 등 상수 추출~~ ✅                | ~~`views.py`, `middleware.py`~~ |
| ~~L2~~ | ~~icon-only 버튼 `aria-label` 추가 (AdminDashboard Bell 버튼)~~ ✅                         | ~~`AdminDashboard.tsx`~~        |
| ~~L3~~ | ~~`BlogPost.date` vs `created_at`/`updated_at` 3개 날짜 필드 — 용도 주석 문서화~~ ✅       | ~~`models.py`~~                 |
| ~~L4~~ | ~~Serializer 필드 중복 — camelCase/snake_case 이중 노출 의도 문서화 (프론트엔드 호환)~~ ✅ | ~~`serializers.py`~~            |

---

### 3차 감사 (2026.03.07)

전체 코드베이스 3차 감사에서 식별된 항목입니다. ~~취소선~~은 완료된 항목입니다.

#### Critical

| #      | 설명                                                                                                                             | 파일                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| ~~C1~~ | ~~미들웨어 MIDDLEWARE에 미등록 → `RequestSecurityMiddleware`, `ContentSecurityMiddleware`, `APIResponseTimeMiddleware` 등록~~ ✅ | ~~`config/settings.py`, `middleware.py`~~ |
| ~~C2~~ | ~~`security_check` 필드명 `attempted_at`/`visited_at` → `last_attempt`/`visit_time` 수정~~ ✅                                    | ~~`security_check.py`~~                   |
| ~~C3~~ | ~~`NotificationConsumer.receive()` JSON 파싱 try-except + `notification_id` 검증 추가~~ ✅                                       | ~~`consumers.py`~~                        |
| ~~C4~~ | ~~`MessageContent` `createObjectURL` → `useMemo` + `useEffect` cleanup으로 revoke~~ ✅                                           | ~~`MessageContent.tsx`~~                  |
| ~~C5~~ | ~~`MessageList` `handleImagePreview` — window unload 시 `revokeObjectURL` 추가~~ ✅                                              | ~~`MessageList.tsx`~~                     |

#### High

| #      | 설명                                                                                                    | 파일                      |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------------------- |
| ~~H1~~ | ~~예외 상세 `str(e)` 클라이언트 노출 → 로그만 남기고 일반 메시지 반환~~ ✅                              | ~~`views.py`, `auth.py`~~ |
| ~~H2~~ | ~~테스트 `category="ai_development"` → `"ai"`, `is_featured` → `featured` 수정~~ ✅                     | ~~`tests.py`~~            |
| ~~H3~~ | ~~뉴스레터 중복 구독 테스트 — serializer unique 제약으로 400 반환 확인, docstring 수정~~ ✅ (이슈 아님) | ~~`tests.py`~~            |
| ~~H4~~ | ~~`mark_notification_read` 등 `pass` 스텁 → `logger.info` + TODO 주석 추가~~ ✅                         | ~~`consumers.py`~~        |
| ~~H5~~ | ~~`BlogPost` 인덱스 추가: `(is_published, -date)`, `(category)`. 마이그레이션 생성~~ ✅                 | ~~`models.py`~~           |
| ~~H6~~ | ~~미사용 임포트 `django.db.models`, `json` 제거~~ ✅                                                    | ~~`views.py`~~            |
| ~~H7~~ | ~~`logger.ts` `process.env.NODE_ENV` → `env.IS_DEVELOPMENT` 전환 + 테스트 수정~~ ✅                     | ~~`logger.ts`~~           |
| ~~H8~~ | ~~`FormContext.tsx` 빈 catch 블록 → `logger.warn()` 추가~~ ✅                                           | ~~`FormContext.tsx`~~     |

#### Medium

| #       | 설명                                                                              | 파일                     |
| ------- | --------------------------------------------------------------------------------- | ------------------------ |
| ~~M1~~  | ~~`test-utils.tsx` 삭제 (전체 dead code), `index.ts` re-export 정리~~ ✅          | ~~`test-utils/`~~        |
| ~~M2~~  | ~~`Eye` 아이콘 — 실제 사용 중 (stats/view 버튼)~~ ✅ (이슈 아님)                  | ~~`AdminDashboard.tsx`~~ |
| ~~M3~~  | ~~스텁 함수 `logger.info` + TODO 로 교체~~ ✅                                     | ~~`AdminDashboard.tsx`~~ |
| ~~M4~~  | ~~`window.alert()` → 인라인 toast 패턴 전환 + 테스트 갱신~~ ✅                    | ~~`BlogEditor.tsx`~~     |
| ~~M5~~  | ~~`window.alert()` → toast 컴포넌트 전환 + 테스트 갱신~~ ✅                       | ~~`SharePage.tsx`~~      |
| ~~M6~~  | ~~ChatContext 분할: `chatHelpers.ts` + `useChatConnection.ts` (709→310줄)~~ ✅    | ~~`ChatContext.tsx`~~    |
| ~~M7~~  | ~~`setupTests.ts` 간소화: lucide-react 캐시 Proxy (802→581줄)~~ ✅                | ~~`setupTests.ts`~~      |
| ~~M8~~  | ~~`import.meta.env.VITE_POSTS_PER_PAGE` → `getEnvVar('POSTS_PER_PAGE')` 전환~~ ✅ | ~~`BlogContext.tsx`~~    |
| ~~M9~~  | ~~`startTransaction()` — callback 파라미터 추가, span 내부에서 실행~~ ✅          | ~~`sentry.ts`~~          |
| ~~M10~~ | ~~`flushSentry()` 삭제 + 테스트/default export 정리~~ ✅                          | ~~`sentry.ts`~~          |
| ~~M11~~ | ~~`getProjects`/`createProject`/`Project` interface 삭제 + 테스트 mock 정리~~ ✅  | ~~`api.ts`~~             |
| ~~M12~~ | ~~무의미한 `Count("id")` 어노테이션 + 미사용 `Count` 임포트 제거~~ ✅             | ~~`api/admin.py`~~       |

#### Low

| #      | 설명                                                                                              | 파일                    |
| ------ | ------------------------------------------------------------------------------------------------- | ----------------------- |
| ~~L1~~ | ~~`scrollBehavior: 'smooth'` 인라인 스타일 제거 (Tailwind `scroll-smooth` 중복)~~ ✅              | ~~`MessageList.tsx`~~   |
| L2     | AboutPage 349줄 — 섹션별 분할 후보 (현재 규모 허용 범위)                                          | `AboutPage.tsx`         |
| L3     | BlogComments 357줄 — CommentItem/ReplySection 분할 후보 (현재 규모 허용 범위)                     | `BlogComments.tsx`      |
| ~~L4~~ | ~~`notificationTimers` Map — 실제로는 remove 시 정리됨~~ ✅ (이슈 아님)                           | ~~`UIContext.tsx`~~     |
| ~~L5~~ | ~~Swagger 이메일 → `CONTACT_EMAIL` 환경변수 전환~~ ✅                                             | ~~`api/swagger.py`~~    |
| ~~L6~~ | ~~스팸 필터/rate limiting 테스트 추가 (67개 테스트로 확장). WebSocket 테스트는 1.0 이후 범위~~ ✅ | ~~Backend 테스트 전반~~ |
| L7     | E2E 4개 파일만 — 다크모드, 언어 전환 미테스트                                                     | `e2e/`                  |

---

### 1~2차 감사 (2026.03.07 이전)

이전 감사에서 식별된 항목입니다. **전량 해소 완료.**

### 즉시 수정 (Critical)

| #      | 설명                                                                                          | 파일                     |
| ------ | --------------------------------------------------------------------------------------------- | ------------------------ |
| ~~C1~~ | ~~Footer `scrollToSection`이 HashRouter에서 `window.location.pathname` 사용~~ ✅              | ~~`Footer.tsx`~~         |
| ~~C2~~ | ~~BlogEditor에서 동일한 `window.location.pathname` HashRouter 버그~~ ✅                       | ~~`BlogEditor.tsx`~~     |
| ~~C3~~ | ~~ESLint `"^9.0.0"` 이미 적용됨~~ ✅ (이슈 아님)                                              | ~~`package.json`~~       |
| ~~C4~~ | ~~AdminDashboard 동적 Tailwind 클래스 `bg-${color}-100` — 빌드 시 purge됨~~ ✅                | ~~`AdminDashboard.tsx`~~ |
| ~~C5~~ | ~~TypeScript 컴파일 에러 8건 (`useRef(null)`, FormContext.test mock, sentry.test 캐스트)~~ ✅ | ~~다수~~                 |
| ~~C6~~ | ~~FileUpload.tsx 하드코딩 한국어 폴백 11개 → i18n 키 이동~~ ✅                                | ~~`FileUpload.tsx`~~     |
| ~~C7~~ | ~~`docker-compose.yml` 환경변수 `REACT_APP_API_URL` → `VITE_API_URL` 수정~~ ✅                | ~~`docker-compose.yml`~~ |

### 높은 우선순위

| #      | 설명                                                                                                           | 파일                               |
| ------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| ~~H1~~ | ~~Zustand store 전체 미사용 — 제거 완료 (227줄 + 테스트 42개)~~                                                | ~~삭제됨~~                         |
| ~~H2~~ | ~~`types/` 정리: 중복 타입 통합, 미사용 타입 9개 제거, `api.types.ts` 삭제, `zustand`/`immer` 의존성 제거~~ ✅ | ~~`types/`~~                       |
| ~~H3~~ | ~~성능 모니터링 이중화 — `performanceMonitor.ts`(352줄) 삭제, `webVitals.ts` + `WebVitalsDashboard` 유지~~ ✅  | ~~`utils/`~~                       |
| ~~H4~~ | ~~Sentry `initSentry()` 미호출 — `main.tsx`에 초기화 호출 추가~~ ✅                                            | ~~`main.tsx`~~                     |
| ~~H5~~ | ~~소스 코드 한국어 주석 → 영어 전환 (15+ 파일)~~ ✅                                                            | ~~다수~~                           |
| ~~H6~~ | ~~`renderWithProviders` HashRouter → MemoryRouter 통일~~ ✅                                                    | ~~`test-utils/`~~                  |
| ~~H7~~ | ~~Dockerfile Python 3.14 → 3.12로 수정 (CI와 일치)~~ ✅                                                        | ~~`Dockerfile`, `Dockerfile.dev`~~ |

### 중간 우선순위

| #      | 설명                                                                                       | 파일                            |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------- |
| ~~M1~~ | ~~하드코딩 한국어 → i18n 키 이동 (api.ts 에러맵 13개 메시지 → `apiErrors.*` i18n 키)~~ ✅  | ~~`api.ts`, locale files~~      |
| ~~M2~~ | ~~인라인 스타일 `outline/boxShadow` 11곳 → Tailwind `shadow-none` 클래스 전환~~ ✅         | ~~Footer, Navbar, ProfilePage~~ |
| ~~M3~~ | ~~하드코딩 hex 색상 `#E0E7FF`/`#4F46E5` → Tailwind `bg-indigo-100 text-indigo-600`~~ ✅    | ~~BlogCard, BlogDetail~~        |
| ~~M4~~ | ~~App.tsx 무의미한 `markPerformance` 0ms 측정 제거 — H3에서 함께 처리~~ ✅                 | ~~`App.tsx`~~                   |
| ~~M5~~ | ~~`main.tsx`에서 `process.env.NODE_ENV` → `env.IS_DEVELOPMENT` 통일~~ ✅                   | ~~`main.tsx`~~                  |
| ~~M6~~ | ~~Footer 테스트 중복 ("closes modal when X button is clicked" 2회) 제거~~ ✅               | ~~`Footer.test.tsx`~~           |
| ~~M7~~ | ~~Footer 테스트에서 lucide-react 불필요 재모킹 제거 (글로벌 모킹 사용)~~ ✅                | ~~`Footer.test.tsx`~~           |
| ~~M8~~ | ~~`docker-compose.dev.yml` API URL `localhost` — 브라우저 접근이므로 정상~~ ✅ (이슈 아님) | ~~`docker-compose.dev.yml`~~    |
| ~~M9~~ | ~~BlogSearch `setTimeout` 미정리 → `useRef` 기반 타이머 추적 + cleanup~~ ✅                | ~~`BlogSearch.tsx`~~            |

### 낮은 우선순위

| #      | 설명                                                                                      | 파일                     |
| ------ | ----------------------------------------------------------------------------------------- | ------------------------ |
| ~~L1~~ | ~~`window.confirm()` → 인라인 확인 모달로 전환~~ ✅                                       | ~~`AdminDashboard.tsx`~~ |
| ~~L2~~ | ~~BlogSearch input `aria-label` 추가~~ ✅                                                 | ~~`BlogSearch.tsx`~~     |
| ~~L3~~ | ~~대형 컴포넌트 분할: AdminPanel(589→175), MessageList(458→215), BlogEditor(443→265)~~ ✅ | ~~`components/`~~        |

### Backend

| #       | 설명                                                                                       | 파일                       |
| ------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| ~~BE1~~ | ~~bare `except:` → 구체적 예외 타입 (`re.error`, `TypeError`)으로 교체~~ ✅                | ~~`api/views.py`~~         |
| ~~BE2~~ | ~~WebSocket `ChatConsumer` 인증 추가 + 메시지 타입 화이트리스트~~ ✅                       | ~~`api/consumers.py`~~     |
| ~~BE3~~ | ~~`create_blog_posts.py` 하드코딩 자격증명 → 랜덤 비밀번호 출력~~ ✅                       | ~~`create_blog_posts.py`~~ |
| ~~BE4~~ | ~~테스트 데이터 카테고리 `ai_development` → `ai`로 수정~~ ✅                               | ~~`api/tests.py`~~         |
| ~~BE5~~ | ~~미사용 의존성 `django-ratelimit` 제거~~ ✅                                               | ~~`pyproject.toml`~~       |
| ~~BE6~~ | ~~DB URL 파싱 → `urllib.parse.urlparse` (stdlib) 사용~~ ✅                                 | ~~`config/settings.py`~~   |
| ~~BE7~~ | ~~에러 응답 형식 확인 — `details`는 validation 에러에만 존재, 일관성 정상~~ ✅ (이슈 아님) | ~~`api/views.py`~~         |

## 변경 이력

### 0.9.8 (2026.03.07)

- **로고 시스템 리뉴얼**
  - 파트너사 로고 20개 최신화 및 파일명 통일 (`상호명+Logo.확장자`)
  - LogosSection 리팩토링: LogoItem/ScrollRow 서브컴포넌트 추출, 3x 복제 무한 스크롤, 그라디언트 페이드 마스크
  - 스크롤 속도 32s, Row 1(대기업 중심) / Row 2(교육/공공) 재배치
- **컴포넌트 분할**: ProfilePage (497→120줄, 5개 서브컴포넌트), ServiceModal을 Footer에서 분리
- **API 패턴 통일**: AuthContext가 axiosInstance 대신 `api` 객체 사용으로 전환
- **데드 코드 제거**: `cacheOptimization.ts`(155줄), `blogCache.ts`(231줄), ChatProvider를 App.tsx에서 제거
- **리팩토링 백로그 전량 해소** (16건 완료, 2건 이슈 아님 확인)
  - **C5**: React 19 `useRef(null)` 필수 인자 수정 (BlogInteractions, Footer, Navbar, FormContext) + FormContext.test mock 타입 수정 + sentry.test 이중 캐스트 수정
  - **C6**: FileUpload.tsx 하드코딩 한국어 폴백 16건 → i18n 키 이동 + 테스트 assertion 업데이트
  - **C7**: `docker-compose.yml` `REACT_APP_API_URL` → `VITE_API_URL` + Dockerfile에 `ARG`/`ENV` 추가
  - **H7**: Dockerfile Python 3.14 → 3.12 (CI와 일치)
  - **M5**: `main.tsx` `process.env.NODE_ENV` → `env.IS_DEVELOPMENT`/`env.IS_PRODUCTION`
  - **M7**: Footer 테스트 로컬 lucide-react 모킹 제거 → 글로벌 모킹 사용 (`data-testid="icon-{Name}"`)
  - **M9**: BlogSearch `setTimeout` → `useRef` 기반 타이머 추적 + cleanup
  - **BE1**: bare `except:` → 구체적 예외 타입 (`re.error`, `TypeError`)
  - **BE2**: ChatConsumer 인증 필수화 + 메시지 타입 화이트리스트 (`ALLOWED_MESSAGE_TYPES`)
  - **BE3**: `create_blog_posts.py` 하드코딩 자격증명 → 랜덤 비밀번호 출력
  - **BE4**: 테스트 카테고리 `ai_development` → `ai` 수정
  - **BE5**: 미사용 `django-ratelimit` 의존성 제거
  - **BE6**: DB URL 파싱 수동 regex → `urllib.parse.urlparse` (stdlib)
  - **M8, BE7**: 이슈 아님 확인 (M8: 브라우저 접근이므로 localhost 정상, BE7: details는 validation 에러에만 존재)
- **i18n 완성도 강화**: BlogEditor + FileUpload 하드코딩 한국어 → i18n 키 전환
- **코드 품질 개선**
  - 소스 코드 한국어 주석 → 영어 전환 (15+ 파일)
  - setTimeout 메모리 누수 전수 수정 (UIContext, FormContext, Navbar, Footer, BlogInteractions, BlogSearch, ChatContext)
- **CLAUDE.md 업데이트**: React 19 useRef 패턴, Docker 빌드 arg, ChatConsumer 보안, 글로벌 lucide-react mock testid 등 반영
- **도메인 확보**: `emelmujiro.com` — 백엔드 배포 시 사용 예정
- **테스트**: 69 파일, 1109 테스트, 0 실패

### 0.9.7 (2026.03.04 ~ 03.05)

- **Android(갤럭시) 호환성 개선**
  - Viewport: `viewport-fit=cover`, `100dvh` 동적 뷰포트 단위 적용
  - CSS: `-webkit-text-size-adjust`, `-webkit-backface-visibility` 접두사 추가
  - `prefers-reduced-motion` 미디어 쿼리 추가 (저사양 기기 성능 개선)
  - CSP `connect-src`에 `cdn.jsdelivr.net` 추가, 무효 `frame-ancestors` 제거
  - 카카오톡 인앱 브라우저 → 외부 브라우저 리다이렉트
- **PWA 제거**: 서비스 워커 캐시 이슈로 PWA 전체 제거 (vite-plugin-pwa, SW, 오프라인 지원)
- **코드베이스 딥 오딧** (-3,580 lines)
  - 고립된 컴포넌트 21개 삭제 (Loading, PageLoading, ScrollProgress, ScrollToTop, Section, ErrorMessage, LazyImage, SEOHead, layout/SEO, i18nFormatters, common/index)
  - index.html: CRA `%PUBLIC_URL%` → Vite 경로 수정, Zustand 테마 감지 수정, dead script 제거
  - Dead CSS 20개 클래스 + 미사용 CSS 변수 제거 (btn-primary/secondary, card, section-heading 등)
  - stale `REACT_APP_` 환경변수 참조 수정 (logger.ts, handlers.ts, api.test.ts)
  - 미사용 타입 3개 삭제 (ContactApiData, MockEvent, UnknownError)
  - 미사용 i18n 키, 고립된 locale 하위 디렉토리(16파일), stale 코멘트 제거
- **README 리팩토링**: 기술 스택 테이블 형식 전환, CONTRIBUTING.md 최신화
- **버전 동기화**: root/frontend package.json 버전 통일 (0.9.7)

### 0.9.6 (2026.03.04)

- ProfilePage UX 리팩토링, Hero CTA mailto 전환, break-keep 적용

### 0.9.5 (2026.03.03)

- Django 보안 강화, 파일 업로드 검증, Mock API 자동 전환, Docker Redis 옵셔널화

### 0.9.0 ~ 0.9.4 (2026.02.28 ~ 03.02)

- i18n 전체 전환, P0 보안 수정, 접근성 개선, dead code 정리, 테스트 확장 (1718 → 1233)
- Blog/Contact/Chat 공사 중 전환, Admin ProtectedRoute, Pre-commit 훅

### 0.8.0 이전 (2025.09 ~ 2026.02)

- Jest → Vitest, Tailwind 3.x 전환, CI/CD 구축, 번들 52% 감소, Node 22 + Python 3.12

## 라이선스

Apache License 2.0 — 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro](https://researcherhojin.github.io/emelmujiro)
