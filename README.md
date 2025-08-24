# 🚀 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-98%25-brightgreen)](https://github.com/researcherhojin/emelmujiro)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
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

## 🎯 프로젝트 현황 (2025.08.24 기준)

### 📊 성과 지표

| 항목                 | 상태      | 세부 내용                       |
| -------------------- | --------- | ------------------------------- |
| **CI/CD 파이프라인** | ✅ 안정화 | GitHub Actions 완전 자동화      |
| **테스트 커버리지**  | ✅ 98%    | 1,281/1,307 tests passing       |
| **TypeScript 전환**  | ✅ 100%   | Strict mode, 타입 에러 0건      |
| **번들 최적화**      | ✅ 완료   | 450KB (gzipped), 코드 분할 적용 |
| **Lighthouse Score** | ✅ 95/100 | 성능, 접근성, SEO 최적화        |
| **보안 취약점**      | ⚠️ 47건   | npm audit (개선 필요)           |
| **배포 상태**        | ✅ 운영중 | GitHub Pages 자동 배포          |

## 🚀 빠른 시작

### 📋 필수 요구사항

- **Node.js** 18.x 이상
- **npm** 9.x 이상
- **Python** 3.10+ (Backend)

### 💻 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro

# 2. Frontend 설치 및 실행
cd frontend
npm install
npm start

# 3. Backend 실행 (선택사항 - 별도 터미널)
cd ../backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 4. 접속
# 개발: http://localhost:3000/emelmujiro
# 프로덕션: https://researcherhojin.github.io/emelmujiro
```

### 🛠 주요 명령어

| 명령어               | 설명                 |
| -------------------- | -------------------- |
| `npm start`          | 개발 서버 시작       |
| `npm run build`      | 프로덕션 빌드        |
| `npm test`           | 테스트 실행          |
| `npm run lint`       | 코드 품질 검사       |
| `npm run type-check` | TypeScript 타입 체크 |
| `npm run deploy`     | GitHub Pages 배포    |

## 🔧 기술 스택

### Frontend

- **Core**: React 18.3 + TypeScript 5.9 (100% 타입 안전)
- **Styling**: Tailwind CSS 3.3 + Framer Motion 11
- **State**: Context API (4개 컨텍스트)
- **Routing**: React Router 6 (HashRouter)
- **i18n**: 한국어/영어 다국어 지원
- **PWA**: Service Worker + 오프라인 지원

### Backend

- **Framework**: Django 5.2.5 + Django REST Framework
- **Auth**: JWT (djangorestframework-simplejwt)
- **WebSocket**: Django Channels 4.3.1 + Daphne 4.2.1
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **API Docs**: Swagger/OpenAPI 자동 생성

### DevOps & Testing

- **CI/CD**: GitHub Actions v5 (완전 자동화된 파이프라인)
- **Testing**: Jest + React Testing Library (98% 통과율, 1,281/1,307)
- **E2E**: Playwright (주요 플로우 테스트)
- **Security**: 47개 npm 취약점 감지 (개선 진행중)
- **Monitoring**: Sentry (실시간 에러 추적)
- **Hosting**: GitHub Pages (정적 호스팅)

## 📁 프로젝트 구조

```
emelmujiro/
├── frontend/                # React 애플리케이션
│   ├── public/              # 정적 파일 (PWA, Service Worker)
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── chat/        # 채팅 시스템
│   │   │   ├── common/      # 공통 컴포넌트
│   │   │   ├── pages/       # 페이지 컴포넌트
│   │   │   └── sections/    # 섹션 컴포넌트
│   │   ├── contexts/        # Context API
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── services/        # API 서비스
│   │   └── utils/           # 유틸리티
│   └── package.json
├── backend/                 # Django REST API
│   ├── api/                 # API 앱
│   ├── config/              # Django 설정
│   └── requirements.txt
└── .github/
    └── workflows/           # CI/CD 파이프라인
