# 에멜무지로 (Emelmujiro) 공식 웹사이트

AI 교육 및 컨설팅 전문 기업 에멜무지로의 공식 웹사이트입니다.

## 📖 프로젝트 개요

에멜무지로는 2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로, 각 기업의 특성에 맞는 맞춤형 AI 솔루션을 제공하는 전문 컨설팅 기업입니다.

🔗 **라이브 사이트**: https://researcherhojin.github.io/emelmujiro

## 🚀 빠른 시작

```bash
# 저장소 클론
git clone https://github.com/researcherhojin/emelmujiro.git
cd emelmujiro

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 접속
# Frontend: http://localhost:3000/emelmujiro
# Backend: http://localhost:8000 (선택사항)
```

## 🛠 기술 스택

### Frontend
- **React** 18.2.0 + **TypeScript** - 모던 웹 애플리케이션
- **Tailwind CSS** 3.4.1 - 유틸리티 기반 스타일링
- **Framer Motion** 11.15.0 - 애니메이션
- **React Router** 6.20.0 (HashRouter) - SPA 라우팅
- **Context API** - 상태 관리

### Backend (선택사항)
- **Django** 5.1.5 + **Django REST Framework** - API 서버
- **SQLite** (개발) / **PostgreSQL** (프로덕션)
- **Gunicorn** + **WhiteNoise** - 프로덕션 서빙

### DevOps
- **GitHub Actions** - CI/CD 자동화
- **GitHub Pages** - 정적 호스팅
- **Docker** & **Docker Compose** - 컨테이너화

## 🎯 주요 기능

### 핵심 기능
- ✅ **완전 반응형 디자인** - 모든 디바이스 최적화
- ✅ **PWA 지원** - 오프라인 작동, 앱 설치 가능
- ✅ **블로그 시스템** - 마크다운 지원, 검색, 댓글, 좋아요
- ✅ **문의 폼** - 백그라운드 동기화, 오프라인 지원
- ✅ **다크 모드** - 시스템 설정 연동

### 블로그 기능 (NEW!)
- 📝 **글 작성/편집** - 마크다운 에디터, 실시간 미리보기
- 🔍 **검색 시스템** - 제목, 내용, 태그 검색
- 💬 **댓글 시스템** - 답글, 좋아요 기능
- ❤️ **상호작용** - 좋아요, 북마크, 소셜 공유
- 📤 **Import/Export** - JSON 형식으로 백업/복원

### 성능 최적화
- ⚡ **코드 스플리팅** - React.lazy 동적 임포트
- 🖼️ **이미지 최적화** - Lazy loading, WebP 지원
- 📦 **Service Worker** - 리소스 캐싱, 오프라인 모드
- 🚀 **번들 최적화** - Tree shaking, PurgeCSS

## 📁 프로젝트 구조

```
emelmujiro/
├── frontend/                   # React 애플리케이션
│   ├── public/                # 정적 파일
│   │   ├── index.html         
│   │   ├── manifest.json      # PWA 설정
│   │   └── service-worker.js  # 오프라인 지원
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── blog/         # 블로그 관련
│   │   │   ├── common/       # 공통 컴포넌트
│   │   │   ├── layout/       # 레이아웃
│   │   │   └── pages/        # 페이지
│   │   ├── contexts/         # Context API
│   │   ├── data/            # 로컬 데이터
│   │   ├── services/        # API 서비스
│   │   └── types/           # TypeScript 타입
│   └── package.json
├── backend/                   # Django API (선택사항)
│   ├── api/                 # API 앱
│   ├── config/              # 설정
│   └── requirements.txt
├── .github/
│   └── workflows/           # GitHub Actions
│       └── deploy-gh-pages.yml
└── README.md
```

## 🌐 페이지 구조

- **홈** (`/`) - 회사 소개, 서비스, 통계
- **회사소개** (`/about`) - 연혁, 핵심 가치, 파트너사
- **대표 프로필** (`/profile`) - 이력, 전문 분야
- **블로그** (`/blog`) - 기술 블로그, 인사이트
- **문의하기** (`/contact`) - 프로젝트 문의

