# Emelmujiro Monorepo CI/CD 가이드

## 📋 개요

이 문서는 Emelmujiro 프로젝트의 Monorepo CI/CD 설정 및 사용 방법을 설명합니다.

## 🏗️ 프로젝트 구조

```
emelmujiro/
├── .github/workflows/      # GitHub Actions 워크플로우
│   ├── ci.yml             # CI 파이프라인
│   └── cd.yml             # CD 파이프라인
├── frontend/              # React 프론트엔드
│   ├── Dockerfile         # 프로덕션 이미지
│   └── Dockerfile.dev     # 개발 이미지
├── backend/               # Django 백엔드
│   ├── Dockerfile         # 프로덕션 이미지
│   └── Dockerfile.dev     # 개발 이미지
├── docker-compose.yml     # 프로덕션 구성
├── docker-compose.dev.yml # 개발 구성
├── package.json          # Monorepo 워크스페이스 설정
└── Makefile              # 자동화 명령어
```

## 🚀 시작하기

### 1. 초기 설정

```bash
# 의존성 설치
make install

# 환경 변수 설정
cp .env.example .env
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 2. 개발 환경

```bash
# Docker를 사용한 개발 서버 실행
make dev

# 로컬 개발 서버 실행 (Docker 없이)
make dev-local
```

### 3. 코드 품질 검사

```bash
# 린트 실행
make lint

# 린트 자동 수정
make lint-fix
```

## 📦 CI/CD 파이프라인

### CI (Continuous Integration)

**트리거**: main, develop 브랜치에 push 또는 PR

**프론트엔드 테스트**:
- Node.js 18.x, 20.x 버전에서 테스트
- ESLint 검사
- 테스트 실행
- 빌드 검증

**백엔드 테스트**:
- Python 3.10, 3.11, 3.12 버전에서 테스트
- Black 코드 포맷팅 검사
- Flake8 린트 검사
- 테스트 커버리지 측정
- PostgreSQL 데이터베이스 연동 테스트

**보안 검사**:
- Trivy를 사용한 취약점 스캔

### CD (Continuous Deployment)

**트리거**: main 브랜치에 push

**프로세스**:
1. Docker 이미지 빌드
2. GitHub Container Registry에 푸시
3. 환경별 배포
   - develop → staging
   - main → production

## 🐳 Docker 사용법

### 개발 환경

```bash
# 개발 컨테이너 시작
docker-compose -f docker-compose.dev.yml up

# 백그라운드 실행
docker-compose -f docker-compose.dev.yml up -d

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down
```

### 프로덕션 환경

```bash
# 프로덕션 빌드
docker-compose build

# 프로덕션 실행
docker-compose up -d

# 상태 확인
docker-compose ps
```

## 🔧 주요 명령어

### Makefile 명령어

| 명령어 | 설명 |
|--------|------|
| `make install` | 모든 의존성 설치 |
| `make dev` | Docker 개발 환경 실행 |
| `make build` | 프로덕션 이미지 빌드 |
| `make test` | 모든 테스트 실행 |
| `make lint` | 코드 품질 검사 |
| `make clean` | 빌드 아티팩트 정리 |
| `make deploy-staging` | 스테이징 배포 |
| `make deploy-production` | 프로덕션 배포 |

### NPM Scripts

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 프론트엔드와 백엔드 동시 실행 |
| `npm run build` | 프론트엔드 빌드 |
| `npm run test` | 모든 테스트 실행 |
| `npm run lint` | ESLint 실행 |

## 🔐 환경 변수

### 프론트엔드 (.env)
- `REACT_APP_API_URL`: 백엔드 API URL
- `REACT_APP_SITE_NAME`: 사이트 이름
- `REACT_APP_GA_TRACKING_ID`: Google Analytics ID

### 백엔드 (.env)
- `SECRET_KEY`: Django 시크릿 키
- `DATABASE_URL`: 데이터베이스 연결 정보
- `REDIS_URL`: Redis 연결 정보
- `CORS_ALLOWED_ORIGINS`: CORS 허용 도메인

## 🚨 문제 해결

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000  # 프론트엔드
lsof -i :8000  # 백엔드

# 프로세스 종료
kill -9 <PID>
```

### Docker 캐시 정리
```bash
docker system prune -a
docker volume prune
```

### 데이터베이스 마이그레이션
```bash
make migrate
```

## 📝 개발 워크플로우

1. **기능 브랜치 생성**
   ```bash
   git checkout -b feature/새기능
   ```

2. **개발 및 테스트**
   ```bash
   make dev
   make test
   ```

3. **커밋 전 검사**
   - Husky pre-commit 훅이 자동으로 린트 실행
   - 문제가 있으면 자동 수정 시도

4. **PR 생성**
   - CI 파이프라인이 자동으로 실행
   - 모든 검사 통과 필요

5. **머지 및 배포**
   - develop → 스테이징 자동 배포
   - main → 프로덕션 자동 배포

## 🔄 업데이트 및 유지보수

### 의존성 업데이트
```bash
# 프론트엔드
cd frontend && npm update

# 백엔드
cd backend && pip install -r requirements.txt --upgrade
```

### 보안 패치
- GitHub Dependabot이 자동으로 보안 업데이트 PR 생성
- Trivy가 컨테이너 이미지 취약점 검사

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. GitHub Actions 로그
2. Docker 컨테이너 로그 (`make logs`)
3. 환경 변수 설정
4. 네트워크 연결 상태