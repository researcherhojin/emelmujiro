# Emelmujiro 프로젝트 초기 설정 가이드

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/emelmujiro.git
cd emelmujiro
```

### 2. 환경 변수 설정
```bash
# Backend 환경 변수
cp backend/.env.example backend/.env
cp backend/.env.example backend/.env.dev

# Frontend 환경 변수
cp frontend/.env.example frontend/.env
```

### 3. 의존성 설치
```bash
make install
# 또는
npm install
cd backend && pip install -r requirements.txt
```

### 4. 개발 서버 실행

#### Docker 사용 (권장)
```bash
make dev
# 또는
docker-compose -f docker-compose.dev.yml up
```

#### 로컬 실행
```bash
# 터미널 1 - Backend
cd backend
python manage.py migrate
python manage.py runserver

# 터미널 2 - Frontend
cd frontend
npm start
```

## 🔧 환경 변수 수정

### Backend (.env.dev)
```env
SECRET_KEY=django-insecure-dev-secret-key-change-in-production
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/emelmujiro_dev
REDIS_URL=redis://redis:6379/0
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/
REACT_APP_ENV=development
```

## 📋 자주 발생하는 문제 해결

### 1. "env file not found" 오류
```bash
cp backend/.env.example backend/.env.dev
cp frontend/.env.example frontend/.env
```

### 2. npm 취약점 경고
```bash
npm audit fix
# 심각한 변경사항이 있을 경우
npm audit fix --force
```

### 3. Python 패키지 충돌
```bash
# 가상 환경 사용 권장
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 4. Docker 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# 프로세스 종료
kill -9 <PID>
```

## 🛠️ 개발 도구

### VS Code 추천 확장
- Python
- Django
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### 유용한 명령어
```bash
# Django 관리자 계정 생성
make createsuperuser

# 데이터베이스 마이그레이션
make migrate

# Django 쉘
make shell

# 로그 확인
make logs

# 컨테이너 상태 확인
make ps
```

## 📝 Git Workflow

1. **브랜치 생성**
   ```bash
   git checkout -b feature/기능명
   ```

2. **커밋** (Husky가 자동으로 린트 실행)
   ```bash
   git add .
   git commit -m "feat: 새로운 기능 추가"
   ```

3. **푸시 및 PR**
   ```bash
   git push origin feature/기능명
   ```

## 🔍 추가 정보

자세한 CI/CD 설정은 [CI-CD-GUIDE.md](./CI-CD-GUIDE.md)를 참조하세요.