# 🚀 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[🌐 Live Site](https://researcherhojin.github.io/emelmujiro)** | **[📚 Documentation](https://github.com/researcherhojin/emelmujiro/wiki)** | **[🐛 Report Bug](https://github.com/researcherhojin/emelmujiro/issues)**

</div>

## 📌 프로젝트 개요

**에멜무지로**는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 기업 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 플랫폼입니다.

### ✨ 핵심 기능

- 🎯 **AI 컨설팅** - 기업별 맞춤형 AI 도입 전략 수립
- 📚 **AI 교육 프로그램** - 실무 중심의 체계적인 AI 교육
- 🤖 **LLM 솔루션** - ChatGPT, Claude 등 최신 LLM 활용
- 📊 **데이터 분석** - 빅데이터 기반 인사이트 도출

## 🎯 프로젝트 현황 (2025.08.29)

### 📊 성과 지표

| 항목            | 상태          | 세부 내용                      |
| --------------- | ------------- | ------------------------------ |
| **빌드 도구**   | ✅ Vite 7.1   | CRA → Vite 완전 마이그레이션   |
| **프레임워크**  | ✅ React 19.1 | 최신 React 사용                |
| **TypeScript**  | ✅ 100%       | 228개 TS/TSX 파일, Strict Mode |
| **테스트**      | ✅ Vitest     | 90개 테스트 파일               |
| **CI/CD**       | ✅ 자동화     | GitHub Actions + GitHub Pages  |
| **번들 크기**   | ✅ 최적화     | ~450KB gzipped                 |
| **보안 취약점** | ✅ 0건        | 모든 취약점 해결               |

## 🚀 빠른 시작

### 📋 필수 요구사항

- **Node.js** 18.x 이상
- **npm** 9.x 이상

### 💻 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro/frontend

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 접속
# http://localhost:5173
```

### 🛠 주요 명령어

| 명령어                  | 설명                  |
| ----------------------- | --------------------- |
| `npm run dev`           | 개발 서버 시작 (Vite) |
| `npm run build`         | 프로덕션 빌드         |
| `npm run preview`       | 빌드 미리보기         |
| `npm test`              | 테스트 실행 (Vitest)  |
| `npm run test:ui`       | 테스트 UI 실행        |
| `npm run test:coverage` | 테스트 커버리지       |
| `npm run lint`          | ESLint 실행           |
| `npm run type-check`    | TypeScript 타입 체크  |
| `npm run deploy`        | GitHub Pages 배포     |

## 🔧 기술 스택

### Frontend

- **Core**: React 19.1 + TypeScript 5.9
- **Build Tool**: Vite 7.1
- **Styling**: Tailwind CSS 3.4 + Framer Motion 11
- **State**: Context API (4개 Context)
- **Routing**: React Router 7 (HashRouter)
- **Testing**: Vitest 3.2 + React Testing Library
- **PWA**: Service Worker + Offline Support
- **Icons**: Lucide React
- **i18n**: react-i18next (준비됨, UI 미구현)

### Backend (API)

- **Framework**: Django 5.2 + Django REST Framework
- **Auth**: JWT (djangorestframework-simplejwt)
- **WebSocket**: Django Channels
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)

### DevOps

- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages
- **Monitoring**: Sentry
- **Container**: Docker Support

## 📁 프로젝트 구조

```
emelmujiro/
├── frontend/                # React 애플리케이션
│   ├── public/             # 정적 파일
│   ├── src/
│   │   ├── @types/         # TypeScript 타입 정의
│   │   ├── components/     # React 컴포넌트
│   │   │   ├── admin/      # 관리자 대시보드
│   │   │   ├── blog/       # 블로그 시스템
│   │   │   ├── chat/       # 실시간 채팅
│   │   │   ├── common/     # 공통 컴포넌트
│   │   │   ├── layout/     # 레이아웃
│   │   │   ├── pages/      # 페이지 컴포넌트
│   │   │   ├── sections/   # 섹션 컴포넌트
│   │   │   └── seo/        # SEO 컴포넌트
│   │   ├── config/         # 설정 파일
│   │   ├── contexts/       # React Context
│   │   ├── data/           # 정적 데이터
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── locales/        # 다국어 파일
│   │   ├── pages/          # 라우트 페이지
│   │   ├── services/       # API 서비스
│   │   ├── styles/         # 전역 스타일
│   │   ├── types/          # TypeScript 타입
│   │   └── utils/          # 유틸리티 함수
│   ├── scripts/            # 빌드/배포 스크립트
│   ├── vite.config.ts      # Vite 설정
│   ├── vitest.config.ts    # Vitest 설정
│   └── package.json        # 패키지 정의
├── backend/                # Django API
└── .github/workflows/      # CI/CD 파이프라인
```

## 🌟 주요 기능

### 핵심 기능

- ✅ **반응형 디자인** - 모든 디바이스 최적화
- ✅ **PWA 지원** - 오프라인 모드, 설치 가능
- ✅ **실시간 채팅** - WebSocket 기반 상담 시스템
- ✅ **블로그 시스템** - 마크다운 지원, 검색, 댓글
- ✅ **다크 모드** - 시스템 설정 연동
- ✅ **접근성** - WCAG 2.1 AA 준수

### 성능 최적화

- ⚡ **빠른 빌드** - Vite로 10초 내 빌드
- 🚀 **즉시 HMR** - 171ms 개발 서버 시작
- 📦 **코드 스플리팅** - 동적 임포트 최적화
- 🖼️ **이미지 최적화** - Lazy Loading
- 💾 **캐싱 전략** - Service Worker 캐싱

## 📊 코드베이스 통계

- **TypeScript 파일**: 228개 (100% 타입 안전)
- **React 컴포넌트**: 70+ 개
- **테스트 파일**: 90개
- **프로덕션 의존성**: 16개
- **개발 의존성**: 41개
- **총 의존성**: 57개 패키지

## 🔄 최근 업데이트

### 2025.08.29 - 빌드 오류 수정 및 안정화

- ✅ gtag TypeScript 타입 충돌 해결
- ✅ AdminPanel 테스트 타임아웃 수정
- ✅ 프로덕션 console 문 제거 (logger 유틸리티로 교체)
- ✅ README 현재 상태로 업데이트

### 2025.08.28 - Vite 마이그레이션 완료

- ✅ Create React App → Vite 7.1 전환
- ✅ 빌드 속도 60초 → 10초 (85% 개선)
- ✅ 개발 서버 시작 30초 → 171ms (175배 개선)
- ✅ Tailwind CSS v3 호환성 문제 해결
- ✅ Service Worker 캐싱 전략 개선

## 🚧 향후 계획

### 단기 목표

- [ ] 테스트 커버리지 향상 (목표 85%)
- [ ] Lighthouse 점수 100점 달성
- [ ] E2E 테스트 확장

### 중기 목표

- [ ] Next.js 마이그레이션 검토
- [ ] 상태 관리 개선 (Zustand/Redux Toolkit)
- [ ] AI API 직접 통합

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📚 추가 문서

- [CLAUDE.md](CLAUDE.md) - Claude Code 가이드
- [CI-CD-README.md](CI-CD-README.md) - CI/CD 파이프라인 문서

## 📞 문의

- **이메일**: researcherhojin@gmail.com
- **웹사이트**: [https://researcherhojin.github.io/emelmujiro](https://researcherhojin.github.io/emelmujiro)
- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/researcherhojin/emelmujiro/issues)

---

<div align="center">

**Made with ❤️ by Emelmujiro Team**

© 2025 Emelmujiro. All rights reserved.

</div>
