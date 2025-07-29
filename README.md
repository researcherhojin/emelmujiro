# 에멀무지로 (Emelmujiro) 공식 웹사이트

AI 교육 및 컨설팅 전문 기업 에멀무지로의 공식 웹사이트입니다.

## 📖 프로젝트 개요

에멀무지로는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 각 기업의 특성에 맞는 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 기업입니다.

## 🌐 GitHub Pages 배포

### 초기 설정 (한 번만 수행)
1. GitHub 저장소 설정 페이지로 이동: `Settings` → `Pages`
2. Source를 `GitHub Actions`로 설정
3. 저장

### 자동 배포
- `main` 브랜치에 push하면 자동으로 배포됩니다
- 배포 URL: https://researcherhojin.github.io/emelmujiro
- 현재 Frontend만 배포 (Backend API는 별도 호스팅 필요)

## 🛠 기술 스택

### Frontend
- **React** 18.2.0 - 사용자 인터페이스 구성
- **Tailwind CSS** 3.4.1 - 유틸리티 우선 CSS 프레임워크
- **Framer Motion** 10.16.16 - 애니메이션 및 전환 효과
- **React Router** 6.8.1 - 클라이언트 사이드 라우팅
- **Lucide React** 0.263.1 - 현대적인 아이콘 라이브러리

### Backend
- **Django** 5.1.5 - 웹 프레임워크
- **Django REST Framework** 3.15.2 - API 개발
- **SQLite** (개발) / **PostgreSQL** (프로덕션) - 데이터베이스
- **Django CORS Headers** - CORS 설정
- **Gunicorn** - WSGI HTTP 서버
- **WhiteNoise** - 정적 파일 서빙

### DevOps & CI/CD
- **Docker** & **Docker Compose** - 컨테이너화 및 오케스트레이션
- **GitHub Actions** - CI/CD 파이프라인
- **GitHub Pages** - Frontend 호스팅
- **npm workspaces** - Monorepo 관리
- **Makefile** - 자동화 스크립트
- **Husky** & **lint-staged** - Git hooks 자동화

### 개발 도구
- **Create React App** - 프로젝트 부트스트래핑
- **PostCSS** & **Autoprefixer** - CSS 후처리
- **ESLint** & **Prettier** - 코드 품질 및 포맷팅 (Frontend)
- **Black** & **Flake8** - 코드 포맷팅 및 린팅 (Backend)
- **Husky** & **lint-staged** - Git hooks 자동화

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: 모노크롬 스케일 (블랙, 다크 그레이, 라이트 그레이, 화이트)
- **Accent**: 회사 브랜드에 맞는 절제된 색상 사용
- **UI Colors**: 사용자 경험을 위한 중성적 색상

### 타이포그래피
- **Primary Font**: Pretendard (한글 최적화)
- **Font Scale**: 반응형 타이포그래피 시스템
- **Line Height**: 가독성 최적화된 줄 간격

## 📁 프로젝트 구조

```
emelmujiro/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       ├── test.yml        # 기본 테스트 워크플로우
│       ├── ci-simple.yml   # 간단한 CI 파이프라인
│       ├── deploy-gh-pages.yml # GitHub Pages 배포
│       ├── ci.yml          # 고급 CI (비활성화)
│       ├── cd.yml          # CD 파이프라인 (비활성화)
│       ├── cd-simple.yml   # 간단한 CD (비활성화)
│       └── build-test.yml  # Docker 빌드 테스트 (비활성화)
├── frontend/                # React 기반 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # 공통 컴포넌트
│   │   │   ├── pages/       # 페이지 컴포넌트
│   │   │   └── sections/    # 섹션 컴포넌트
│   │   ├── styles/
│   │   │   └── theme.js     # 디자인 시스템
│   │   └── assets/
│   ├── public/
│   ├── Dockerfile          # 프로덕션 이미지
│   └── Dockerfile.dev      # 개발 이미지
├── backend/                 # Django 기반 백엔드
│   ├── api/                 # API 앱
│   ├── config/              # Django 설정
│   ├── requirements.txt
│   ├── Dockerfile          # 프로덕션 이미지
│   └── Dockerfile.dev      # 개발 이미지
├── scripts/                 # 유틸리티 스크립트
│   ├── check-ports.sh      # 포트 확인
│   ├── kill-ports.sh       # 포트 정리
│   └── start-dev.sh        # 개발 환경 시작
├── docker-compose.yml      # 프로덕션 구성
├── docker-compose.dev.yml  # 개발 구성
├── package.json            # Monorepo 설정
├── package-lock.json       # 의존성 잠금 파일
├── Makefile                # 자동화 명령어
├── .env.example            # 환경 변수 예시
├── .eslintrc.js            # ESLint 설정
├── .prettierrc             # Prettier 설정
├── .gitignore              # Git 제외 파일
├── README.md               # 프로젝트 문서
├── CLAUDE.md               # Claude Code 가이드
├── CI-CD-GUIDE.md          # CI/CD 가이드
├── SETUP-GUIDE.md          # 설정 가이드
└── TROUBLESHOOTING.md      # 문제 해결 가이드
```

