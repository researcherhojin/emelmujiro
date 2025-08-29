# 🚀 에멜무지로 (Emelmujiro) - AI 교육 & 컨설팅 플랫폼

<div align="center">

[![CI/CD Pipeline](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml/badge.svg)](https://github.com/researcherhojin/emelmujiro/actions/workflows/main-ci-cd.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-94.8%25-brightgreen)](https://github.com/researcherhojin/emelmujiro)
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

## 🎯 프로젝트 현황 (2025.08.29 v3.7.0)

### 📊 성과 지표

| 항목                  | 상태        | 세부 내용                                    |
| --------------------- | ----------- | -------------------------------------------- |
| **CI/CD 파이프라인**  | ✅ 정상     | GitHub Actions 완전 자동화, 배포 성공        |
| **테스트 프레임워크** | ✅ Vitest   | Jest → Vitest 마이그레이션 완료              |
| **테스트 통과율**     | ✅ 100%     | 1471/1471 테스트 통과 (90개 테스트 파일)     |
| **TypeScript 전환**   | ✅ 100%     | Strict mode, 타입 에러 0건                   |
| **번들 최적화**       | ✅ 완료     | 206KB (gzipped: 67KB), Vite 코드 분할        |
| **Lighthouse Score**  | ✅ 95+/100  | 성능, 접근성, SEO 최적화                     |
| **ESLint 경고**       | ✅ 0건      | 492건→6건→0건 (100% 해결, 타입 안전성 강화)  |
| **보안 취약점**       | ✅ 0건      | 47건→0건 (100% 해결, Vite 완전 마이그레이션) |
| **배포 상태**         | ✅ 운영중   | GitHub Pages 자동 배포                       |
| **빌드 도구**         | ✅ Vite 7.1 | CRA → Vite 마이그레이션 완료 (빌드 10초)     |

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

- **Core**: React 18.2 + TypeScript 5.9 (100% 타입 안전)
- **Build Tool**: Vite 7.1 (빌드 속도 10초 미만)
- **Styling**: Tailwind CSS 3.3 + Framer Motion 11
- **State**: Context API (UIContext, BlogContext, AuthContext, FormContext)
- **Routing**: React Router 6 (HashRouter)
- **i18n**: 한국어/영어 다국어 지원
- **PWA**: Service Worker + 오프라인 지원
- **Icons**: Lucide React 0.539

### Backend

- **Framework**: Django 5.2.5 + Django REST Framework
- **Auth**: JWT (djangorestframework-simplejwt)
- **WebSocket**: Django Channels 4.3.1 + Daphne 4.2.1
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **API Docs**: Swagger/OpenAPI 자동 생성

### DevOps & Testing

- **CI/CD**: GitHub Actions (완전 자동화된 파이프라인) - [상세 문서](CI-CD-README.md)
- **Testing**: Vitest 3.2 + React Testing Library (94.8% 통과율)
- **E2E**: Playwright (주요 플로우 테스트)
- **Security**: 0개 보안 취약점 (완전 해결)
- **Monitoring**: Sentry 10.7 (실시간 에러 추적)
- **Hosting**: GitHub Pages (정적 호스팅)
- **Package Manager**: npm 9.x
- **Docker**: Multi-stage builds 지원

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
- **테스트 통과율**: 94.8% (1,508/1,589)
- **의존성 패키지**: 61개 (프로덕션: 18개, 개발: 43개)

### 🛡️ 코드 품질

- **TypeScript**: 100% 적용, Strict Mode
- **ESLint**: 0개 경고 및 에러 (100% 해결)
- **테스트 커버리지**: 주요 컴포넌트 90%+ 커버
- **접근성**: ARIA 속성, 키보드 네비게이션 지원

## 🔄 최근 업데이트 (v3.7.0)

### 2025.08.29 - Vite 마이그레이션 완료 및 안정화

#### ✅ 개선 사항

- **Tailwind CSS v3 호환성 문제 해결**:
  - PostCSS 설정을 Tailwind v3 형식으로 수정
  - v4 알파 버전에서 v3.4.17 안정 버전으로 다운그레이드
- **Service Worker 캐싱 전략 개선**:
  - 개발 환경에서 Service Worker 비활성화
  - 프로덕션 환경에서만 캐싱 활성화
  - 캐시 버전 v5로 업데이트
- **Vite 엔트리 포인트 정리**:
  - index.tsx를 main.tsx로 이름 변경
  - index.html의 스크립트 경로 수정
- **리소스 경로 수정**:
  - manifest.json의 모든 아이콘 경로에 /emelmujiro/ prefix 추가
  - HTML preload 및 apple-touch-icon 경로 수정
- **미사용 의존성 제거**:
  - @sentry/integrations, @babel/\*, webpack 관련 패키지 10개 제거
  - 번들 크기 최적화

### 2025.08.28 (저녁) - ESLint 경고 완전 제거

#### ✅ 개선 사항

##### **setupTests.ts 타입 안전성 강화**

- **모든 `any` 타입 제거**: 구체적인 타입으로 교체
  - React 컴포넌트: `React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>`
  - DOM 요소: `Element | HTMLElement | null`
  - CSS 스타일: `CSSStyleDeclaration`
- **ESLint 경고**: 6개 → 0개 (100% 해결)
- **TypeScript 컴파일**: 에러 없음
- **테스트 안정성**: 1471/1471 테스트 통과 유지

### 2025.08.28 (오후) - 전체 코드베이스 디버깅 및 최적화

#### ✅ 디버깅 완료 항목

##### 1. **코드 품질 개선**

- **console 문 제거**: 프로덕션 코드의 모든 console.log/error/warn을 logger 유틸리티로 교체
  - 영향받은 파일: 7개 (ChatContext, AdminDashboard, MessageList, FileUpload, webVitals, InstallPrompt)
  - 성능 향상: 프로덕션 환경에서 불필요한 콘솔 출력 제거
- **TypeScript 타입 안전성**: 모든 타입 에러 해결 (0건)
- **ESLint 경고**: 6개 경고 (setupTests.ts의 any 타입) - 테스트 파일이므로 허용

##### 2. **보안 개선**

- **보안 취약점**: npm audit 0건 (완전 해결)
- **하드코딩된 시크릿**: 없음 (테스트 파일의 mock 토큰만 존재)
- **XSS 방지**: dangerouslySetInnerHTML 사용 없음 (security.ts의 안전한 사용만 확인)

##### 3. **성능 최적화**

- **번들 크기**: 206.14 kB (gzip: 67.40 kB) - 최적화 완료
- **코드 스플리팅**: 적절한 lazy loading 적용
- **React.memo**: 주요 컴포넌트에 적용됨
- **메모리 누수 방지**: 모든 useEffect에 cleanup 함수 확인

##### 4. **테스트 커버리지**

- **테스트 통과율**: 100% (1471/1471 테스트)
- **테스트 파일**: 90개 모두 통과
- **실행 시간**: ~25초
- **테스트 프레임워크**: Vitest (Jest에서 마이그레이션 완료)

##### 5. **의존성 관리**

- **사용하지 않는 의존성 발견**:
  - @sentry/integrations (프로덕션)
  - 여러 개발 의존성 (babel, webpack 관련 - Vite 마이그레이션 후 불필요)
- **누락된 의존성**: sharp (이미지 최적화 스크립트용)

#### 🔧 적용된 개선사항

```javascript
// Before: console 직접 사용
console.error('Failed to load chat history:', error);

// After: logger 유틸리티 사용
import logger from '../utils/logger';
logger.error('Failed to load chat history:', error);
```

#### 📈 성능 지표

| 메트릭          | 이전    | 현재  | 개선율  |
| --------------- | ------- | ----- | ------- |
| 빌드 시간       | 60-90초 | ~10초 | 85% ↓   |
| 번들 크기       | ~500KB  | 206KB | 59% ↓   |
| 테스트 통과율   | 94.8%   | 100%  | 5.2% ↑  |
| TypeScript 에러 | 수십 건 | 0건   | 100% ↓  |
| ESLint 경고     | 492건   | 6건   | 98.8% ↓ |
| 보안 취약점     | 47건    | 0건   | 100% ↓  |

### 2025.08.28 (오전) - ESLint 완전 해결 및 README 업데이트

#### ✅ 주요 성과

- **ESLint 0건 달성**: 모든 경고 및 에러 해결 (492건→0건)
- **타입 안전성 강화**: any 타입 완전 제거
- **테스트 안정화**: 타임아웃 이슈 해결
- **문서 업데이트**: 현재 프로젝트 상태 반영

### 2025.08.28 - Vitest 마이그레이션 및 테스트 안정화

#### ✅ 주요 성과

- **Vitest 마이그레이션**: Jest → Vitest 완전 전환
- **lucide-react Mock 최적화**: Proxy 패턴으로 동적 아이콘 처리
- **테스트 파일 구문 오류 해결**: ContactPage 등 주요 테스트 파일 수정
- **setupTests 개선**: Vitest 환경에 최적화된 설정
- **CI 환경 최적화**: 메모리 사용량 개선

### 2025.08.25 - CI/CD 파이프라인 완전 복구 및 Vite 안정화

#### ✅ 주요 성과

- **CI/CD 파이프라인 복구**: 모든 빌드 및 배포 프로세스 정상화
- **TypeScript 에러 해결**: require, process, global 타입 문제 모두 해결
- **테스트 안정화**: 94.8% 테스트 통과율 (serviceWorker, WebSocket 일부 이슈)
- **GitHub Pages 배포**: 자동 배포 성공

### 2025.08.24 - Vite 마이그레이션 및 보안 취약점 완전 해결

#### ✅ 주요 성과

- **Vite 마이그레이션 완료**: Create React App → Vite
- **보안 취약점 0개**: 9개 취약점 완전 해결
- **개발 서버 성능**: 10-30초 → 171ms (175배 향상)
- **빌드 성능**: 60-90초 → ~10초 (6-9배 향상)
- **번들 최적화**: 효율적인 코드 스플리팅

### 2025.08.23 - 전체 코드베이스 최적화 및 안정화

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

## 🚧 향후 개선 로드맵

### 📌 단기 목표 (1-2주)

- [x] **~~React-Scripts 대체~~** - ✅ Vite 마이그레이션 완료 (2025.81.24)
- [x] **~~ESLint 경고 완전 제거~~** - ✅ 0건 달성 (2025.08.28)
- [x] **~~테스트 안정화~~** - ✅ 100% 테스트 통과 달성 (2025.08.28)
- [x] **~~프로덕션 콘솔 제거~~** - ✅ Logger 유틸리티로 교체 완료 (2025.08.28)
- [ ] **미사용 의존성 제거** - @sentry/integrations, babel/webpack 관련 패키지

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
- ✅ ESLint 에러 및 경고 없음 (0건)
- ✅ 대부분 테스트 통과 (94.8%)
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