## 💡 블로그 사용 가이드

### 관리자 모드 활성화
```
http://localhost:3000/emelmujiro/blog/new?admin=true
```

### 글 작성
1. 관리자 모드에서 "글쓰기" 버튼 클릭
2. 마크다운 에디터로 작성
3. 실시간 미리보기 확인
4. 저장 (localStorage)

### 데이터 관리
- **JSON 내보내기**: 포스트 백업
- **JSON 가져오기**: 포스트 복원
- **영구 저장**: `src/data/blogPosts.js`에 추가 후 배포

## 🔧 개발 환경 설정

### 환경 변수
```bash
# frontend/.env.development
HTTPS=false
PORT=3000
REACT_APP_API_URL=http://127.0.0.1:8001/api/

# backend/.env (선택사항)
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
```

### 주요 스크립트
```bash
# 개발
npm run dev              # Frontend + Backend
npm start               # Frontend만

# 빌드 & 배포
npm run build           # 프로덕션 빌드
npm run deploy          # GitHub Pages 배포

# 테스트
npm test               # 단위 테스트
npm run test:e2e       # E2E 테스트
npm run test:coverage  # 커버리지 리포트
```

## 🚀 배포

### GitHub Pages (현재)
- **자동 배포**: main 브랜치 push 시
- **URL**: https://researcherhojin.github.io/emelmujiro
- **설정**: HashRouter 사용 (SPA 라우팅)

### 다른 플랫폼 배포 옵션
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Docker
docker build -t emelmujiro .
docker run -p 3000:80 emelmujiro
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 3000/8000 포트 확인 및 종료
lsof -i :3000
kill -9 [PID]
```

### 빌드 오류
```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CORS 이슈
- 개발 환경: proxy 설정 (`package.json`)
- 프로덕션: Django CORS 설정

## 📊 성능 지표

- **Lighthouse 점수**
  - Performance: 95+
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100
  - PWA: 100

## 🔄 최근 업데이트 (2025.08)

### Phase 11: TypeScript & 블로그 시스템
- ✅ TypeScript 도입 (부분 마이그레이션)
- ✅ Context API 상태 관리 구현
- ✅ 블로그 CRUD 기능 (localStorage)
- ✅ 검색, 댓글, 좋아요 시스템
- ✅ JSON Import/Export
- ✅ 관리자 모드

### Phase 12: 버그 수정 & 안정화
- ✅ localStorage 에러 핸들링
- ✅ TypeScript 타입 안전성
- ✅ 날짜 정렬 버그 수정
- ✅ 파일 업로드 검증

### Phase 13: 테스트 커버리지 개선 (2025.08.07)
- ✅ Jest 테스트 실패 수정 (48개 → 7개, 85% 개선)
- ✅ IntersectionObserver 전역 mock 수정
- ✅ ContactPage 테스트 한국어 지원
- ✅ API 테스트 axios mock 간소화
- ✅ ErrorBoundary 테스트 개선
- ✅ Button 컴포넌트 className 결합 로직 수정
- ✅ Security utils 엣지 케이스 처리
- ✅ 테스트 환경 TypeScript 지원 강화

## 🤝 기여하기

1. Fork the Project
2. Create Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit Changes (`git commit -m 'feat: Add NewFeature'`)
4. Push to Branch (`git push origin feature/NewFeature`)
5. Open Pull Request

### 커밋 컨벤션
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가
- `chore:` 기타 변경사항

## 📞 연락처

- **회사명**: 에멜무지로 (Emelmujiro)
- **이메일**: researcherhojin@gmail.com
- **전화**: 010-7279-0380
- **웹사이트**: https://researcherhojin.github.io/emelmujiro

## 📄 라이센스

MIT License - 자세한 내용은 `LICENSE` 파일 참조

---

**에멜무지로** - AI 기술의 대중화를 선도하는 전문 컨설팅 기업