## 📱 페이지 구조

### 주요 페이지
- **홈페이지** (`/`) - 히어로 섹션, 서비스 소개, 회사 통계
- **회사소개** (`/about`) - 회사 연혁, 핵심 가치, 파트너사
- **대표 프로필** (`/profile`) - 대표 이력, 전문 분야, 경력 사항
- **문의하기** (`/contact`) - 프로젝트 문의 폼, 연락처 정보

### 주요 섹션
- **HeroSection** - 메인 히어로 영역 및 핵심 메시지
- **ServicesSection** - 주요 서비스 (AI 컨설팅, 기업 교육, LLM 솔루션)
- **QuickIntroSection** - 회사 소개 및 통계
- **CTASection** - 행동 유도 섹션

## 🎯 주요 기능

### 사용자 경험
- **완전 반응형 디자인** - 모바일, 태블릿, 데스크톱 최적화
- **부드러운 애니메이션** - Framer Motion 기반 인터랙션
- **SEO 최적화** - React Helmet을 통한 메타데이터 관리
- **접근성 고려** - WCAG 가이드라인 준수
- **PWA 지원** - 오프라인 작동, 앱 설치 가능

### 성능 최적화
- **코드 스플리팅** - React.lazy를 통한 번들 최적화
- **이미지 최적화** - LazyImage 컴포넌트로 지연 로딩
- **CSS 최적화** - Tailwind CSS의 PurgeCSS 적용
- **Service Worker** - 리소스 캐싱 및 오프라인 지원
- **테스트 자동화** - Jest & React Testing Library

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js (v14 이상)
- Python (v3.8 이상)
- Docker & Docker Compose (선택사항)
- npm 7.0 이상 (workspaces 지원)

### 빠른 시작
```bash
# 저장소 클론
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro

# 환경 변수 설정
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 의존성 설치
make install
```

### 개발 환경 실행

#### 방법 1: Monorepo 스크립트 사용 (권장)
```bash
# 의존성 설치
npm install

# Frontend와 Backend 동시 실행
npm run dev

# 포트 충돌 시 자동 정리 후 실행
npm run dev:clean
```

#### 방법 2: Docker 사용
```bash
# Docker 환경에서 실행
make dev-docker

# 또는
docker-compose -f docker-compose.dev.yml up
```

#### 방법 3: 개별 실행
```bash
# Frontend (터미널 1)
cd frontend && npm start

# Backend (터미널 2)
cd backend
python manage.py migrate
python manage.py runserver
```