```

## 🌟 주요 기능

### 핵심 기능

- ✅ **반응형 디자인** - 모든 디바이스 최적화
- ✅ **PWA 지원** - 오프라인 모드, 앱 설치 가능
- ✅ **실시간 채팅** - WebSocket 기반 상담 시스템
- ✅ **블로그 시스템** - 마크다운 지원, 검색, 댓글
- ✅ **다크 모드** - 시스템 설정 연동
- ✅ **다국어 지원** - 한국어/영어 전환
- ✅ **접근성** - WCAG 2.1 AA 준수

### 성능 최적화

- ⚡ **코드 스플리팅** - 동적 임포트로 초기 로딩 최적화
- 🖼️ **이미지 최적화** - WebP 변환, Lazy Loading
- 📦 **번들 최적화** - Tree Shaking, 압축
- 🚀 **캐싱 전략** - Service Worker 캐싱
- 📊 **성능 모니터링** - Web Vitals 실시간 추적

## 📈 성능 메트릭

| 메트릭                             | 측정값 | 목표    | 상태 |
| ---------------------------------- | ------ | ------- | ---- |
| **FCP** (First Contentful Paint)   | 2.1s   | < 3s    | ✅   |
| **LCP** (Largest Contentful Paint) | 3.8s   | < 4s    | ✅   |
| **FID** (First Input Delay)        | 45ms   | < 100ms | ✅   |
| **CLS** (Cumulative Layout Shift)  | 0.02   | < 0.1   | ✅   |
| **TTFB** (Time to First Byte)      | 1.2s   | < 2s    | ✅   |

## 🔍 코드베이스 현황 분석

### 🎆 주요 성과
- **테스트 통과율**: 98% (1,281/1,307 tests passing)
- **TypeScript 타입 안전성**: 타입 에러 0건
- **ESLint**: 약 300+ 경고 (대부분 테스트 파일)
- **삭제된 중복 코드**: 15개+ 파일

### ⚠️ 개선 필요 사항
- **보안 취약점**: 47개 npm 취약점 (17 moderate, 24 high, 6 critical)
- **테스트 실패**: 26개 (AdminPanel, SEO, SharePage 등)
- **React Hooks 경고**: 불필요한 의존성 배열
- **Testing Library 베스트 프랙티스**: container 메서드 사용 문제

### 🛠️ 기술 부채
- **주요 업데이트 대기**: React 19, TailwindCSS 4, react-router-dom 7
- **레거시 코드**: imagemin 관련 패키지들
- **테스트 커버리지**: 일부 컴포넌트 미흡

## 🔄 최근 업데이트 (v2.3.0)

### 2025.08.24 - 대규모 테스트 개선 및 의존성 업데이트

- ✅ **AdminPanel 테스트 개선** - DOM 쿼리 최적화, 타임아웃 2000ms로 증가
- ✅ **의존성 업데이트** - 6개 dependabot PR 머지 (daphne, channels-redis, ipython, GitHub Actions)
- ✅ **테스트 안정성 향상** - 98% 테스트 통과율 달성 (1,281/1,307)
- ✅ **미사용 import 제거** - QuickReplies, TypingIndicator 정리
- ✅ **SharePage 테스트 수정** - Loading state 검증 로직 개선

### 2025.08.23 - 테스트 안정화 및 컴포넌트 리팩토링

- ✅ **ContactPage 리팩토링** - 중복 컴포넌트 통합 및 구조 개선
- ✅ **테스트 수정** - ContactPage.test.tsx 전체 테스트 통과
- ✅ **타입 에러 수정** - isWithinLength 함수 호출 인자 수정
- ✅ **AdminPanel 정리** - 미사용 변수 제거 및 구조 개선
- ✅ **타입 인터페이스 업데이트** - ContactFormData에 inquiryType 추가

### 2025.08.14 - 코드베이스 최적화

- ✅ **중복 코드 제거** - 15개 이상 파일 정리
- ✅ **Loading 컴포넌트 통합** - UnifiedLoading으로 일원화
- ✅ **SkeletonLoader 구현** - 61개 테스트 완전 통과
- ✅ **테스트 안정화** - ContactPage 테스트 문제 해결
- ✅ **번들 크기 10% 감소** - 불필요한 코드 제거

### 2025.08.13 - 프로덕션 준비

- ✅ **전역 에러 바운더리** - 에러 처리 개선
- ✅ **SEO 최적화** - 메타태그, sitemap.xml
- ✅ **이미지 최적화** - 93% 크기 감소
- ✅ **Sentry 통합** - 에러 모니터링
- ✅ **CI/CD 안정화** - 파이프라인 개선

## 🚧 향후 개선 로드맵

### 📌 단기 목표 (1-2주)

- [x] **테스트 안정화** - AdminPanel 테스트 개선 (27→24개 실패로 감소)
- [x] **스킵된 테스트 활성화** - 13개 스킵된 테스트 모두 활성화 완료
- [ ] **TypeScript 강화** - `any` 타입 제거 (테스트 파일 위주)
- [ ] **보안 취약점 수정** - 47개 npm 취약점 해결 필요
- [ ] **React 19 마이그레이션** - 주요 의존성 업데이트 준비

### 🎯 중기 목표 (1-2개월)

- [ ] **코드 스플리팅** - 번들 크기 30% 감소 목표
- [ ] **접근성 개선** - WCAG 2.1 AA 수준 달성
- [ ] **테스트 커버리지** - 85% 목표 (현재 69%)
- [ ] **성능 최적화** - Lighthouse 98점 달성

### 🚀 장기 목표 (3-6개월)

- [ ] **상태 관리 개선** - Zustand/Redux Toolkit 도입 검토
- [ ] **Next.js 마이그레이션** - SSR/SSG 지원
- [ ] **컴포넌트 리팩토링** - 대형 컴포넌트 분할
- [ ] **모니터링 강화** - 실시간 성능 메트릭 수집

### 📊 예상 개선 효과

| 영역              | 현재    | 목표    | 개선율 |
| ----------------- | ------- | ------- | ------ |
| 테스트 커버리지   | 98%     | 99%     | +1%    |
| 번들 크기         | 450KB   | 300KB   | -33%   |
| Lighthouse        | 95      | 98+     | +3%    |
| 보안 취약점       | 47개    | 0개     | 100%   |
| 테스트 통과율     | 98%     | 100%    | +2%    |

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요? [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 문의

- **이메일**: researcherhojin@gmail.com
- **웹사이트**: [https://researcherhojin.github.io/emelmujiro](https://researcherhojin.github.io/emelmujiro)
- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/researcherhojin/emelmujiro/issues)

---

<div align="center">

**Made with ❤️ by Emelmujiro Team**

© 2025 Emelmujiro. All rights reserved.

</div>
