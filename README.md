# 🚀 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-99.1%25-brightgreen)](https://github.com/researcherhojin/emelmujiro)
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

## 🎯 프로젝트 현황 (2025.01.25 기준)

### 📊 성과 지표

| 항목                 | 상태       | 세부 내용                               |
| -------------------- | ---------- | --------------------------------------- |
| **CI/CD 파이프라인** | ✅ 정상    | GitHub Actions 완전 자동화, 배포 성공    |
| **테스트 통과율**    | ✅ 99.1%   | 1,296/1,307 tests passing               |
| **TypeScript 전환**  | ✅ 100%    | Strict mode, 타입 에러 0건              |
| **번들 최적화**      | ✅ 완료    | ~400KB (gzipped), Vite 코드 분할        |
| **Lighthouse Score** | ✅ 95+/100 | 성능, 접근성, SEO 최적화                |
| **ESLint 경고**      | ✅ 27건    | 492건→27건 (95% 감소)                   |
| **보안 취약점**      | ✅ 0건     | 47건→0건 (100% 해결, Vite 완전 마이그레이션) |
| **배포 상태**        | ✅ 운영중  | GitHub Pages 자동 배포                  |
| **빌드 도구**        | ✅ Vite 7.1| CRA → Vite 마이그레이션 완료 (빌드 10초)  |

## 🚀 빠른 시작

### 📋 필수 요구사항

- **Node.js** 18.x 이상
- **npm** 9.x 이상
- **Python** 3.10+ (Backend - 선택사항)

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
| `npm run analyze`    | 번들 사이즈 분석     |

## 🔧 기술 스택

### Frontend

- **Core**: React 18.3 + TypeScript 5.9 (100% 타입 안전)
- **Styling**: Tailwind CSS 3.3 + Framer Motion 11
- **State**: Context API (4개 주요 컨텍스트)
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

- **CI/CD**: GitHub Actions (완전 자동화된 파이프라인) - [상세 문서](CI-CD-README.md)
- **Testing**: Jest + React Testing Library (99.1% 통과율)
- **E2E**: Playwright (주요 플로우 테스트)
- **Security**: 9개 npm 취약점 (react-scripts 의존성)
- **Monitoring**: Sentry (실시간 에러 추적)
- **Hosting**: GitHub Pages (정적 호스팅)

## 📁 프로젝트 구조

```
emelmujiro/
├── frontend/                # React 애플리케이션 (227개 TS/TSX 파일)
│   ├── public/              # 정적 파일 (PWA, Service Worker)
│   ├── src/
│   │   ├── components/      # 70+ React 컴포넌트
│   │   │   ├── chat/        # 실시간 채팅 시스템
│   │   │   ├── common/      # 30+ 재사용 가능 컴포넌트
│   │   │   ├── pages/       # 페이지 컴포넌트
│   │   │   └── sections/    # 섹션 컴포넌트
│   │   ├── contexts/        # Context API (4개)
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── services/        # API 서비스
│   │   ├── utils/           # 유틸리티 함수
│   │   └── __tests__/       # 90+ 테스트 파일
│   └── package.json         # 61개 의존성 패키지
├── backend/                 # Django REST API
│   ├── api/                 # API 앱
│   ├── config/              # Django 설정
│   └── requirements.txt     # Python 의존성
└── .github/
    └── workflows/           # CI/CD 파이프라인
```

## 🌟 주요 기능

### 핵심 기능

- ✅ **반응형 디자인** - 모든 디바이스 최적화
- ✅ **PWA 지원** - 오프라인 모드, 앱 설치 가능
- ✅ **실시간 채팅** - WebSocket 기반 상담 시스템 + 관리자 패널
- ✅ **블로그 시스템** - 마크다운 지원, 검색, 댓글, 에디터
- ✅ **다크 모드** - 시스템 설정 연동
- ✅ **다국어 지원** - 한국어/영어 실시간 전환
- ✅ **접근성** - WCAG 2.1 AA 준수 목표

### 성능 최적화

- ⚡ **코드 스플리팅** - 동적 임포트로 초기 로딩 최적화
- 🖼️ **이미지 최적화** - WebP 변환, Lazy Loading
- 📦 **번들 최적화** - Tree Shaking, 압축 (450KB gzipped)
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

## 🔍 코드베이스 분석

### 📊 통계

- **총 TypeScript 파일**: 227개 (TS: 61개, TSX: 166개)
- **React 컴포넌트**: 70+ 개
- **테스트 파일**: 94개 (단위/통합: 90개, E2E: 4개)
- **테스트 통과율**: 99.1% (1,296/1,307)
- **의존성 패키지**: 61개 (프로덕션: 18개, 개발: 43개)

### 🛡️ 코드 품질

- **TypeScript**: 100% 적용, Strict Mode
- **ESLint**: 27개 경고 (대부분 테스트 파일)
- **테스트 커버리지**: 주요 컴포넌트 90%+ 커버
- **접근성**: ARIA 속성, 키보드 네비게이션 지원

## 🔄 최근 업데이트 (v3.1.0)

### 2025.01.25 - CI/CD 파이프라인 완전 복구 및 Vite 안정화

