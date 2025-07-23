# Emelmujiro 프로젝트 문제 해결 가이드

## 🐳 Docker 관련 문제

### "Cannot connect to the Docker daemon" 오류

**문제**: 
```
Cannot connect to the Docker daemon at unix:///Users/hojinlee/.docker/run/docker.sock. Is the docker daemon running?
```

**해결방법**:

1. **Docker Desktop 시작**
   ```bash
   # macOS
   open -a Docker
   
   # 또는 Applications 폴더에서 Docker Desktop 직접 실행
   ```

2. **Docker 상태 확인**
   ```bash
   docker info
   ```

3. **자동 시작 스크립트 사용**
   ```bash
   make dev  # Docker를 자동으로 확인하고 시작
   ```

## 🔒 npm 보안 취약점

### 현재 알려진 취약점

1. **react-scripts 관련 취약점**
   - nth-check, postcss, webpack-dev-server
   - 이는 Create React App의 알려진 문제로, 프로덕션 빌드에는 영향 없음

2. **해결 방법**:
   ```bash
   # 안전한 취약점만 수정
   npm audit fix
   
   # 모든 취약점 수정 (breaking changes 포함 - 주의!)
   # npm audit fix --force
   ```

3. **대안**: 
   - 프로덕션 환경에서는 `npm run build`로 빌드한 정적 파일 사용
   - 개발 환경에서만 사용되는 취약점은 무시 가능

## 🚀 개발 환경 실행 방법

### 방법 1: Docker 사용 (권장)
```bash
# Docker Desktop이 실행 중인지 확인 후
make dev
```

### 방법 2: 로컬 실행
```bash
# Backend (터미널 1)
cd backend
python manage.py migrate
python manage.py runserver

# Frontend (터미널 2)
cd frontend
npm start
```

### 방법 3: npm scripts 사용
```bash
# Root 디렉토리에서
npm run dev  # 로컬 실행
npm run dev:docker  # Docker 실행
```

## 📋 자주 발생하는 문제

### 1. Python 패키지 충돌
```bash
# 가상환경 사용
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 2. 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 프로세스 종료
kill -9 <PID>
```

### 3. 환경 변수 누락
```bash
# 환경 변수 파일 생성
cp backend/.env.example backend/.env
cp backend/.env.example backend/.env.dev
cp frontend/.env.example frontend/.env
```

### 4. Docker 메모리 부족
Docker Desktop 설정에서 메모리 할당 증가:
- Preferences → Resources → Memory: 4GB 이상 권장

### 5. npm install 실패
```bash
# 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 💡 추가 팁

### VS Code에서 개발하기
1. Docker 확장 설치
2. Remote - Containers 확장 설치
3. `.devcontainer` 설정으로 컨테이너 내부에서 개발 가능

### 로그 확인
```bash
# Docker 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 데이터베이스 초기화
```bash
# 컨테이너와 볼륨 모두 삭제
docker-compose down -v

# 다시 시작
make dev
```