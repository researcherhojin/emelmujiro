# 🚀 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[🌐 Live Site](https://researcherhojin.github.io/emelmujiro)** | **[🐛 Report Bug](https://github.com/researcherhojin/emelmujiro/issues)**

⚠️ **주의**: 현재 프로덕션은 Mock API 사용 중. 실제 백엔드 배포 진행 예정.

</div>

## 📌 프로젝트 개요

**에멜무지로**는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 기업 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 플랫폼입니다.

### ✨ 핵심 서비스

- 🎯 **AI 솔루션 개발** - 맞춤형 LLM 솔루션, Computer Vision, MLOps 파이프라인 구축
- 📚 **AI 교육 & 강의** - 실무 중심 AI 교육, Python 머신러닝/딥러닝 교육
- 🤖 **기술 컨설팅** - 기업별 AI 도입 전략 수립 및 기술 자문
- 📊 **데이터 분석** - 빅데이터 기반 인사이트 도출 및 분석 시스템 구축

## 🎯 현재 상태 (v4.4.0)

### 📊 프로젝트 건강도

| 항목       | 상태    | 세부사항                     |
| ---------- | ------- | ---------------------------- |
| **빌드**   | ✅ 정상 | 3.2초, 240KB (gzipped)       |
| **CI/CD**  | ✅ 정상 | 모든 파이프라인 성공         |
| **테스트** | ✅ 통과 | 1008 통과, 481 스킵 (CI환경) |
| **타입**   | ✅ 100% | TypeScript Strict Mode       |
| **보안**   | ✅ 안전 | 취약점 0건                   |
| **성능**   | ✅ 최적 | Lighthouse 95+ 점수          |
| **백엔드** | ⚠️ Mock | 실제 API 배포 필요           |

### ✅ 최근 개선사항 (2026.02.24)

1. **보안 취약점 전면 해결**
   - minimatch ReDoS 취약점 52개 → 0개 해결
   - `react-scripts` 레거시 의존성 제거
   - npm overrides를 통한 transitive dependency 보안 강화

2. **의존성 정리 및 업데이트**
   - ESLint 플러그인 최신 버전 업데이트 (typescript-eslint, jsx-a11y, react, react-hooks)
   - lucide-react 0.542.0 → 0.575.0 업데이트
   - 불필요한 루트 의존성 제거 (react-scripts, eslint)

3. **문서 개선**
   - CLAUDE.md 전면 개편 (283줄 → 140줄, 중복 제거)
   - README.md 최신 상태 반영

### 🟡 다음 우선순위

1. **실제 백엔드 배포**
   - Django 프로덕션 배포
   - PostgreSQL/Redis 설정
   - Mock API → 실제 API 전환

2. **테스트 커버리지 개선**
   - CI 환경에서 스킵된 테스트 복구
   - React Testing Library 환경 개선
   - 통합 테스트 강화

## 🚀 빠른 시작

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

## 🔧 기술 스택

### Frontend

- **React** 19.1.1 + **TypeScript** 5.9.2
- **Vite** 7.1.5 + **Vitest** 3.2.4
- **Tailwind CSS** 3.4.17
- **Zustand** + Context API
- **i18next** 25.5.2 (다국어 지원)
- **Framer Motion** 11.18.2 (애니메이션)
- **React Router** 7.8.2 (라우팅)

### Backend

- **Django** 5.2.6 + **DRF** 3.16.1
- **JWT Auth** + **WebSocket** (Channels)
- **PostgreSQL** (production ready)

### DevOps

- **GitHub Actions** CI/CD
- **GitHub Pages** 배포
- **Docker** 컨테이너화

## 📁 프로젝트 구조

```
emelmujiro/
├── frontend/               # React 앱
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── store/          # Zustand 상태 관리
│   │   ├── services/       # API 서비스
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   └── test-utils/     # 테스트 유틸리티
│   └── vite.config.ts
├── backend/                # Django API
│   ├── api/                # REST API
│   └── requirements.txt
└── .github/workflows/      # CI/CD
```

### 📈 코드베이스 통계

- **TypeScript 파일**: 240개
- **React 컴포넌트**: 86개
- **테스트 파일**: 92개
- **코드 라인**: ~60,800줄
- **빌드 크기**: 2.0MB (압축 전)

## 🌟 주요 기능

- ✅ **PWA** - 오프라인 지원, 설치 가능
- ✅ **실시간 채팅** - WebSocket 기반
- ✅ **블로그 시스템** - 마크다운 지원
- ✅ **다크 모드** - 시스템 연동
- ✅ **다국어** - 한국어/영어 (i18n)
- ✅ **반응형** - 모든 디바이스 최적화

## 📊 변경 이력

### v4.4.0 (2026.02.24)

- ✅ **보안**: minimatch 취약점 52개 → 0개 전면 해결
- ✅ **정리**: react-scripts 레거시 의존성 제거
- ✅ **업데이트**: ESLint 플러그인, lucide-react 등 최신화
- ✅ **문서**: CLAUDE.md 전면 개편, README 업데이트

### v4.3.0 (2025.09.11)

- ✅ **보안 업데이트**: Vite 취약점 해결, 10개 패키지 업데이트
- ✅ **코드 정리**: 불필요한 파일 5개, 의존성 1개 제거
- ✅ **테스트 개선**: ScrollProgress 테스트 수정, 100% 통과

### v4.2.0 (2025.09.11)

- ✅ CI/CD 파이프라인 완전 안정화
- ✅ 테스트 스킵 패턴 도입 (CI 환경 최적화)
- ✅ 1008개 테스트 통과, 481개 CI 환경 조건부 스킵

### v4.1.0 (2025.09.09)

- Jest → Vitest 완전 마이그레이션
- Tailwind CSS 3.x 다운그레이드 (PostCSS 호환성)
- 번들 크기 52% 감소 (400KB → 190KB)
- 빌드 시간 72% 단축 (10초 → 2.8초)

## 🔧 주요 명령어

| 명령어               | 설명              |
| -------------------- | ----------------- |
| `npm run dev`        | 개발 서버 시작    |
| `npm run build`      | 프로덕션 빌드     |
| `npm test`           | 테스트 실행       |
| `npm run deploy`     | GitHub Pages 배포 |
| `npm run type-check` | TypeScript 체크   |
| `npm run lint:fix`   | ESLint 자동 수정  |
| `npm run test:ci`    | CI 테스트 실행    |

## 📝 라이선스

MIT License - 자유롭게 사용 가능

---

**문의**: [Issues](https://github.com/researcherhojin/emelmujiro/issues) | **사이트**: [emelmujiro.com](https://researcherhojin.github.io/emelmujiro)
