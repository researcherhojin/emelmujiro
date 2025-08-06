# 개발 문서

## 📚 추가 문서

### 🔧 환경 설정 가이드

#### Docker 환경
```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up

# 프로덕션 환경
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 환경 변수 상세
```bash
# Backend (.env)
SECRET_KEY=              # Django 시크릿 키 (50자 이상)
DEBUG=True/False         # 디버그 모드
DATABASE_URL=            # DB 연결 문자열
CORS_ALLOWED_ORIGINS=    # CORS 허용 도메인

# Frontend (.env.development)
REACT_APP_API_URL=       # API 엔드포인트
REACT_APP_GA_ID=         # Google Analytics ID
```

### 🐛 문제 해결 가이드

#### 일반적인 문제

**포트 충돌**
```bash
# 포트 확인 및 종료
lsof -i :3000
kill -9 [PID]
```

**npm 패키지 충돌**
```bash
# 완전 초기화
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm cache clean --force
npm install
```

**Django 마이그레이션 오류**
```bash
# 마이그레이션 리셋
python manage.py migrate --fake-zero
rm -rf api/migrations/
python manage.py makemigrations
python manage.py migrate
```

**Service Worker 캐시 문제**
- Chrome DevTools > Application > Storage
- "Clear site data" 클릭

### 🚀 CI/CD 가이드

#### GitHub Actions
- `.github/workflows/deploy-gh-pages.yml` - 자동 배포
- main 브랜치 push 시 자동 실행
- 빌드 → 테스트 → 배포 순서

#### 수동 배포
```bash
# GitHub Pages
npm run build
npm run deploy

# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=frontend/build
```

### 🔒 보안 가이드

#### 구현된 보안 기능
1. **기본 보안**
   - SECRET_KEY: 환경 변수로 관리
   - DEBUG: 프로덕션에서 False
   - ALLOWED_HOSTS: 허용 도메인만
   - HTTPS 강제 (프로덕션)

2. **API 보안**
   - Rate Limiting (시간당 100회)
   - CORS 설정
   - CSRF 보호
   - XSS/SQL Injection 방지

3. **프론트엔드 보안**
   - Content Security Policy
   - Input Sanitization
   - Secure Headers

### 📈 SEO 가이드

#### 구현된 SEO 기능
1. **메타 태그**
   - 페이지별 고유 title/description
   - Open Graph 태그
   - Twitter Card 태그
   - Google Search Console 인증

2. **구조화된 데이터**
   - Organization Schema
   - BreadcrumbList Schema
   - Person Schema (프로필 페이지)

3. **기술적 SEO**
   - sitemap.xml 자동 생성
   - robots.txt 설정
   - 이미지 alt 텍스트
   - 시맨틱 HTML

#### Google 인덱싱
1. [Google Search Console](https://search.google.com/search-console) 접속
2. URL 검사 도구 사용
3. `https://researcherhojin.github.io/emelmujiro` 입력
4. "인덱싱 요청" 클릭

### 📚 참고 자료

- [React 공식 문서](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Django REST Framework](https://www.django-rest-framework.org)
- [GitHub Pages 문서](https://docs.github.com/pages)
- [Google Search Console](https://search.google.com/search-console)
- [web.dev](https://web.dev) - 웹 성능 가이드