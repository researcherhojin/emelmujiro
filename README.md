# 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[Live Site](https://researcherhojin.github.io/emelmujiro)** | **[Report Bug](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

## 프로젝트 개요

**에멜무지로**는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 기업 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 플랫폼입니다.

### 핵심 서비스

- **AI 교육 & 강의** - 기업 맞춤 AI 교육 프로그램 설계 및 운영
- **AI 컨설팅** - AI 도입 전략 수립부터 기술 자문까지
- **LLM/생성형 AI** - LLM 기반 서비스 설계 및 개발
- **Computer Vision** - 영상 처리 및 비전 AI 솔루션

## 현재 상태 (v0.9.0)

| 항목       | 상태    | 세부사항                              |
| ---------- | ------- | ------------------------------------- |
| **빌드**   | ✅ 정상 | Vite 빌드                             |
| **CI/CD**  | ✅ 정상 | GitHub Actions (Node 22, Python 3.12) |
| **테스트** | ✅ 통과 | 1718 통과, 0 스킵 (106 파일)          |
| **타입**   | ✅ 100% | TypeScript Strict Mode                |
| **보안**   | ✅ 안전 | 취약점 0건                            |
| **배포**   | ✅ 정상 | GitHub Pages                          |
| **백엔드** | ⚠️ Mock | 프로덕션 Mock API 사용 중             |

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

### Frontend

| 기술          | 버전    |
| ------------- | ------- |
| React         | 19.1.1  |
| TypeScript    | 5.9.2   |
| Vite          | 7.1.5   |
| Vitest        | 3.2.4   |
| Tailwind CSS  | 3.4.17  |
| Zustand       | 5.0.8   |
| i18next       | 25.5.2  |
| Framer Motion | 11.18.2 |
| React Router  | 7.8.2   |

### Backend

| 기술       | 버전   |
| ---------- | ------ |
| Django     | 5.2.6  |
| DRF        | 3.16.1 |
| PostgreSQL | 15     |
| Redis      | 7      |
| Channels   | 4.3.1  |

### DevOps

- **CI/CD**: GitHub Actions (Node 22, Python 3.12)
- **배포**: GitHub Pages (프론트엔드)
- **컨테이너**: Docker + Docker Compose
- **패키지 관리**: npm (프론트엔드), uv (백엔드)

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

| 기능                | 상태            | 설명                                         |
| ------------------- | --------------- | -------------------------------------------- |
| **홈페이지**        | ✅ 완료         | Hero, 서비스 소개, 통계, CTA                 |
| **프로필**          | ✅ 완료         | CEO 경력/학력/프로젝트 포트폴리오            |
| **다크 모드**       | ✅ 완료         | 시스템 설정 연동                             |
| **다국어 (i18n)**   | ✅ 완료         | 전체 컴포넌트 i18n 전환 완료 (ko/en)         |
| **PWA**             | ✅ 완료         | 오프라인 지원, 설치 가능                     |
| **반응형**          | ✅ 완료         | 모바일/태블릿/데스크톱 최적화                |
| **SEO**             | ✅ 완료         | React Helmet, 사이트맵, 구조화 데이터        |
| **블로그**          | 🚧 준비 중      | 컴포넌트 구현 완료, 페이지 미연결            |
| **문의하기**        | 🚧 준비 중      | ContactForm 컴포넌트 존재, 페이지 미연결     |
| **실시간 채팅**     | 🚧 비활성       | WebSocket 구현 완료, ChatWidget 주석 처리    |
| **관리자 대시보드** | 🚧 플레이스홀더 | UI + ProtectedRoute 인증 가드, API 연동 필요 |

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

## 향후 작업 (Roadmap)

### 1.0 릴리스 목표

블로그, 문의하기 페이지가 실제 연결되고 백엔드가 프로덕션 배포되면 1.0으로 전환합니다.

#### 프론트엔드 기능 연결

- [ ] **블로그 페이지 연결** — BlogListPage의 "준비 중" 플레이스홀더를 실제 BlogCard/BlogSearch 컴포넌트로 교체, 페이지네이션 연결
- [ ] **문의 페이지 연결** — ContactPage의 "준비 중" 플레이스홀더를 ContactForm/ContactInfo 컴포넌트로 교체, 폼 제출 플로우 확인
- [ ] **채팅 시스템 재활성화** — App.tsx에서 ChatWidget 주석 해제, WebSocket 메시지 프로토콜 프론트/백 통일

#### 백엔드 프로덕션 배포

- [ ] **Django 보안 설정** — SECRET_KEY 환경변수 분리, `ALLOWED_HOSTS` / `CSRF_TRUSTED_ORIGINS` 프로덕션 도메인 설정
- [ ] **데이터베이스** — PostgreSQL 프로덕션 인스턴스 구성, 마이그레이션 적용 (0001_initial + 0002_blogpost 필드 추가)
- [ ] **배포 인프라** — Docker 프로덕션 이미지 빌드 및 배포 (Railway/Fly.io/AWS 등)
- [ ] **이메일 백엔드** — 문의 폼 알림 이메일 발송 설정 (SMTP 또는 SendGrid)
- [ ] **Mock API 전환** — 백엔드 배포 후 프론트엔드 `USE_MOCK_API` 조건에 프로덕션 백엔드 URL 추가

#### 품질 개선

- [ ] **에러 리포팅 연동** — `logger.ts`의 `reportToErrorService()` 빈 함수에 Sentry 등 연동
- [ ] **테스트 커버리지 개선** — 현재 커버리지 측정 후 80% 미만 파일 보강
- [ ] **Lighthouse 점수 최적화** — Performance/Accessibility/SEO 90점 이상 달성
- [ ] **관리자 대시보드 API 연동** — AdminDashboard 컴포넌트에 실제 통계 데이터 연결

### 완료된 항목

- [x] **i18n 전체 전환** — BlogSearch, BlogComments, BlogCard, ProfilePage 포함 전체 컴포넌트 (v0.8.0~0.9.0)
- [x] **Context Provider 성능 최적화** — 5개 Provider useMemo/useCallback 적용 (v0.9.0)
- [x] **백엔드 마이그레이션** — BlogPost 모델 slug, author, tags, likes 필드 (v0.9.0)
- [x] **데드 코드 제거** — environment.ts, pages/ContactPage.tsx, 중복 ErrorBoundary (v0.9.0)
- [x] **Admin 인증 가드** — ProtectedRoute 컴포넌트, /admin 라우트 보호 (v0.9.0)
- [x] **CONTACT_EMAIL 상수 통일** — 8개 파일 → constants.ts 중앙 관리 (v0.9.0)
- [x] **Pre-commit 훅 수정** — 루트에서 프론트+백엔드 lint-staged 통합 실행 (v0.9.0)
- [x] **Placeholder 테스트 교체** — 19개 expect(true).toBe(true) → 실제 assertion (v0.9.0)
- [x] **CI/CD 안정화** — artifact v4, tsconfig.build.json, VITE\_ prefix (v0.8.0)
- [x] **보안 강화** — CSP, Trivy, minimatch, Docker npm ci (v0.7.0~0.8.0)
- [x] **테스트 전면 복구** — 425개 스킵 → 0 스킵, Jest → Vitest (v0.6.0~0.7.0)

## 변경 이력

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

MIT License

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro](https://researcherhojin.github.io/emelmujiro)
