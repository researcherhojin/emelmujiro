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

## 현재 상태 (v0.9.6)

| 항목       | 상태    | 세부사항                                   |
| ---------- | ------- | ------------------------------------------ |
| **빌드**   | ✅ 정상 | Vite + esbuild 빌드                        |
| **CI/CD**  | ✅ 정상 | GitHub Actions (Node 22, Python 3.12) ~2분 |
| **테스트** | ✅ 통과 | 1531 통과, 0 스킵 (90 파일)                |
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

**Frontend**
![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange)
![i18next](https://img.shields.io/badge/i18next-25.5-26A69A?logo=i18next&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.34-E91E63)
![React Router](https://img.shields.io/badge/React_Router-7.8-CA4245?logo=reactrouter&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.0-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.55-2EAD33?logo=playwright&logoColor=white)

**Backend**
![Django](https://img.shields.io/badge/Django-5.2.11-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16.1-A30000)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![Redis](<https://img.shields.io/badge/Redis-7_(optional)-DC382D?logo=redis&logoColor=white>)
![Channels](https://img.shields.io/badge/Channels-4.3-092E20?logo=django&logoColor=white)

**DevOps**
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
| **PWA**             | ✅ 완료         | 오프라인 지원, 설치 가능                      |
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

**1.0 범위**: Blog + Contact + Auth + Admin Dashboard (Chat/WebSocket은 1.0 이후)

### 남은 작업

| 순서 | 작업                     | 의존성 | 상태   |
| ---- | ------------------------ | ------ | ------ |
| 1    | **배포 플랫폼 선택**     | —      | 미결정 |
| 2    | **백엔드 배포**          | #1     | 대기   |
| 3    | **공사 중 해제**         | #2     | 대기   |
| 4    | **이메일 백엔드**        | #2     | 대기   |
| 5    | **인증 토큰 보안**       | #2     | 대기   |
| 6    | **관리자 대시보드 연동** | #2     | 대기   |

- **#1 배포 플랫폼 선택** — 아래 비교표 참고, PostgreSQL + Django 배포
- **#2 백엔드 배포** — DB 마이그레이션, `select_related`/`prefetch_related`, 도메인 설정
- **#3 공사 중 해제** — Blog/Contact 라우트 복원, sitemap·manifest·E2E 업데이트
- **#4 이메일 백엔드** — Contact 알림 이메일 (SMTP/SendGrid), 현재는 DB 저장만
- **#5 인증 토큰 보안** — `api.ts` localStorage → httpOnly 쿠키 이전
- **#6 관리자 대시보드 연동** — AdminDashboard에 실제 통계 데이터 연결

#### 배포 플랫폼 비교

| 플랫폼        | 무료 티어       | PostgreSQL   | 장점                       | 단점                |
| ------------- | --------------- | ------------ | -------------------------- | ------------------- |
| Railway       | $5 크레딧/월    | 내장         | 가장 간편한 Django 배포    | 무료 사라질 수 있음 |
| Fly.io        | 256MB VM        | Fly Postgres | 글로벌 엣지, 커스텀 도메인 | 설정 다소 복잡      |
| Render        | 750시간/월      | 내장         | GitHub 자동 배포           | 무료 인스턴스 sleep |
| AWS (EC2+RDS) | 12개월 프리티어 | RDS          | 가장 유연, 프로덕션급      | 설정 복잡           |

### 완료된 항목

- [x] **Django 보안 설정** — SECRET_KEY 프로덕션 강제, ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS, Redis 분기
- [x] **파일 업로드 보안** — 확장자/MIME/크기 검증 (`api/validators.py`)
- [x] **Mock API 전환 로직** — `VITE_API_URL` 기반 자동 전환
- [x] **CI artifact 복구** — `upload-artifact@v7` (v8 미존재)
- [x] **Docker Redis 옵셔널화** — `profiles: ["chat"]`
- [x] **에러 리포팅** — Sentry 연동
- [x] **Lighthouse 90점+** — Performance 0.9 달성
- [x] **환경변수 정리** — dead code 삭제, `global.d.ts` 정리

## 변경 이력

### 0.9.6 (2026.03.04)

- **ProfilePage UX 리팩토링**: AboutPage와 동일한 디자인 패턴으로 전면 통일
  - 섹션 배경색 교차: Hero(white) → Stats+Achievements(gray-50) → Tab Nav(white) → Tab Content(gray-50)
  - 성과 하이라이트(Trophy/Medal/Building2) 3열 카드 행 추가
  - Stats 카드에 아이콘 + hover 인터랙션 추가, 모바일 반응형 개선 (text-3xl~5xl)
  - 경력/학력 타임라인을 AboutPage 여정 스타일로 통일 (period | card 레이아웃)
  - 모바일 경력 탭: 기간을 카드 위에 세로 스택 배치 (긴 날짜 범위 대응)
  - 탭 콘텐츠 제목에 섹션 라벨 추가 (CAREER / EDUCATION / PROJECTS)
  - 자격/인증 카드 스타일 통일 (border-2 + hover:border-gray-900)
- **Hero CTA 변경**: 문의하기 → 이메일 직접 문의 (mailto 링크)
- **i18n 확장**: `profilePage.sectionLabel`, `careerLabel`, `educationLabel`, `projectsLabel`, `achievements` 키 추가 (ko/en)
- **데드코드 정리**: 미사용 `AchievementsSection` 컴포넌트 + 테스트 삭제
- **break-keep 적용**: HeroSection, CTASection, ServicesSection 한국어 텍스트 줄바꿈 개선
- **테스트**: 1531개 통과 (90 파일), 0 실패, 0 스킵

### 0.9.5 (2026.03.03)

- **CI 긴급 수정**: `upload-artifact@v8` → `@v7` 복구 (v8 미존재)
- **Django 보안 강화**: SECRET_KEY 프로덕션 필수화 (`ImproperlyConfigured`), `CSRF_TRUSTED_ORIGINS` 추가, Channel Layers Redis/InMemory 분기
- **파일 업로드 보안**: `api/validators.py` 신규 — 대소문자 무관 확장자, MIME 타입, 파일 크기 검증
- **Mock API 전환 개선**: `USE_MOCK_API`가 `VITE_API_URL` 기반으로 자동 전환
- **Docker 정리**: Redis `profiles: ["chat"]`로 옵셔널화, `REDIS_URL` 환경변수 제거
- **배포 준비**: `.env.example` 통합, README 배포 플랫폼 비교표, CI `deploy-backend` 주석 placeholder
- **테스트**: 1529개 통과 (90 파일), 0 실패, 0 스킵

### 0.9.4 (2026.03.02)

- **Dead code 대규모 정리**: 22개 고아/미사용 파일 삭제 (-5,270줄), 미사용 의존성 4개 제거
- **환경변수 마이그레이션**: `REACT_APP_*` → `getEnvVar()` / `import.meta.env.VITE_*` 전환
- **중복 제거**: HelmetProvider 이중 래핑 수정, i18n 이중 초기화 제거, lint-staged 중복 설정 제거
- **백엔드 정리**: 미사용 serializer 삭제, `send-test-email` URL `DEBUG` 가드
- **README 리팩토링**: 기술 스택을 카테고리별 인라인 배지로 전환, shields.io 배지 추가
- **테스트**: 1529개 통과 (90 파일), 0 실패, 0 스킵

### 0.9.3 (2026.03.02)

- **About 타임라인**: 2026년 "AI 솔루션 전문화" 항목 추가 (ko/en 번역)
- **문서 업데이트**: CLAUDE.md 전면 개선 (CI 버전 정보 수정, 누락 명령어 추가, Tailwind/Prettier/Codecov/Dependabot 설정 문서화)
- **README 버전 갱신**: 프론트엔드/백엔드 의존성 버전을 실제 설치 버전으로 업데이트
- **의존성 업데이트**: Django 5.2.6→5.2.11, drf-yasg 1.21.10→1.21.15 등 백엔드 의존성 갱신 (uv.lock)

### 0.9.2 (2026.03.01~02)

- **P0 보안 수정**: unsafe `JSON.parse` try-catch 래핑, CSP `style-src` 강화, 외부 링크 `noopener noreferrer` 일괄 적용, `Math.random` → `crypto.randomUUID`, `document.execCommand` 제거
- **i18n 완전 전환**: SEOHelmet, StructuredData, NotFound, OfflineIndicator, ScrollToTop, SkipLink 등 잔여 컴포넌트 전량 i18n 키 전환
- **접근성**: WCAG AA 색상 대비 미충족 텍스트 일괄 수정 (HeroSection, Footer 등 `text-gray-500/400` → 고대비 색상)
- **SEO 확장**: AboutPage, ProfilePage에 JSON-LD 구조화 데이터 추가, sitemap·robots.txt 정리, og:locale:alternate 추가
- **공사 중 전환**: Blog/Contact/Chat 라우트를 UnderConstruction 컴포넌트로 교체, ChatWidget 비활성화
- **XSS 수정**: CareerSection/CareerSummarySection의 dangerouslySetInnerHTML → Trans 컴포넌트
- **데드 코드 제거**: 미사용 유틸리티·훅·컴포넌트 34개 파일 삭제 (-3,900줄), 미사용 헬퍼 함수 제거
- **백엔드 검증**: views.py 쿼리 파라미터 화이트리스트·길이 제한 추가
- **테스트 대폭 확장**: 89 → 100 파일, 1373 → 1792 tests (+419 tests)
  - 신규: `i18n.ts`, `env.ts`, `performanceMonitor.ts`, `sentry.ts`, `seo.ts`, `mockData.ts`, `footerData.ts`, `profileData.ts`, hooks, styles 등 11개 파일
  - 기존 강화: FormContext (24), useAppStore (42) 신규 테스트, api.additional 약한 assertion 전량 강화
- **E2E 업데이트**: blog.spec.ts, contact.spec.ts 공사 중 페이지에 맞게 재작성
- **테스트**: 1792개 통과 (100 파일), 0 실패, 0 스킵

### 0.9.1 (2026.02.28)

- **기능 연결**: BlogListPage, ContactPage, ChatWidget 실제 컴포넌트 연결 완료
- **채팅 시스템**: ChatWidget 활성화, Mock WebSocket 에이전트 응답, chat i18n 100+ 키 추가
- **빌드 최적화**: Terser → esbuild 전환 (빌드 시간 ~50% 단축)
- **라이선스**: MIT → Apache License 2.0 변경, NOTICE 파일 추가
- **백엔드 CI 수정**: blog router basename 수정, backend-test 타임아웃 10분 추가
- **코드 정리**: deprecated `.substr()` 전체 교체, 중복 i18n 키 제거
- **테스트**: 1724개 통과 (106 파일), 0 실패, 0 스킵

### 0.9.0 (2026.02.28)

- **코드 품질 전면 개선**: placeholder 테스트 교체, 데드 코드/중복 삭제
- **Admin 인증 가드**: ProtectedRoute 컴포넌트 생성, /admin 라우트 보호
- **CONTACT_EMAIL 통일**: 8개 파일 하드코딩 → constants.ts 상수 (import.meta.env.VITE\_ 지원)
- **Pre-commit 훅**: 루트 lint-staged로 프론트+백엔드 통합 린트
- **Context 성능 최적화**: 5개 Provider에 useMemo/useCallback 적용
- **i18n 완성**: BlogSearch, BlogComments, BlogCard, ProfilePage 전환
- **API 호환성 수정**: 프론트-백 API 스펙 통일, JWT 토큰 관리 개선
- **테스트**: 1718개 통과 (106 파일), 0 실패, 0 스킵

### 0.8.0 (2026.02.27)

- **i18n 이관**: 전체 컴포넌트/데이터/Context/SEO → i18n 키 전환, en.json 완성
- **테스트 확대**: 1544개 → 1718개, 18개 미테스트 컴포넌트 커버
- **CI/CD 안정화**: tsconfig.build.json 분리, artifact 버전 통일, VITE\_ prefix 전환
- **보안**: CSP unsafe-eval 제거, Trivy 고정, Docker npm ci 전환

### 0.7.0 (2026.02.26)

- **테스트 복구**: 425개 스킵 → 전체 통과, 0 스킵
- **인프라**: Node 20→22, Python 3.11→3.12
- **정리**: 불필요 파일 제거, 포트 5173 통일

### 0.6.0 이전 (2025.09 ~ 2026.02)

- minimatch 취약점 해결, Vite 보안 패치
- Jest → Vitest 마이그레이션, Tailwind CSS 3.x 전환
- CI/CD 파이프라인 구축, 번들 크기 52% 감소

## 라이선스

Apache License 2.0 — 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro](https://researcherhojin.github.io/emelmujiro)
