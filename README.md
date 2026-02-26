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

- **AI 솔루션 개발** - 맞춤형 LLM 솔루션, Computer Vision, MLOps 파이프라인 구축
- **AI 교육 & 강의** - 실무 중심 AI 교육, Python 머신러닝/딥러닝 교육
- **기술 컨설팅** - 기업별 AI 도입 전략 수립 및 기술 자문
- **데이터 분석** - 빅데이터 기반 인사이트 도출 및 분석 시스템 구축

## 현재 상태

| 항목       | 상태    | 세부사항                       |
| ---------- | ------- | ------------------------------ |
| **빌드**   | ✅ 정상 | Vite 빌드                      |
| **CI/CD**  | ✅ 정상 | GitHub Actions (Node 22, Python 3.12) |
| **테스트** | ✅ 통과 | 1577 통과, 0 스킵              |
| **타입**   | ✅ 100% | TypeScript Strict Mode         |
| **보안**   | ✅ 안전 | 취약점 0건                     |
| **배포**   | ✅ 정상 | GitHub Pages                   |
| **백엔드** | ⚠️ Mock | 프로덕션 Mock API 사용 중      |

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
uv run python manage.py runserver
```

## 기술 스택

### Frontend

| 기술 | 버전 |
| --- | --- |
| React | 19.1.1 |
| TypeScript | 5.9.2 |
| Vite | 7.1.5 |
| Vitest | 3.2.4 |
| Tailwind CSS | 3.4.17 |
| Zustand | 5.0.8 |
| i18next | 25.5.2 |
| Framer Motion | 11.18.2 |
| React Router | 7.8.2 |

### Backend

| 기술 | 버전 |
| --- | --- |
| Django | 5.2.6 |
| DRF | 3.16.1 |
| PostgreSQL | 15 |
| Redis | 7 |
| Channels | 4.3.1 |

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
│   │   └── test-utils/     # 테스트 유틸리티
│   └── vitest.config.ts
├── backend/                # Django API
│   ├── api/                # REST API
│   ├── config/             # Django 설정
│   └── pyproject.toml      # uv 의존성 관리
├── .github/workflows/      # CI/CD 파이프라인
├── docker-compose.yml      # 프로덕션 Docker
└── docker-compose.dev.yml  # 개발 Docker
```

## 주요 기능

- **PWA** - 오프라인 지원, 설치 가능
- **실시간 채팅** - WebSocket 기반
- **블로그 시스템** - 마크다운 지원
- **다크 모드** - 시스템 연동
- **다국어** - 한국어/영어 (i18n)
- **반응형** - 모든 디바이스 최적화
- **SEO** - React Helmet, 사이트맵

## 주요 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm test` | 테스트 실행 (watch) |
| `npm run test:run` | 테스트 단일 실행 |
| `npm run test:ci` | CI 테스트 실행 |
| `npm run deploy` | GitHub Pages 배포 |
| `npm run type-check` | TypeScript 체크 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run validate` | lint + type-check + test |

### 백엔드 명령어

| 명령어 | 설명 |
| --- | --- |
| `uv sync` | 의존성 설치 |
| `uv run python manage.py runserver` | 개발 서버 |
| `uv run python manage.py test` | 테스트 실행 |
| `uv run black .` | 코드 포맷 |
| `uv run flake8 .` | 린트 |

## 변경 이력

### v4.5.0 (2026.02.26)

- **테스트**: 425개 스킵 테스트 전면 복구 → 1577 통과, 0 스킵
- **CI/CD**: Node 20→22, Python 3.11→3.12 업그레이드
- **의존성**: 프론트엔드/백엔드 전체 업데이트, Dependabot PR 23개 정리
- **정리**: 불필요 파일 제거 (GitLab CI, Jenkinsfile, deploy/, 중복 테스트 등)
- **설정**: 포트 3000→5173 전면 수정, Docker/CI 환경 통일

### v4.4.0 (2026.02.24)

- **보안**: minimatch 취약점 52개 → 0개 전면 해결
- **정리**: react-scripts 레거시 의존성 제거
- **업데이트**: ESLint 플러그인, lucide-react 등 최신화

### v4.3.0 (2025.09.11)

- **보안**: Vite 취약점 해결, 10개 패키지 업데이트
- **코드 정리**: 불필요한 파일 5개, 의존성 1개 제거

### v4.2.0 (2025.09.11)

- CI/CD 파이프라인 안정화
- 테스트 스킵 패턴 도입 (이후 v4.5.0에서 전면 복구)

### v4.1.0 (2025.09.09)

- Jest → Vitest 완전 마이그레이션
- Tailwind CSS 3.x 다운그레이드 (PostCSS 호환성)
- 번들 크기 52% 감소

## 라이선스

MIT License

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro](https://researcherhojin.github.io/emelmujiro)
