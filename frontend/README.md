# 에멜무지로 (Emelmujiro) - Frontend

AI 교육 및 컨설팅 전문 기업 에멜무지로의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

### Progressive Web App (PWA)
- ✅ 완전한 오프라인 지원
- ✅ 홈 화면에 추가 가능
- ✅ 푸시 알림 지원
- ✅ 백그라운드 동기화
- ✅ 캐싱 전략 구현

### 주요 페이지
- **홈페이지**: 히어로 섹션, 서비스 소개, 파트너 로고
- **회사 소개**: 미션, 비전, 핵심 가치
- **프로필**: 대표 소개 및 경력
- **문의하기**: 오프라인 지원 문의 폼

### 기술 특징
- React 18.2.0 + Tailwind CSS
- 반응형 디자인 (모바일 최적화)
- 지연 로딩 (Lazy Loading)
- 접근성 (WCAG 2.1 AA 준수)
- SEO 최적화

## 🛠 기술 스택

- **프레임워크**: React 18.2.0
- **라우팅**: React Router v6 (HashRouter)
- **스타일링**: Tailwind CSS 3.4.1
- **애니메이션**: Framer Motion 11.0.3
- **아이콘**: Lucide React
- **테스팅**: 
  - Jest + React Testing Library
  - Playwright (E2E)
  - Lighthouse CI (성능 모니터링)

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test

# E2E 테스트 실행
npm run test:e2e

# Lighthouse CI 실행
npm run lhci
```

## 🧪 테스트

### 단위 테스트
```bash
npm test
```

### E2E 테스트
```bash
# Playwright 설치 (최초 1회)
npx playwright install

# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui
```

### 성능 테스트
```bash
# Lighthouse CI 실행
npm run lhci

# 특정 URL 테스트
npm run lhci -- --url=https://example.com
```

## 📱 PWA 기능

### 오프라인 지원
- 모든 정적 자원 캐싱
- 네트워크 우선/캐시 우선 전략
- 오프라인 폴백 페이지

### 푸시 알림
- 알림 권한 요청 UI
- 백그라운드 푸시 메시지 처리
- 알림 클릭 액션 처리

### 백그라운드 동기화
- 오프라인 문의 폼 제출
- 실패한 요청 재시도
- IndexedDB 기반 데이터 저장

## 🚀 배포

### GitHub Pages
```bash
# 빌드 및 배포
npm run deploy
```

### 환경 설정
- `homepage`: package.json에서 설정
- `PUBLIC_URL`: 환경 변수로 설정 가능
- HashRouter 사용 (GitHub Pages 호환)

## 📂 프로젝트 구조

```
src/
├── components/
│   ├── common/        # 재사용 가능한 공통 컴포넌트
│   │   ├── Button.js
│   │   ├── ErrorMessage.js
│   │   ├── Footer.js
│   │   ├── LazyImage.js
│   │   ├── LoadingSpinner.js
│   │   ├── Navbar.js
│   │   ├── NotificationPermission.js
│   │   ├── PageLoading.js
│   │   └── PWAInstallButton.js
│   ├── pages/         # 페이지 컴포넌트
│   │   ├── AboutPage.js
│   │   ├── ContactPage.js
│   │   └── ProfilePage.js
│   └── sections/      # 홈페이지 섹션 컴포넌트
│       ├── CTASection.js
│       ├── HeroSection.js
│       ├── LogosSection.js
│       ├── QuickIntroSection.js
│       └── ServicesSection.js
├── utils/             # 유틸리티 함수
│   ├── backgroundSync.js
│   ├── constants.js
│   └── pushNotifications.js
├── __tests__/         # 테스트 파일
├── App.js
├── App.css
├── index.js
├── index.css
├── serviceWorkerRegistration.js
└── setupTests.js

public/
├── index.html
├── manifest.json
├── service-worker.js
├── favicon.ico
├── logo192.png
├── logo512.png
└── images/

e2e/
├── homepage.spec.js
├── contact.spec.js
├── pwa.spec.js
└── accessibility.spec.js
```

## 🔧 주요 설정 파일

### manifest.json
PWA 설정 파일로 앱 이름, 아이콘, 테마 색상 등을 정의합니다.

### service-worker.js
오프라인 지원, 캐싱 전략, 푸시 알림, 백그라운드 동기화를 처리합니다.

### playwright.config.js
E2E 테스트 설정으로 Chrome, Firefox, Safari 테스트를 지원합니다.

### lighthouserc.js
성능 모니터링 설정으로 성능, 접근성, SEO, PWA 점수를 측정합니다.

## 📈 성능 목표

- **Lighthouse 점수**
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 90+
  - SEO: 90+
  - PWA: 90+

- **Core Web Vitals**
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

- 이메일: researcherhojin@gmail.com
- 전화: 010-7279-0380
- 웹사이트: https://hojinlee.github.io/emelmujiro