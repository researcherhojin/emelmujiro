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
- **npm workspaces** - Monorepo 관리
- **Makefile** - 자동화 스크립트

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
│       ├── ci.yml          # CI 파이프라인
│       └── cd.yml          # CD 파이프라인
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
├── Makefile                # 자동화 명령어
└── README.md               # 프로젝트 문서
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

### 성능 최적화
- **코드 스플리팅** - React.lazy를 통한 번들 최적화
- **이미지 최적화** - 최적화된 이미지 로딩
- **CSS 최적화** - Tailwind CSS의 PurgeCSS 적용

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

#### 방법 1: Docker 사용 (권장)
```bash
# Docker 환경에서 실행
make dev

# 또는 포트 충돌 시
make dev-clean
```

#### 방법 2: 로컬 실행
```bash
# Monorepo 스크립트로 실행
npm run dev

# 또는 개별 실행
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

### Frontend
- **플랫폼**: Netlify
- **빌드 명령어**: `npm run build`
- **배포 디렉토리**: `build/`

### Backend
- **플랫폼**: Heroku
- **데이터베이스**: PostgreSQL
- **정적 파일**: AWS S3 (선택사항)

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