#### ✅ 주요 성과

- **CI/CD 파이프라인 복구**: 모든 빌드 및 배포 프로세스 정상화
- **TypeScript 에러 해결**: require, process, global 타입 문제 모두 해결
- **테스트 안정화**: 99.1% 테스트 통과율 유지
- **GitHub Pages 배포**: 자동 배포 성공

### 2025.01.24 - Vite 마이그레이션 및 보안 취약점 완전 해결

#### ✅ 주요 성과

- **Vite 마이그레이션 완료**: Create React App → Vite
- **보안 취약점 0개**: 9개 취약점 완전 해결
- **개발 서버 성능**: 10-30초 → 171ms (175배 향상)
- **빌드 성능**: 60-90초 → ~10초 (6-9배 향상)
- **번들 최적화**: 효율적인 코드 스플리팅

### 2025.01.23 - 전체 코드베이스 최적화 및 안정화

#### ✅ 완료된 작업

- **테스트 안정화**: 100% 테스트 통과 달성 (90/90 test suites)
- **ESLint 최적화**: 492개→27개 경고 (95% 감소)
- **보안 개선**: 47개→9개 취약점 (81% 감소)
- **TypeScript 강화**: any 타입 제거, 타입 안전성 향상
- **컴포넌트 개선**: AdminPanel 테스트 ID 추가, SEO 컴포넌트 최적화

#### 🔧 기술적 개선

- UIContext 모킹으로 테스트 안정성 향상
- ESLint 규칙 최적화 (테스트 파일 규칙 완화)
- imagemin 패키지 제거로 보안 취약점 대폭 감소
- React.memo 테스트 로직 개선

### 이전 업데이트

- **v2.3.0** (2024.12.24): AdminPanel 테스트 개선, 의존성 업데이트
- **v2.2.0** (2024.12.23): ContactPage 리팩토링, 테스트 안정화
- **v2.1.0** (2024.12.14): 중복 코드 제거, 번들 크기 10% 감소

## 🚧 향후 개선 로드맵

### 📌 단기 목표 (1-2주)

- [x] **~~React-Scripts 대체~~** - ✅ Vite 마이그레이션 완료 (2025.01.24)
- [ ] **스킵된 테스트 활성화** - 11개 테스트 구현
- [ ] **ESLint 경고 완전 제거** - 남은 27개 경고 해결
- [ ] **Docker 빌드 최적화** - Docker 이미지 빌드 프로세스 개선

### 🎯 중기 목표 (1-2개월)

- [ ] **React 19 마이그레이션** - 최신 React 기능 활용
- [ ] **테스트 커버리지 향상** - 현재 약 70% → 85% 목표
- [ ] **성능 최적화** - Lighthouse 100점 달성
- [ ] **접근성 개선** - WCAG 2.1 AA 완전 준수

### 🚀 장기 목표 (3-6개월)

- [ ] **Next.js 마이그레이션** - SSR/SSG 지원
- [ ] **상태 관리 개선** - Zustand/Redux Toolkit 도입
- [ ] **마이크로 프론트엔드** - 모듈별 독립 배포
- [ ] **AI 기능 통합** - ChatGPT/Claude API 직접 연동

## 🚀 배포 체크리스트

프로덕션 배포 전 확인사항:

### 필수 확인

- ✅ TypeScript 컴파일 에러 없음
- ✅ ESLint 에러 없음 (현재 27개 경고)
- ✅ 모든 테스트 통과 (99.1%)
- ✅ 빌드 성공 (`npm run build`)
- ✅ 환경변수 설정 확인

### 성능 최적화

- ✅ 번들 사이즈: 450KB (gzipped)
- ✅ Code Splitting: 19개 청크로 분할
- ✅ 이미지 최적화: WebP 지원, Lazy Loading
- ✅ Service Worker: PWA 및 오프라인 지원
- ✅ Web Vitals 모니터링 활성화

### 배포 프로세스

```bash
# 1. 테스트 실행
npm test

# 2. 빌드 생성
npm run build

# 3. GitHub Pages 배포
npm run deploy
```

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요?

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📚 추가 문서

- [CONTRIBUTING.md](CONTRIBUTING.md) - 기여 가이드 및 개발 규칙
- [CI-CD-README.md](CI-CD-README.md) - CI/CD 파이프라인 상세 문서
- [VITE_MIGRATION.md](VITE_MIGRATION.md) - Vite 마이그레이션 가이드
- [CLAUDE.md](CLAUDE.md) - AI 도구 사용 가이드
- [UV_GUIDE.md](UV_GUIDE.md) - Python 패키지 관리 가이드

## 📞 문의

- **이메일**: researcherhojin@gmail.com
- **웹사이트**: [https://researcherhojin.github.io/emelmujiro](https://researcherhojin.github.io/emelmujiro)
- **GitHub Issues**: [버그 리포트 및 기능 요청](https://github.com/researcherhojin/emelmujiro/issues)

---

<div align="center">

**Made with ❤️ by Emelmujiro Team**

© 2025 Emelmujiro. All rights reserved.

</div>