### 접속 주소
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:8000](http://localhost:8000)
- **Django Admin**: [http://localhost:8000/admin](http://localhost:8000/admin)

## 🔧 개발 기록

### Phase 1: 초기 설정 및 기본 구조
- ✅ Create React App 기반 프로젝트 초기화
- ✅ Tailwind CSS 설정 및 디자인 시스템 구축
- ✅ React Router 설정 및 기본 라우팅
- ✅ 기본 페이지 및 컴포넌트 구조 설계
- ✅ Django REST Framework 백엔드 구축

### Phase 2: 디자인 시스템 리팩토링
- ✅ 블루-퍼플 그라데이션 제거 → 모노크롬 팔레트 적용
- ✅ 중앙 집중식 테마 시스템 구축 (`styles/theme.js`)
- ✅ 모든 컴포넌트에 일관된 디자인 언어 적용
- ✅ CSS 유틸리티 클래스 추가 및 최적화

### Phase 3: UX/UI 개선
- ✅ 타이포그래피 확대 및 가독성 향상
- ✅ 버튼 크기 및 인터랙션 개선
- ✅ 모바일 반응형 최적화
- ✅ 접근성 개선 (포커스 상태, ARIA 레이블)

### Phase 4: 콘텐츠 최적화
- ✅ 회사 정보 일관성 개선
- ✅ 타임라인 정보 팩트 체크 및 수정
- ✅ 중복 CTA 제거 및 사용자 플로우 최적화
- ✅ 텍스트 줄바꿈 및 가독성 개선

### Phase 5: 코드 품질 개선
- ✅ ESLint 경고 해결
- ✅ 사용되지 않는 import 정리
- ✅ 컴포넌트 최적화 및 성능 개선

### Phase 6: Monorepo 및 CI/CD 구축 (2025.07.23)
- ✅ npm workspaces를 이용한 Monorepo 구조 설정
- ✅ GitHub Actions CI/CD 파이프라인 구축
  - `test.yml` - 기본 빌드 및 테스트
  - `ci-simple.yml` - Frontend/Backend 통합 테스트
  - `deploy-gh-pages.yml` - GitHub Pages 자동 배포
- ✅ Docker 및 Docker Compose 설정
  - 개발/프로덕션 환경 분리
  - PostgreSQL, Redis, Nginx 통합
- ✅ 개발 자동화 스크립트 추가
  - Makefile로 명령어 통합
  - 포트 관리 스크립트 (check-ports.sh, kill-ports.sh)
- ✅ Git submodule 문제 해결
  - frontend/backend 폴더가 submodule로 잘못 등록된 문제 수정
  - 모든 소스 코드를 정상적으로 Git에 추가
- ✅ GitHub Actions 오류 해결
  - Git checkout 오류 (exit code 128) 해결
  - Husky CI 환경 충돌 해결
  - npm 캐시 경로 문제 수정
- ✅ GitHub Pages 배포 설정
  - HashRouter로 변경하여 SPA 라우팅 지원
  - gh-pages 패키지 추가 및 배포 스크립트 설정
  - 로고 링크 React Router 호환성 문제 해결

### Phase 7: 대규모 리팩토링 (2025.07.23)
- ✅ **중복 데이터 통합**
  - `src/constants/` 폴더 생성
  - 서비스, 통계, 파트너사, 스킬 데이터를 중앙 집중화
  - 모든 컴포넌트에서 constants 사용으로 일관성 향상
- ✅ **모바일 반응형 대폭 개선**
  - ContactPage: 폼 입력 필드 크기 증가 (py-3, text-base)
  - ProfilePage: 탭 네비게이션 가로 스크롤 및 간격 조정
  - 통계 카드 모바일 최적화
  - scrollbar-hide 유틸리티 클래스 추가
- ✅ **접근성(a11y) 개선**
  - 모든 이미지에 의미있는 alt 텍스트 추가
  - 로고 이미지: 회사 설명 포함
  - 블로그 이미지: 포스트 제목 포함
  - SVG 아이콘에 aria-hidden 속성 추가
- ✅ **공통 컴포넌트 추출**
  - Button 컴포넌트: 다양한 variant와 size 지원
  - Section 컴포넌트: 섹션 레이아웃 표준화
  - LazyImage 컴포넌트: IntersectionObserver 활용 지연 로딩
  - LoadingSpinner, ErrorMessage 컴포넌트 추가
- ✅ **이미지 최적화**
  - LazyImage 컴포넌트로 지연 로딩 구현
  - 로딩 중 placeholder 표시
  - 에러 상태 처리
- ✅ **파트너사 로고 개선**
  - 메인 페이지: 2줄 무한 슬라이딩 애니메이션
  - AboutPage: 동일한 로고 이미지 사용, 무한 슬라이딩 적용
  - 색상 표시 및 호버 효과 추가
- ✅ **ProfilePage 개선**
  - 탭 네비게이션 border 스타일 개선
  - 텍스트 간격 증가로 가독성 향상
  - 학력 날짜 줄바꿈 처리
- ✅ **AboutPage 디자인 통일**
  - 섹션별 배경색 통일 (흰색/연한 회색 번갈아)
  - 파트너사 섹션 제목과 설명 추가
  - CTA 섹션 색상 개선 (bg-gray-900)
- ✅ **ESLint 경고 모두 해결**
  - LazyImage useEffect cleanup 경고 수정
  - 사용하지 않는 변수 및 import 제거
  - 코드 품질 향상

### Phase 8: SEO 및 추가 개선 (2025.07.23)
- ✅ **SEO 최적화**
  - sitemap.xml 업데이트 (2024-01-04 → 2025-07-23)
  - GitHub Pages URL로 변경 (https://researcherhojin.github.io/emelmujiro)
  - 모든 페이지 포함 (/, /about, /profile, /contact)
  - robots.txt의 Sitemap URL 업데이트

### Phase 9: PWA 구현 및 테스트 환경 구축 (2025.07.23)
- ✅ **PWA (Progressive Web App) 완전 구현**
  - manifest.json 한글화 및 최적화
    - 앱 이름: "에멜무지로 - AI 교육 및 컨설팅"
    - 테마 색상: #111827 (다크 그레이)
    - 디스플레이: standalone (앱 모드)
    - 앱 아이콘 및 스플래시 화면 설정
  - Service Worker 구현 (public/service-worker.js)
    - 오프라인 모드 지원
    - 캐싱 전략: 네트워크 우선(API), 캐시 우선(정적 리소스)
    - 자동 캐시 업데이트 및 이전 버전 정리
    - 푸시 알림 지원
    - 백그라운드 동기화
  - PWA 설치 버튼 컴포넌트 추가
    - 브라우저 설치 프롬프트 감지
    - 우측 하단 플로팅 버튼
    - 설치 후 자동 숨김
  - Service Worker 등록 (serviceWorkerRegistration.js)
    - 자동 업데이트 감지
    - 사용자 알림 및 새로고침 프롬프트
  - 푸시 알림 기능 구현
    - pushNotifications.js 유틸리티
    - 알림 권한 요청 컴포넌트
    - 백그라운드 푸시 메시지 처리
  - 백그라운드 동기화 구현
    - backgroundSync.js 유틸리티
    - IndexedDB 통합
    - 오프라인 문의 폼 지원
- ✅ **테스트 환경 구축**
  - 테스트 도구 설치
    - @testing-library/react
    - @testing-library/jest-dom
    - @testing-library/user-event
    - jest-environment-jsdom
  - 테스트 설정 (setupTests.js)
    - window.matchMedia mock
    - IntersectionObserver mock
    - Service Worker mock
    - scrollTo mock
  - 단위 테스트 작성
    - App.test.js: 앱 전체 렌더링 및 네비게이션
    - Button.test.js: 버튼 컴포넌트 (8개 테스트)
    - LazyImage.test.js: 이미지 지연 로딩 (2개 테스트)
    - PWAInstallButton.test.js: PWA 설치 버튼 (2개 테스트)
    - HeroSection.test.js: 히어로 섹션 (3개 테스트)
    - Section.test.js: 섹션 컴포넌트 (5개 테스트)
    - Footer.test.js: 푸터 컴포넌트
    - Navbar.test.js: 네비게이션 바
    - LoadingSpinner.test.js: 로딩 스피너
    - ErrorMessage.test.js: 에러 메시지
    - ServicesSection.test.js: 서비스 섹션
    - ContactPage.test.js: 문의 페이지
  - Framer Motion mock 설정
    - 애니메이션 라이브러리 테스트 환경 대응
  - npm test 스크립트로 테스트 실행 가능
- ✅ **E2E 테스트 환경 구축 (Playwright)**
  - Playwright 설치 및 설정
  - playwright.config.js 구성
    - Chrome, Firefox, Safari 지원
    - 모바일 테스트 지원
  - E2E 테스트 스펙 작성
    - homepage.spec.js: 홈페이지 테스트
    - contact.spec.js: 문의 페이지 테스트
    - pwa.spec.js: PWA 기능 테스트
    - accessibility.spec.js: 접근성 테스트
  - npm run test:e2e 스크립트 추가
- ✅ **성능 모니터링 (Lighthouse CI)**
  - Lighthouse CI 설치 및 설정
  - lighthouserc.js 구성
    - 성능, 접근성, SEO, PWA 점수 측정
    - 임계값 설정
  - GitHub Actions 워크플로우 추가
    - lighthouse-ci.yml: PR 및 푸시 시 자동 실행
  - npm run lhci 스크립트 추가

### Phase 10: SEO 최적화 및 보안 강화 (2025.07.29)
- ✅ **SEO 메타 태그 최적화**
  - Open Graph 태그 개선
    - og:image 추가 (public/og-image.png)
    - og:type을 "website"으로 설정
    - og:locale을 "ko_KR"로 설정
  - Google Search Console 메타 태그 추가
  - 정규 URL (canonical) 설정
  - SEOHelmet 컴포넌트 개선
- ✅ **sitemap.xml 자동 생성**
  - sitemap-generator.js 스크립트 작성
  - npm run build 시 자동 생성
  - 모든 페이지 포함 및 우선순위 설정
  - lastmod 자동 업데이트
- ✅ **보안 강화**
  - Content Security Policy (CSP) 설정
  - security.js 유틸리티 추가
    - XSS 방지를 위한 HTML sanitization
    - URL 유효성 검사
    - 입력값 검증
  - ContactPage 보안 강화
    - 폼 입력값 sanitization
    - 이메일 유효성 검사 강화
  - _headers 파일 추가 (Netlify용)
    - 보안 헤더 설정
    - X-Frame-Options, X-Content-Type-Options 등
- ✅ **의존성 업데이트**
  - npm 패키지 업데이트
  - 보안 취약점 해결
- ✅ **.claude 폴더 Git 추적 제거**
  - .gitignore에 .claude/ 추가
  - 로컬 설정 파일 제외

## 🎨 디자인 특징

### 모노크롬 디자인 시스템
- **깔끔하고 전문적인 느낌** - AI 컨설팅 기업에 적합한 신뢰감 있는 디자인
- **높은 가독성** - 충분한 대비와 여백을 통한 최적의 사용자 경험
- **브랜드 일관성** - 모든 페이지에서 통일된 디자인 언어

### 반응형 디자인
- **Mobile First** - 모바일 우선 설계
- **Flexible Grid** - Tailwind CSS Grid 시스템 활용
- **Adaptive Typography** - 화면 크기별 최적화된 폰트 크기

## 📊 성과 지표

### 사용자 경험
- **로딩 속도**: 최적화된 번들 크기와 코드 스플리팅
- **접근성**: WCAG 2.1 AA 가이드라인 준수
- **SEO**: 구조화된 메타데이터 및 시맨틱 HTML

### 기술적 성과
- **번들 크기 최적화**: Tree Shaking 및 코드 스플리팅 적용
- **크로스 브라우저 호환성**: 모던 브라우저 지원
- **코드 품질**: ESLint 규칙 준수 및 일관된 코드 스타일

## 🔄 향후 개발 계획

상세한 개발 로드맵은 `todo.txt` 파일을 참고하세요.

### 단기 계획 (1-2개월)
- TypeScript 마이그레이션
- 테스트 코드 작성
- 성능 모니터링 도구 연동

### 중기 계획 (3-4개월)
- 블로그 섹션 구현
- 다국어 지원 (i18n)
- PWA 기능 추가

### 장기 계획 (6개월+)
- 백엔드 API 완전 연동
- 사용자 대시보드
- 고급 SEO 최적화

## 🚀 배포

### Frontend (GitHub Pages)
- **URL**: https://researcherhojin.github.io/emelmujiro
- **자동 배포**: main 브랜치 push 시
- **빌드 명령어**: `npm run build`
- **배포 디렉토리**: `frontend/build/`

### Backend (미배포)
- **플랫폼 옵션**: Railway, Render, Heroku
- **데이터베이스**: PostgreSQL
- **정적 파일**: WhiteNoise 또는 S3

## 🛠️ 추가 개발 도구

### Makefile 명령어
```bash
make install        # 전체 의존성 설치
make dev           # Docker로 개발 환경 실행
make dev-clean     # 포트 정리 후 실행
make build         # 프로덕션 빌드
make test          # 테스트 실행
make lint          # 린트 실행
make clean         # 빌드 파일 정리
make ports         # 포트 상태 확인
make kill-ports    # 포트 강제 종료
```

### npm 스크립트
```bash
npm run dev              # Frontend + Backend 동시 실행
npm run dev:clean        # 포트 정리 후 실행
npm run dev:frontend     # Frontend만 실행
npm run dev:backend      # Backend만 실행
npm run build            # Frontend 빌드
npm run test             # 테스트 실행
npm run lint             # ESLint 실행
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 커밋 메시지 컨벤션
```
type(scope): subject

body

footer
```

**예시:**
```
feat(frontend): 검색 기능 구현

- 전역 검색 컴포넌트 추가
- Fuse.js 기반 클라이언트 사이드 검색
- 검색 결과 하이라이팅 기능

Closes #123
```

## 📞 연락처

- **회사명**: 에멀무지로 (Emelmujiro)
- **이메일**: researcherhojin@gmail.com
- **전화**: 010-7279-0380
- **웹사이트**: [emelmujiro.com](https://emelmujiro.com)

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.

---

**에멀무지로** - AI 기술의 대중화를 선도하는 전문 컨설팅 기업